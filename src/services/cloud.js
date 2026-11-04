export async function api(path, options = {}) {
  const response = await fetch(`/api/${path}`, {
    ...options,
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const type = response.headers.get('content-type') || '';
  if (!type.includes('application/json'))
    throw new Error('Cloud services are not configured on this host. Local features still work.');
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'The request could not be completed.');
  return data;
}
export const cloudStatus = () => api('session');
