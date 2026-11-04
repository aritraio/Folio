import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Upload, ArrowLeftRight, CreditCard, CalendarDays, Sparkles } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useData } from '../contexts/DataContext';
import { getPlanning } from '../services/planning';
import { PageHeading, Panel, Metric, Progress } from '../components/ui/WorkspaceUI';
import { currentMonth, financialSummary, monthTotals, spendingRows } from '../utils/financeV2';
import { formatMoney } from '../utils/formatCurrency';
import useChartTheme from '../utils/useChartTheme';
export default function DashboardPage() {
  const { transactions, accounts, investments, budgets, settings } = useData(),
    navigate = useNavigate(),
    chart = useChartTheme();
  const [month, setMonth] = useState(currentMonth());
  const months = [
    ...new Set([currentMonth(), ...transactions.map((t) => t.date?.slice(0, 7)).filter(Boolean)]),
  ]
    .sort()
    .reverse();
  const summary = financialSummary(accounts, investments),
    totals = monthTotals(transactions, month),
    plan = getPlanning();
  const categories = Object.entries(
    spendingRows(transactions, month).reduce(
      (a, t) => ({ ...a, [t.category]: (a[t.category] || 0) + t.amount }),
      {}
    )
  ).sort((a, b) => b[1] - a[1]);
  const flow = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(month + '-01T12:00:00');
    d.setMonth(d.getMonth() - 5 + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return { key, label: d.toLocaleString('en', { month: 'short' }), ...monthTotals(transactions, key) };
  });
  const activity = transactions
    .filter((t) => t.date?.startsWith(month))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);
  const bills = [
    ...plan.recurring.map((r) => ({ ...r, date: r.nextDue })),
    ...accounts
      .filter((a) => a.type === 'credit' && a.dueDate)
      .map((a) => ({ id: a.id, name: a.name, amount: a.statementBalance ?? null, date: a.dueDate })),
  ]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);
  const budget = budgets.reduce((s, b) => s + b.limit, 0);
  const detail = (category, key = month) =>
    navigate(`/transactions?${new URLSearchParams({ month: key, ...(category ? { category } : {}) })}`);
  return (
    <div className="v-stack">
      <PageHeading
        title="A little clarity. A lot of control."
        description={`Here’s your money at a glance, ${settings.userName || 'friend'}.`}
      >
        <Link className="v-button v-primary" to="/imports/new">
          <Upload size={16} />
          Import statement
        </Link>
      </PageHeading>
      <div className="v-row">
        <label className="v-inline-field">
          Period
          <select aria-label="Dashboard month" value={month} onChange={(e) => setMonth(e.target.value)}>
            {months.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
        <span className="v-tag">Manually tracked · no bank connection</span>
      </div>
      <div className="v-metrics">
        <Metric
          featured
          label="Bank & cash balance"
          value={formatMoney(summary.liquid)}
          note="Current balance · independent of selected month"
        />
        <Metric
          label="Period spending"
          value={formatMoney(totals.spending)}
          note={budget ? `Monthly budget ${formatMoney(budget)}` : 'Set a budget in Plan'}
        />
        <Metric
          label="Period income"
          value={formatMoney(totals.income)}
          note={`${formatMoney(totals.income - totals.spending)} after spending`}
        />
      </div>
      <div className="v-grid">
        <Panel
          title="Money in, money out"
          action={<span className="v-tag">6 months · {settings.currency}</span>}
        >
          <div
            className="v-chart"
            role="img"
            aria-label={`Monthly cash flow. Selected month: income ${totals.income}, spending ${totals.spending}. Select a bar to view activity.`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={flow} margin={{ top: 18, right: 4, left: -15, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={chart.grid} />
                <XAxis dataKey="label" stroke={chart.tick} tickLine={false} axisLine={false} />
                <YAxis
                  stroke={chart.tick}
                  tickLine={false}
                  axisLine={false}
                  width={65}
                  tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)}
                />
                <Tooltip
                  formatter={(v) => formatMoney(v)}
                  contentStyle={{
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 10,
                    color: 'var(--color-text-primary)',
                  }}
                  cursor={{ fill: chart.cursor }}
                />
                <Legend iconType="circle" />
                <Bar
                  dataKey="income"
                  name="Income"
                  fill={chart.income}
                  radius={[4, 4, 0, 0]}
                  onClick={(d) => detail(null, d.key)}
                />
                <Bar
                  dataKey="spending"
                  name="Spending"
                  fill={chart.expense}
                  radius={[4, 4, 0, 0]}
                  onClick={(d) => detail(null, d.key)}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="v-caption">Tap a bar to view that month’s activity.</p>
        </Panel>
        <Panel
          title="Where it went"
          action={
            <Link to="/analytics" className="v-text-link">
              Insights <ArrowUpRight size={14} />
            </Link>
          }
        >
          {categories.length ? (
            categories.slice(0, 5).map(([c, v]) => (
              <button key={c} className="v-category" onClick={() => detail(c)}>
                <span className="v-row">
                  <span>{c}</span>
                  <strong>{formatMoney(v)}</strong>
                </span>
                <Progress value={(v / totals.spending) * 100} label={`${c} share of spending`} />
              </button>
            ))
          ) : (
            <p className="v-muted v-empty">No spending in this period. Add a transaction to get started.</p>
          )}
        </Panel>
      </div>
      <div className="v-grid">
        <Panel
          title="Recent activity"
          action={
            <Link to={`/transactions?month=${month}`} className="v-text-link">
              View all <ArrowUpRight size={14} />
            </Link>
          }
        >
          {activity.map((t) => (
            <Link
              key={t.id}
              to={`/transactions?search=${encodeURIComponent(t.merchant || t.description || '')}`}
              className="v-activity"
            >
              <span className="v-icon-tile">
                <ArrowLeftRight size={16} />
              </span>
              <div>
                <strong>{t.merchant || t.description}</strong>
                <small>
                  {t.category} · {t.date}
                </small>
              </div>
              <b className={t.type === 'income' ? 'v-positive' : ''}>
                {t.type === 'expense' ? '−' : t.type === 'income' ? '+' : ''}
                {formatMoney(t.amount)}
              </b>
            </Link>
          ))}
          {!activity.length && <p className="v-muted v-empty">No activity yet.</p>}
        </Panel>
        <Panel title="On the horizon" action={<CalendarDays size={17} />}>
          {bills.length ? (
            bills.map((b) => (
              <div className="v-activity" key={b.id}>
                <span className="v-icon-tile">
                  <CreditCard size={17} />
                </span>
                <div>
                  <strong>{b.name}</strong>
                  <small>Due {b.date} · planned</small>
                </div>
                <b>{b.amount != null ? formatMoney(b.amount) : 'Amount not recorded'}</b>
              </div>
            ))
          ) : (
            <p className="v-muted v-empty">Add card due dates or recurring commitments to see what’s next.</p>
          )}
          {plan.goals[0] && (
            <div className="v-goal-preview">
              <div className="v-row">
                <h3>{plan.goals[0].name}</h3>
                <small>{Math.round((plan.goals[0].allocated / plan.goals[0].target) * 100)}% funded</small>
              </div>
              <Progress value={(plan.goals[0].allocated / plan.goals[0].target) * 100} label="Goal funded" />
            </div>
          )}
          <Link to="/plan" className="v-text-link">
            See your plan <ArrowUpRight size={14} />
          </Link>
        </Panel>
      </div>
      <div className="v-row v-summary-strip">
        <span>
          Net worth <strong>{formatMoney(summary.netWorth)}</strong>
        </span>
        <span>
          Investments <strong>{formatMoney(summary.portfolio)}</strong>
        </span>
        <Link to="/assistant" className="v-text-link">
          <Sparkles size={16} />
          Ask about your spending
        </Link>
      </div>
    </div>
  );
}
