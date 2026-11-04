import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Send, ArrowUpRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { PageHeading, Panel } from '../components/ui/WorkspaceUI';
import { currentMonth } from '../utils/financeV2';
import { formatMoney } from '../utils/formatCurrency';
import { inferQuestion, answerQuestion } from '../services/assistant';
import { api, cloudStatus } from '../services/cloud';
export default function AssistantPage() {
  const data = useData(),
    [question, setQuestion] = useState(''),
    [month, setMonth] = useState(currentMonth()),
    [messages, setMessages] = useState([]),
    [busy, setBusy] = useState(false),
    [ai, setAi] = useState(false),
    [status, setStatus] = useState(null),
    [error, setError] = useState('');
  const requestId = useRef(0),
    profile = useRef(data.activeProfileId);
  useEffect(() => {
    cloudStatus()
      .then(setStatus)
      .catch(() => setStatus(null));
  }, []);
  useEffect(() => {
    profile.current = data.activeProfileId;
    requestId.current++;
    setMessages([]);
    setAi(false);
    setBusy(false);
    setError('');
  }, [data.activeProfileId]);
  async function ask(e, preset) {
    e?.preventDefault();
    const q = (preset || question).trim();
    if (!q || busy) return;
    setBusy(true);
    setError('');
    setQuestion('');
    const id = ++requestId.current,
      p = profile.current;
    try {
      let intent = inferQuestion(q, data.transactions, month);
      if (ai) {
        const result = await api('assistant', {
          method: 'POST',
          body: JSON.stringify({ question: q, month, consent: true }),
        });
        intent = result.intent;
      }
      const answer = answerQuestion(intent, data);
      if (id === requestId.current && p === profile.current)
        setMessages((m) => [
          ...m,
          {
            question: q,
            answer,
            mode: ai ? 'AI interpreted · ledger calculated' : 'Local helper · ledger calculated',
          },
        ]);
    } catch (e) {
      if (id === requestId.current)
        setError(e.message + ' Your question was not answered; you can retry or turn off AI.');
    } finally {
      if (id === requestId.current) setBusy(false);
    }
  }
  const months = [
    ...new Set([currentMonth(), ...data.transactions.map((t) => t.date?.slice(0, 7)).filter(Boolean)]),
  ]
    .sort()
    .reverse();
  return (
    <div className="v-stack v-chat-page">
      <PageHeading
        title="A clearer conversation about money."
        description="Your records. Understandable answers. One question at a time."
      />
      <div className="v-row">
        <span className="v-tag">
          <ShieldCheck size={14} />
          {ai ? 'AI understanding enabled' : 'Private local helper'}
        </span>
        <label className="v-inline-field">
          Period
          <select value={month} onChange={(e) => setMonth(e.target.value)} aria-label="Assistant period">
            {months.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
      </div>
      <Panel>
        <div className="v-assistant-welcome">
          <span className="v-icon-tile">
            <MessageCircle size={23} />
          </span>
          <h2>What would you like to understand?</h2>
          <p className="v-muted">
            Ask about spending, a merchant or a person tagged in your transactions. Learn the basics without
            leaving Folio.
          </p>
        </div>
        <div className="v-prompts">
          {[
            'How much did I spend this month?',
            'How can I reduce my spending?',
            'How much did I spend at Zomato?',
            'Explain mutual funds',
          ].map((q) => (
            <button key={q} disabled={busy} onClick={() => ask(null, q)}>
              {q}
              <ArrowUpRight size={14} />
            </button>
          ))}
        </div>
      </Panel>
      <div className="v-conversation" aria-live="polite" aria-busy={busy}>
        {messages.map((m, i) => (
          <div className="v-chat-turn" key={i}>
            <div className="v-user-message">{m.question}</div>
            <Panel>
              <span className="v-caption">
                <Sparkles size={13} /> {m.mode}
              </span>
              <h2>{m.answer.title}</h2>
              {m.answer.amount !== undefined && (
                <p className="v-large-money">{formatMoney(m.answer.amount)}</p>
              )}
              <p className="v-answer-body">{m.answer.body}</p>
              {m.answer.income !== undefined && (
                <p className="v-caption">Recorded income: {formatMoney(m.answer.income)}</p>
              )}
              {m.answer.evidence && (
                <Link to={m.answer.evidence.path} className="v-text-link">
                  View matching activity ({m.answer.evidence.count})<ArrowUpRight size={14} />
                </Link>
              )}
              {m.answer.lesson && (
                <Link to={`/learn?lesson=${m.answer.lesson}`} className="v-text-link">
                  Read lesson and official references <ArrowUpRight size={14} />
                </Link>
              )}
            </Panel>
          </div>
        ))}
      </div>
      {error && (
        <p role="alert" className="v-error">
          {error}
        </p>
      )}
      <form className="v-chat-compose" onSubmit={ask}>
        <label className="sr-only" htmlFor="money-question">
          Ask about your money
        </label>
        <input
          id="money-question"
          maxLength={600}
          placeholder="Ask about your spending…"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={busy}
        />
        <button className="v-button v-primary" type="submit" disabled={busy || !question.trim()}>
          <Send size={17} />
          <span>{busy ? 'Thinking…' : 'Ask'}</span>
        </button>
      </form>
      <div className="v-notice">
        <label className="v-checkbox">
          <input
            type="checkbox"
            checked={ai}
            disabled={!status?.user || !status?.ai}
            onChange={(e) => setAi(e.target.checked)}
          />
          <span>Use AI to understand my questions</span>
        </label>
        <p className="v-caption">
          When enabled, your question and selected month go to OpenAI through the authenticated server. Ledger
          records and account numbers stay in the app; amounts are calculated locally. Questions can contain
          personal information. Chat is kept only until you leave this page.
        </p>
        {!status?.user && (
          <Link className="v-text-link" to="/login">
            Cloud sign-in and configured AI are required for AI mode.
          </Link>
        )}
        <p className="v-caption">
          Local mode uses supported question patterns. No payments, stock picks or personal tax calculations.
        </p>
      </div>
    </div>
  );
}
