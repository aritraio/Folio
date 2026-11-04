import { describe, it, expect, vi, afterEach } from 'vitest';
import worker from './worker';
const env = {
  SUPABASE_URL: 'https://auth.example.test',
  SUPABASE_ANON_KEY: 'public-key',
  OPENAI_API_KEY: 'test-server-only',
  OPENAI_MODEL: 'configured-model',
};
const request = (path, body = {}, headers = {}) =>
  new Request(`https://folio.test/api/${path}`, {
    method: 'POST',
    headers: {
      Origin: 'https://folio.test',
      'Content-Type': 'application/json',
      Cookie: 'folio_access=test-token',
      ...headers,
    },
    body: JSON.stringify(body),
  });
afterEach(() => vi.unstubAllGlobals());
describe('cloud security boundary', () => {
  it('reports unavailable configuration without exposing secrets', async () => {
    const r = await worker.fetch(new Request('https://folio.test/api/session'), {});
    expect(await r.json()).toEqual({ configured: false, ai: false, user: null });
  });
  it('rejects cross-origin mutations before any external calls', async () => {
    const mock = vi.fn();
    vi.stubGlobal('fetch', mock);
    const r = await worker.fetch(request('assistant', {}, { Origin: 'https://evil.test' }), env);
    expect(r.status).toBe(403);
    expect(mock).not.toHaveBeenCalled();
  });
  it('requires authentication before AI provider access', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 401 })));
    const r = await worker.fetch(
      request('assistant', { question: 'spending', month: '2026-01', consent: true }),
      env
    );
    expect(r.status).toBe(401);
  });
  it('enforces processing consent and quota before AI calls', async () => {
    const mock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 'u' })))
      .mockResolvedValueOnce(new Response('false'));
    vi.stubGlobal('fetch', mock);
    const r = await worker.fetch(
      request('assistant', { question: 'spending', month: '2026-01', consent: true }),
      env
    );
    expect(r.status).toBe(429);
    expect(mock).toHaveBeenCalledTimes(2);
  });
  it('uses structured intent, without ledger data or write tools', async () => {
    const intent = { action: 'merchant', term: 'Riya', month: '2026-01' };
    const mock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 'u' })))
      .mockResolvedValueOnce(new Response('true'))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: 'completed',
            output: [{ content: [{ type: 'output_text', text: JSON.stringify(intent) }] }],
          })
        )
      );
    vi.stubGlobal('fetch', mock);
    const r = await worker.fetch(
      request('assistant', { question: 'Spent on Riya?', month: '2026-01', consent: true }),
      env
    );
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ intent });
    const sent = JSON.parse(mock.mock.calls[2][1].body);
    expect(sent.store).toBe(false);
    expect(sent.tools).toBeUndefined();
    expect(sent.text.format.strict).toBe(true);
    expect(JSON.stringify(sent)).not.toContain('ledger_transactions');
  });
  it('scopes cloud reads to the verified user JWT and ID', async () => {
    const mock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 'user-a' })))
      .mockResolvedValueOnce(new Response('[]'));
    vi.stubGlobal('fetch', mock);
    const r = await worker.fetch(
      new Request('https://folio.test/api/workspace', { headers: { Cookie: 'folio_access=token' } }),
      env
    );
    expect(r.status).toBe(200);
    expect(mock.mock.calls[1][0]).toContain('user_id=eq.user-a');
    expect(mock.mock.calls[1][1].headers.Authorization).toBe('Bearer token');
  });
});
