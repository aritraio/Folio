import { beforeEach, describe, it, expect, vi } from 'vitest';
import {
  initStorage,
  eraseAllData,
  saveAccount,
  getAccounts,
  getTransactions,
  saveTransaction,
  updateTransaction,
  exportAllData,
  importData,
  saveSettings,
  getSettings,
} from './storage';
import { parseStatement, commitStatement, duplicateCandidate, undoStatement, getImports } from './statements';
import { saveGoal, getPlanning, saveRecurring } from './planning';
import { workspace } from './workspace';
import { financialSummary, nextOccurrence } from '../utils/financeV2';
import { inferQuestion, answerQuestion } from './assistant';
let account;
const sample =
  'Date,Description,Amount,Type,Category\n2026-01-10,"Cafe, Delhi",-250.25,expense,Food & Dining\n2026-01-11,Salary,5000,income,Salary\n';
beforeEach(() => {
  localStorage.clear();
  eraseAllData();
  account = saveAccount({ name: 'Bank', type: 'savings', balance: 10000 });
});
describe('V2 ledger and storage isolation', () => {
  it('never reads or writes assignment storage and keeps personal data after reload', () => {
    localStorage.setItem('ledger_transactions', 'keep assignment');
    saveSettings({ userName: 'Personal name' });
    saveTransaction({ type: 'expense', amount: 10, accountId: account.id, date: '2026-01-01' });
    initStorage();
    expect(getTransactions()).toHaveLength(1);
    expect(getSettings().userName).toBe('Personal name');
    expect(localStorage.getItem('ledger_transactions')).toBe('keep assignment');
  });
  it('rolls back transactions and accounts if the envelope commit fails', () => {
    const original = localStorage.setItem;
    const spy = vi.spyOn(localStorage, 'setItem').mockImplementation(function (key, value) {
      if (key.startsWith('folio_v2_workspace:')) throw new Error('quota');
      return original.call(this, key, value);
    });
    expect(() => saveTransaction({ type: 'expense', amount: 40, accountId: account.id })).toThrow('quota');
    spy.mockRestore();
    expect(getTransactions()).toHaveLength(0);
    expect(getAccounts()[0].balance).toBe(10000);
  });
  it('handles card purchase, repayment, overpayment and cash advances', () => {
    const card = saveAccount({ name: 'Card', type: 'credit', balance: 0 });
    saveTransaction({ type: 'expense', amount: 100, accountId: card.id });
    saveTransaction({ type: 'transfer', amount: 150, accountId: account.id, toAccountId: card.id });
    expect(getAccounts().find((a) => a.id === card.id).balance).toBe(-50);
    expect(financialSummary(getAccounts(), []).netWorth).toBe(9900);
    saveTransaction({ type: 'transfer', amount: 200, accountId: card.id, toAccountId: account.id });
    expect(getAccounts().find((a) => a.id === card.id).balance).toBe(150);
    expect(financialSummary(getAccounts(), []).netWorth).toBe(9900);
  });
  it('counts investment holdings exactly once', () => {
    expect(
      financialSummary(
        [
          { type: 'investment', balance: 2000 },
          { type: 'cash', balance: 100 },
        ],
        [{ currentValue: 2100, investedValue: 2000 }]
      ).netWorth
    ).toBe(2200);
  });
});
describe('reviewed statement import', () => {
  it('parses quotes, decimals and explicit dates; rejects invalid dates', () => {
    const rows = parseStatement(sample);
    expect(rows[0].merchant).toBe('Cafe, Delhi');
    expect(rows[0].amount).toBe(250.25);
    expect(parseStatement('Date,Description,Debit,Credit\n31/02/2026,Cafe,20,')[0].error).toMatch(/date/);
    expect(() => parseStatement('Date,Description,Amount\n"unfinished')).toThrow(/Unclosed/);
  });
  it('preserves balances for historic imports and supports idempotency/undo', () => {
    const rows = parseStatement(sample);
    commitStatement({ rows, accountId: account.id, mode: 'history', id: 'import1' });
    expect(getAccounts()[0].balance).toBe(10000);
    expect(getTransactions()).toHaveLength(2);
    expect(duplicateCandidate(rows[0], account.id)).toBe(true);
    expect(() => commitStatement({ rows, accountId: account.id, mode: 'history', id: 'import1' })).toThrow(
      /already/
    );
    undoStatement('import1');
    expect(getTransactions()).toHaveLength(0);
    expect(getAccounts()[0].balance).toBe(10000);
    expect(getImports()[0].status).toBe('undone');
  });
  it('applies selected transactions and refuses undo of edited rows', () => {
    const rows = parseStatement(sample);
    commitStatement({ rows, accountId: account.id, mode: 'apply', id: 'import2' });
    expect(getAccounts()[0].balance).toBe(14749.75);
    updateTransaction({ ...getTransactions()[0], amount: 45 });
    expect(() => undoStatement('import2')).toThrow(/edited/);
    expect(getTransactions()).toHaveLength(2);
  });
  it('rejects incomplete review before any writes', () => {
    const rows = parseStatement(sample);
    rows[0].category = '';
    expect(() => commitStatement({ rows, accountId: account.id, mode: 'apply' })).toThrow(/Resolve/);
    expect(getTransactions()).toHaveLength(0);
  });
});
describe('plans and assistant grounding', () => {
  it('prevents goal over-allocation and persists planning in backups', () => {
    saveGoal({ name: 'Laptop', accountId: account.id, target: 20000, allocated: 8000 });
    expect(() => saveGoal({ name: 'Trip', accountId: account.id, target: 20000, allocated: 3000 })).toThrow(
      /more than/
    );
    const backup = exportAllData();
    eraseAllData();
    importData(backup);
    expect(getPlanning().goals[0].name).toBe('Laptop');
  });
  it('recurrence clamps month end and never posts expenses', () => {
    saveRecurring({ name: 'Rent', amount: 2000, nextDue: '2026-01-31', frequency: 'monthly' });
    expect(nextOccurrence('2026-01-31', 'monthly')).toBe('2026-02-28');
    expect(getTransactions()).toHaveLength(0);
  });
  it('finds tagged people without including transfers or inventing matches', () => {
    const data = {
      transactions: [
        {
          type: 'expense',
          date: '2026-01-10',
          amount: 200,
          person: 'Riya',
          merchant: 'Cafe',
          category: 'Food & Dining',
        },
        { type: 'transfer', date: '2026-01-10', amount: 500, person: 'Riya' },
      ],
    };
    const intent = inferQuestion('How much did I spend on Riya?', data.transactions, '2026-01');
    const answer = answerQuestion(intent, data);
    expect(answer.amount).toBe(200);
    expect(answer.evidence.count).toBe(1);
    expect(answerQuestion({ ...intent, term: 'No such person' }, data).amount).toBe(0);
  });
  it('calculates scenarios and routes literacy questions to sourced lessons', () => {
    const data = {
      transactions: [{ type: 'expense', date: '2026-01-10', amount: 250, category: 'Shopping' }],
    };
    expect(
      answerQuestion(inferQuestion('How can I reduce spending?', data.transactions, '2026-01'), data).amount
    ).toBe(25);
    expect(inferQuestion('Explain mutual funds', [], '2026-01').term).toBe('mutual-funds');
  });
  it('keeps plans and import metadata scoped to the active profile', () => {
    workspace.setItem(
      'planning_sagnik',
      JSON.stringify({ goals: [], recurring: [], completedLessons: ['tax'] })
    );
    expect(getPlanning().completedLessons).toEqual(['tax']);
  });
});
