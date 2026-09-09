import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { formatINR, formatPercent } from '@/utils/formatCurrency';
import {
  calcMonthlyExpenses,
  calcMonthlyIncome,
  calcCategoryBreakdown,
  calcLiquidity,
  detectRecurring,
} from '@/utils/calculations';
import { format, subMonths } from 'date-fns';

/**
 * Ledger Insights (§13, §75–§77) — evidence-backed, never vague.
 * Every insight: title + explanation + supporting numbers + time comparison
 * + confidence/qualification + action link where useful.
 */
function InsightRow({ eyebrow, title, body, meta, to, toLabel, tone }) {
  const dot = tone === 'alert' ? 'bg-brand-red' : tone === 'positive' ? 'bg-brand-emerald' : 'bg-brand-amber';
  return (
    <article className="py-5 first:pt-1 last:pb-1 border-b border-ivory-border dark:border-surface-dark-border last:border-0">
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} aria-hidden="true" />
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-secondary dark:text-text-dark-secondary">
          {eyebrow}
        </p>
      </div>
      <h3 className="text-[15px] font-semibold text-zinc-900 dark:text-text-dark-primary leading-snug">
        {title}
      </h3>
      <p className="text-sm text-text-secondary dark:text-text-dark-secondary leading-relaxed mt-1">{body}</p>
      <div className="mt-2 flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs mono text-zinc-700 dark:text-text-dark-secondary">{meta}</p>
        {to && (
          <Link
            to={to}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-amber hover:text-brand-amber-hover transition-colors"
          >
            {toLabel || 'View transactions'}
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>
    </article>
  );
}

export default function FinancialInsights({ transactions = [], accounts = [], netWorth = 0 }) {
  const insights = useMemo(() => {
    const now = new Date();
    const currentMonth = format(now, 'yyyy-MM');
    const lastMonth = format(subMonths(now, 1), 'yyyy-MM');

    const out = [];
    const currentExpenses = calcMonthlyExpenses(transactions, currentMonth);
    const lastExpenses = calcMonthlyExpenses(transactions, lastMonth);
    const income = calcMonthlyIncome(transactions, currentMonth);
    const breakdown = calcCategoryBreakdown(transactions, currentMonth);

    // 1. Spending anomaly vs baseline (3-mo avg ex-current would be ideal; use last month + avg)
    if (breakdown.length > 0) {
      const top = breakdown[0];
      const topPrev = calcCategoryBreakdown(transactions, lastMonth).find((c) => c.category === top.category);
      if (topPrev && topPrev.amount > 0) {
        const delta = ((top.amount - topPrev.amount) / topPrev.amount) * 100;
        if (Math.abs(delta) >= 15) {
          out.push({
            eyebrow: top.category,
            title: delta > 0 ? `${top.category} spending is elevated` : `${top.category} spending cooled off`,
            body:
              delta > 0
                ? `Your ${top.category.toLowerCase()} spending runs above its recent baseline. Worth a glance before it becomes a habit.`
                : `Your ${top.category.toLowerCase()} spending dropped versus last month — the trend is moving the right way.`,
            meta: `${formatINR(top.amount)} this month · ${formatPercent(delta, 0)} vs ${formatINR(topPrev.amount)} last month`,
            to: `/transactions?search=${encodeURIComponent(top.category)}`,
            tone: delta > 0 ? 'alert' : 'positive',
          });
        }
      } else if (top) {
        const count = transactions.filter(
          (t) =>
            t.type === 'expense' && String(t.date).slice(0, 7) === currentMonth && t.category === top.category
        ).length;
        out.push({
          eyebrow: top.category,
          title: `${top.category} leads spending`,
          body: `Most of this month's outflow concentrates in one category.`,
          meta: `${formatINR(top.amount)} across ${count} transaction${count === 1 ? '' : 's'} · ${top.percentage.toFixed(0)}% of spend`,
          to: `/transactions?search=${encodeURIComponent(top.category)}`,
          tone: 'neutral',
        });
      }
    } else if (currentExpenses === 0 && income > 0) {
      out.push({
        eyebrow: 'Spending',
        title: 'No spending recorded yet',
        body: 'Income is in, but no expenses are categorised for this month. Add transactions to unlock patterns.',
        meta: `${formatINR(income)} income · ${formatINR(0)} tracked spend`,
        to: '/transactions',
        toLabel: 'Add transactions',
        tone: 'neutral',
      });
    }

    // 2. Recurring detection with confidence (§26, §76)
    const recurring = detectRecurring(transactions);
    if (recurring.length > 0) {
      const r = recurring[0];
      out.push({
        eyebrow: 'Recurring',
        title: `${r.merchant} · ${formatINR(r.amount)}/month`,
        body:
          r.confidence === 'High confidence'
            ? `Charged ${r.count} times at a stable amount. Looks like a subscription.`
            : `Seen ${r.count} times at a similar amount — a possible pattern, not yet confirmed.`,
        meta: `${r.count} occurrences · ${r.confidence} · next expected ${r.nextExpected}`,
        to: `/transactions?search=${encodeURIComponent(r.merchant)}`,
        tone: 'neutral',
      });
    }

    // 3. Liquidity (§16) — precise, no "safe" claims without definition
    const { liquidAssets, obligations, coverage } = calcLiquidity(accounts);
    if (obligations > 0) {
      out.push({
        eyebrow: 'Liquidity',
        title: liquidAssets >= obligations ? 'Well buffered' : 'Tight coverage',
        body: `Your current liquid assets cover listed card obligations by ${coverage}×.`,
        meta: `${formatINR(liquidAssets)} liquid · ${formatINR(obligations)} obligations · ${coverage}× coverage`,
        to: '/accounts',
        toLabel: 'View accounts',
        tone: liquidAssets >= obligations ? 'positive' : 'alert',
      });
    } else if (liquidAssets > 0) {
      out.push({
        eyebrow: 'Liquidity',
        title: 'No card dues outstanding',
        body: 'Nothing owed on tracked credit accounts right now.',
        meta: `${formatINR(liquidAssets)} liquid assets`,
        to: '/accounts',
        toLabel: 'View accounts',
        tone: 'positive',
      });
    }

    // 4. Savings context when meaningful
    if (income > 0 && lastExpenses > 0) {
      const change = ((currentExpenses - lastExpenses) / lastExpenses) * 100;
      if (out.length < 4) {
        out.push({
          eyebrow: 'Cash flow',
          title:
            change >= 0
              ? `Spending up ${Math.abs(change).toFixed(0)}%`
              : `Spending down ${Math.abs(change).toFixed(0)}%`,
          body: `From ${formatINR(lastExpenses)} last month to ${formatINR(currentExpenses)} this month, on ${formatINR(income)} income.`,
          meta: `${formatINR(income - currentExpenses)} net this month`,
          to: '/analytics',
          toLabel: 'Open analytics',
          tone: change > 20 ? 'alert' : 'neutral',
        });
      }
    }

    void netWorth;
    return out.slice(0, 3);
  }, [transactions, accounts, netWorth]);

  if (insights.length === 0) return null;

  return (
    <section
      className="animate-fade-in-up section-divider pt-6"
      aria-label="Ledger insights"
      style={{ animationDelay: '0.3s' }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-amber" aria-hidden="true" />
          <h2 className="heading-sm text-zinc-900 dark:text-text-dark-primary">Ledger Insights</h2>
        </div>
        <span className="text-xs text-text-tertiary dark:text-text-dark-tertiary">
          {insights.length} thing{insights.length === 1 ? '' : 's'} worth knowing
        </span>
      </div>
      <div>
        {insights.map((ins, i) => (
          <InsightRow key={i} {...ins} />
        ))}
      </div>
    </section>
  );
}
