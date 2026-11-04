import { calcInvestmentReturn } from './calculations';
export const roundMoney = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;
export const localDate = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
export const currentMonth = () => localDate().slice(0, 7);
export function financialSummary(accounts, investments) {
  // Investment account balances are aggregate valuations; holdings replace them when present.
  const liquid = accounts
    .filter((a) => !['credit', 'investment'].includes(a.type))
    .reduce((s, a) => s + Number(a.balance || 0), 0);
  const credit = accounts.filter((a) => a.type === 'credit').reduce((s, a) => s + Number(a.balance || 0), 0);
  const portfolio = investments.length
    ? calcInvestmentReturn(investments).totalCurrent
    : accounts.filter((a) => a.type === 'investment').reduce((s, a) => s + Number(a.balance || 0), 0);
  return {
    liquid: roundMoney(liquid),
    portfolio: roundMoney(portfolio),
    debt: Math.max(0, credit),
    netWorth: roundMoney(liquid + portfolio - credit),
  };
}
export function spendingRows(transactions, month) {
  return transactions.filter(
    (t) => t.type === 'expense' && t.category !== 'Investment' && (!month || t.date?.startsWith(month))
  );
}
export function monthTotals(transactions, month) {
  return {
    income: roundMoney(
      transactions
        .filter((t) => t.type === 'income' && (!month || t.date?.startsWith(month)))
        .reduce((s, t) => s + t.amount, 0)
    ),
    spending: roundMoney(spendingRows(transactions, month).reduce((s, t) => s + t.amount, 0)),
  };
}
export function nextOccurrence(date, frequency) {
  const d = new Date(date + 'T12:00:00');
  if (frequency === 'weekly') d.setDate(d.getDate() + 7);
  else {
    const day = d.getDate();
    d.setDate(1);
    d.setMonth(d.getMonth() + (frequency === 'yearly' ? 12 : 1));
    const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    d.setDate(Math.min(day, last));
  }
  return localDate(d);
}
