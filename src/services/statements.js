import { workspace, atomic } from './workspace';
import {
  getActiveProfileId,
  getTransactions,
  getAccounts,
  saveTransaction,
  deleteTransaction,
  generateId,
  notifyDataUpdated,
} from './storage';
import { DEFAULT_CATEGORIES } from '../constants/finance';
import { localDate } from '../utils/financeV2';
export function parseCSV(text) {
  const rows = [];
  let row = [],
    cell = '',
    quote = false;
  const s = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '"') {
      if (quote && s[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (quote || cell === '') quote = !quote;
      else throw new Error('Unexpected quote in CSV.');
    } else if (c === ',' && !quote) {
      row.push(cell);
      cell = '';
    } else if ((c === '\n' || c === '\r') && !quote) {
      if (c === '\r' && s[i + 1] === '\n') i++;
      row.push(cell);
      if (row.some((x) => x.trim())) rows.push(row);
      row = [];
      cell = '';
    } else cell += c;
  }
  if (quote) throw new Error('Unclosed quoted CSV field.');
  row.push(cell);
  if (row.some((x) => x.trim())) rows.push(row);
  return rows;
}
export function validDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const d = new Date(date + 'T12:00:00Z');
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === date;
}
function numeric(value) {
  const clean = String(value ?? '')
    .trim()
    .replace(/,/g, '');
  if (!clean) return 0;
  if (!/^[+-]?\d+(?:\.\d{1,2})?$/.test(clean)) return NaN;
  return Number(clean);
}
export function parseStatement(text, dateOrder = 'DMY') {
  const matrix = parseCSV(text);
  if (matrix.length < 2) throw new Error('The CSV needs a header and at least one transaction.');
  if (matrix.length > 1001) throw new Error('Import at most 1,000 transactions at a time.');
  const headers = matrix.shift().map((h) => h.toLowerCase().replace(/[^a-z]/g, ''));
  const col = (...names) => headers.findIndex((h) => names.includes(h));
  const d = col('date', 'transactiondate', 'valuedate', 'postingdate'),
    description = col('description', 'merchant', 'narration', 'particulars'),
    amount = col('amount'),
    debit = col('debit', 'withdrawal', 'withdrawalamount'),
    credit = col('credit', 'deposit', 'depositamount'),
    type = col('type'),
    category = col('category');
  if (d < 0 || description < 0 || (amount < 0 && debit < 0 && credit < 0))
    throw new Error(
      'Required columns: Date, Description, and either signed Amount or Debit/Credit. Download the template for an example.'
    );
  return matrix.map((r, i) => {
    let date = (r[d] || '').trim();
    const m = date.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (m)
      date = `${m[3]}-${String(dateOrder === 'DMY' ? m[2] : m[1]).padStart(2, '0')}-${String(dateOrder === 'DMY' ? m[1] : m[2]).padStart(2, '0')}`;
    let value = amount >= 0 ? numeric(r[amount]) : 0,
      kind = type >= 0 ? (r[type] || '').trim().toLowerCase() : '';
    let error = '';
    if (amount < 0) {
      const dr = debit >= 0 ? numeric(r[debit]) : 0,
        cr = credit >= 0 ? numeric(r[credit]) : 0;
      if (!Number.isFinite(dr) || !Number.isFinite(cr) || dr < 0 || cr < 0 || (dr > 0 && cr > 0))
        error = 'Invalid debit/credit values';
      value = cr - dr;
    }
    if (!kind) kind = value < 0 ? 'expense' : 'income';
    if (!['income', 'expense', 'transfer'].includes(kind)) error = 'Type must be income, expense or transfer';
    const name = (r[description] || '').trim();
    if (!validDate(date) || date > localDate()) error = 'Use a valid posting date, no later than today';
    if (!name) error = 'Missing description';
    if (!Number.isFinite(value) || value === 0 || Math.abs(value) > 100000000)
      error = 'Check the amount (up to two decimal places)';
    const originalCategory = category >= 0 ? (r[category] || '').trim() : '';
    const guess = DEFAULT_CATEGORIES.includes(originalCategory)
      ? originalCategory
      : suggestCategory(name, kind);
    return {
      id: `row-${i}`,
      date,
      merchant: name.slice(0, 200),
      amount: Math.abs(value),
      type: kind,
      category: guess,
      toAccountId: '',
      error,
      selected: !error,
      sourceRow: i + 2,
    };
  });
}
export function suggestCategory(name, type) {
  if (type === 'income') return /salary/i.test(name) ? 'Salary' : 'Other';
  const rules = [
    [/zomato|swiggy|cafe|restaurant|grocery|dining/i, 'Food & Dining'],
    [/uber|metro|rapido|fuel/i, 'Transport'],
    [/rent|electric|recharge|subscription|bill/i, 'Bills & Utilities'],
    [/amazon|flipkart|shopping/i, 'Shopping'],
    [/sip|mutual fund/i, 'Investment'],
  ];
  return rules.find(([re]) => re.test(name))?.[1] || '';
}
export function signature(t) {
  return JSON.stringify([
    t.date,
    t.merchant || t.description || '',
    Math.round(Number(t.amount) * 100),
    t.type,
    t.accountId,
    t.toAccountId || '',
    t.category || '',
    t.balanceImpact || 'apply',
    t.notes || '',
    t.person || '',
  ]);
}
export function duplicateCandidate(row, accountId, transactions = getTransactions()) {
  return transactions.some(
    (t) =>
      t.accountId === accountId &&
      t.date === row.date &&
      Math.round(t.amount * 100) === Math.round(row.amount * 100) &&
      t.type === row.type &&
      (t.merchant || t.description || '').trim().toLowerCase() === row.merchant.trim().toLowerCase()
  );
}
const historyKey = () => `imports_${getActiveProfileId()}`;
export const getImports = () => JSON.parse(workspace.getItem(historyKey()) || '[]');
export function commitStatement({ rows, accountId, mode, id = generateId('import'), name }) {
  const selected = rows.filter((r) => r.selected),
    accounts = getAccounts();
  if (!accounts.some((a) => a.id === accountId)) throw new Error('Choose a valid account.');
  if (!selected.length) throw new Error('Select at least one row.');
  if (!['history', 'apply'].includes(mode)) throw new Error('Choose how this import affects balances.');
  if (getImports().some((j) => j.id === id)) throw new Error('This import was already committed.');
  for (const row of selected) {
    if (
      row.error ||
      !validDate(row.date) ||
      row.date > localDate() ||
      !Number.isFinite(row.amount) ||
      row.amount <= 0 ||
      !['expense', 'income', 'transfer'].includes(row.type) ||
      !DEFAULT_CATEGORIES.includes(row.category)
    )
      throw new Error('Resolve all selected rows before importing.');
    if (
      row.type === 'transfer' &&
      (!accounts.some((a) => a.id === row.toAccountId) || row.toAccountId === accountId)
    )
      throw new Error('Transfers need a different destination account.');
  }
  const result = atomic(() => {
    const items = selected.map((row) => {
      const tx = saveTransaction({
        date: row.date,
        merchant: row.merchant,
        description: row.merchant,
        amount: row.amount,
        type: row.type,
        category: row.category,
        accountId,
        toAccountId: row.type === 'transfer' ? row.toAccountId : undefined,
        balanceImpact: mode,
        importId: id,
      });
      return { id: tx.id, signature: signature(tx) };
    });
    const job = {
      id,
      name: name || 'Statement',
      createdAt: new Date().toISOString(),
      accountId,
      mode,
      items,
      status: 'imported',
    };
    workspace.setItem(historyKey(), JSON.stringify([job, ...getImports()]));
    return job;
  });
  notifyDataUpdated();
  return result;
}
export function undoStatement(id) {
  const history = getImports(),
    job = history.find((j) => j.id === id);
  if (!job || job.status !== 'imported') throw new Error('This import is not available to undo.');
  const txs = getTransactions();
  if (
    job.items.some((item) => {
      const tx = txs.find((t) => t.id === item.id);
      return !tx || signature(tx) !== item.signature;
    })
  )
    throw new Error(
      'Some imported transactions were edited or deleted. Review them individually before undoing; no changes were made.'
    );
  atomic(() => {
    job.items.forEach((item) => deleteTransaction(item.id));
    workspace.setItem(
      historyKey(),
      JSON.stringify(history.map((j) => (j.id === id ? { ...j, status: 'undone' } : j)))
    );
  });
  notifyDataUpdated();
}
