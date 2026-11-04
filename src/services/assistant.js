import { monthTotals, spendingRows, currentMonth, roundMoney } from '../utils/financeV2';
import { lessons } from '../data/lessons';
const text = (t) => `${t.merchant || t.description || ''} ${t.person || ''} ${t.notes || ''}`.toLowerCase();
export function inferQuestion(question, transactions, selectedMonth = currentMonth()) {
  const q = question.toLowerCase();
  let month = selectedMonth;
  const explicit = q.match(/\b(20\d{2}-\d{2})\b/);
  if (explicit) month = explicit[1];
  else if (/all time|overall|ever/.test(q)) month = 'all';
  else if (/last month|previous month/.test(q)) {
    const d = new Date(selectedMonth + '-01T12:00:00');
    d.setMonth(d.getMonth() - 1);
    month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
  const lesson = lessons.find((l) => q.includes(l.id) || q.includes(l.title.toLowerCase()));
  if (/tax|mutual fund|\bsip\b|stock|diversif|liquidity|what is a budget/.test(q))
    return {
      action: 'learn',
      term:
        lesson?.id ||
        (/tax/.test(q) ? 'tax' : /mutual|sip/.test(q) ? 'mutual-funds' : /stock/.test(q) ? 'stocks' : 'risk'),
      month,
    };
  if (/reduce|cut|save more|spend less|saving tips/.test(q)) return { action: 'reduce', term: '', month };
  const quoted = question.match(/["“]([^"”]+)["”]/)?.[1];
  const named = question.match(
    /(?:spend|spent|paid|pay|sending|sent|give|given).*?\b(?:on|at|to|for|with)\s+(.+?)(?:\s+(?:this month|last month|in 20\d{2}|all time)|[?!.]|$)/i
  )?.[1];
  const known = [
    ...new Set(
      transactions.flatMap((t) => [t.person, t.merchant, t.description, t.category]).filter(Boolean)
    ),
  ]
    .sort((a, b) => b.length - a.length)
    .find((n) => q.includes(n.toLowerCase()));
  if (quoted || named || known) return { action: 'merchant', term: (quoted || known || named).trim(), month };
  if (/spend|spent|income|earn|balance|summary|money/.test(q)) return { action: 'spending', term: '', month };
  return { action: 'unsupported', term: '', month };
}
export function answerQuestion(intent, data) {
  const month = intent.month === 'all' ? null : intent.month,
    period = month || 'all recorded time';
  const rows = spendingRows(data.transactions, month),
    totals = monthTotals(data.transactions, month);
  const groups = Object.entries(
    rows.reduce((s, t) => ({ ...s, [t.category]: (s[t.category] || 0) + t.amount }), {})
  ).sort((a, b) => b[1] - a[1]);
  const evidence = (records, term) => ({
    path: `/transactions?${new URLSearchParams({ ...(month ? { month } : {}), ...(term ? { search: term } : {}) })}`,
    count: records.length,
  });
  if (intent.action === 'learn') {
    const l = lessons.find((l) => l.id === intent.term) || lessons[0];
    return {
      title: l.title,
      body: l.sections
        .map(([h, p]) => `${h}: ${p}`)
        .slice(0, 2)
        .join('\n\n'),
      lesson: l.id,
    };
  }
  if (intent.action === 'merchant') {
    const term = (intent.term || '').trim();
    if (!term)
      return {
        title: 'Who would you like to look up?',
        body: 'Ask “How much did I spend at Zomato?” or tag a transaction with a person’s name.',
      };
    const matched = rows.filter(
      (t) => text(t).includes(term.toLowerCase()) || t.category?.toLowerCase() === term.toLowerCase()
    );
    return {
      title: matched.length ? `Spending matching “${term}”` : 'No matching spending found',
      body: matched.length
        ? `I found ${matched.length} expense record${matched.length === 1 ? '' : 's'} matching this merchant, person, note or category in ${period}. This is based on recorded labels; I cannot infer who a payment was for if it is not recorded.`
        : `There are no matching expense records in ${period}. Try another period or add the person’s name to the transaction. Transfers are not counted as spending.`,
      amount: roundMoney(matched.reduce((s, t) => s + t.amount, 0)),
      evidence: evidence(matched, term),
    };
  }
  if (intent.action === 'reduce') {
    if (!groups.length)
      return {
        title: 'Start with a little history',
        body: `There is no everyday spending recorded for ${period}. Add transactions or review a statement import first.`,
      };
    const flexible = groups.find(([c]) =>
      ['Food & Dining', 'Shopping', 'Entertainment', 'Travel'].includes(c)
    );
    return {
      title: 'A small, measurable place to start',
      body: flexible
        ? `Your ${flexible[0]} spending is a useful category to review. Trying a 10% reduction would free up the amount shown below for this period. This is a scenario, not a prediction. Review the transactions and decide which purchases you are comfortable changing. Essential expenses may not be flexible.`
        : `Your largest recorded category is ${groups[0][0]}. Review its transactions before setting a realistic limit. I cannot determine which purchases are optional from the category alone.`,
      ...(flexible ? { amount: roundMoney(flexible[1] * 0.1) } : {}),
      evidence: {
        path: `/transactions?${new URLSearchParams({ ...(month ? { month } : {}), category: (flexible || groups[0])[0] })}`,
        count: rows.filter((t) => t.category === (flexible || groups[0])[0]).length,
      },
    };
  }
  if (intent.action === 'spending')
    return {
      title: `Your spending · ${period}`,
      body: `${rows.length} everyday expense records. Transfers and investment contributions are excluded. Recorded income is shown separately from spending. ${groups[0] ? `The largest spending category is ${groups[0][0]}.` : 'There are no expenses in this period.'}`,
      amount: totals.spending,
      income: totals.income,
      evidence: evidence(rows),
    };
  return {
    title: 'Let’s keep it about your money',
    body: 'I can summarize recorded spending, look up a merchant or tagged person, explore ways to spend less, and explain basic tax and investing concepts. Try “How much did I spend at Zomato last month?” I cannot move money, choose stocks or calculate your personal tax liability.',
  };
}
