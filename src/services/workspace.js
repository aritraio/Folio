// V2 never writes the assignment version's ledger_* browser keys.
const PREFIX = 'folio_v2_workspace:';
let scope = 'local';
let staged = null;
function read() {
  if (staged) return staged;
  const raw = localStorage.getItem(PREFIX + scope);
  if (!raw) return {};
  const value = JSON.parse(raw);
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Workspace is damaged. Restore a backup in Settings.');
  return value;
}
export const workspace = {
  getItem(key) {
    return read()[key] ?? null;
  },
  setItem(key, value) {
    const next = { ...read(), [key]: value };
    if (staged) staged = next;
    else localStorage.setItem(PREFIX + scope, JSON.stringify(next));
  },
  removeItem(key) {
    const next = { ...read() };
    delete next[key];
    if (staged) staged = next;
    else localStorage.setItem(PREFIX + scope, JSON.stringify(next));
  },
};
export function atomic(change) {
  if (staged) return change();
  staged = { ...read() };
  try {
    const result = change();
    localStorage.setItem(PREFIX + scope, JSON.stringify(staged));
    return result;
  } finally {
    staged = null;
  }
}
export function setWorkspaceScope(next) {
  scope = next || 'local';
}
export function getWorkspaceScope() {
  return scope;
}
export function snapshotWorkspace() {
  return { ...read() };
}
export function restoreWorkspace(value) {
  localStorage.setItem(PREFIX + scope, JSON.stringify(value));
}

export const isStaging = () => staged !== null;
