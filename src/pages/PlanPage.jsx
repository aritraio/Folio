import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Pencil, Trash2, SkipForward, Target, CalendarDays } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { getPlanning, saveGoal, saveRecurring, removePlanItem } from '../services/planning';
import { nextOccurrence, localDate } from '../utils/financeV2';
import { formatMoney } from '../utils/formatCurrency';
import { PageHeading, Panel, Progress } from '../components/ui/WorkspaceUI';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import BudgetsPage from './BudgetsPage';
export default function PlanPage() {
  const { accounts } = useData(),
    [params, setParams] = useSearchParams(),
    tab = params.get('tab') || 'goals',
    data = getPlanning();
  const [form, setForm] = useState(null),
    [error, setError] = useState(''),
    [notice, setNotice] = useState('');
  const isGoal = form?.kind === 'goals';
  function open(item) {
    setError('');
    setForm(
      item || {
        kind: tab,
        name: '',
        target: '',
        allocated: '0',
        accountId: '',
        targetDate: '',
        amount: '',
        nextDue: localDate(),
        frequency: 'monthly',
      }
    );
  }
  function submit(e) {
    e.preventDefault();
    try {
      if (isGoal) saveGoal({ ...form, target: Number(form.target), allocated: Number(form.allocated) });
      else saveRecurring({ ...form, amount: Number(form.amount) });
      setForm(null);
      setNotice('Your plan has been saved.');
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <div className="v-stack">
      <PageHeading title="Make room for what matters." description="A simple plan for today and what’s next.">
        {tab !== 'budgets' && (
          <Button icon={<Plus size={16} />} onClick={() => open()}>
            Add {tab === 'goals' ? 'goal' : 'commitment'}
          </Button>
        )}
      </PageHeading>
      <div className="v-tabs">
        {[
          ['goals', 'Savings goals'],
          ['budgets', 'Budgets'],
          ['upcoming', 'Upcoming'],
        ].map(([key, name]) => (
          <button key={key} aria-pressed={tab === key} onClick={() => setParams({ tab: key })}>
            {name}
          </button>
        ))}
      </div>
      {notice && (
        <p className="v-notice" role="status">
          {notice}
        </p>
      )}
      {tab === 'budgets' ? (
        <BudgetsPage />
      ) : tab === 'goals' ? (
        <>
          <div className="v-grid v-equal">
            {data.goals.map((g) => (
              <Panel key={g.id}>
                <div className="v-row">
                  <Target size={23} />
                  <span className="v-tag">{Math.round((g.allocated / g.target) * 100)}% funded</span>
                </div>
                <h2 className="mt-5">{g.name}</h2>
                <p className="v-large-money">{formatMoney(g.allocated)}</p>
                <p className="v-muted">
                  of {formatMoney(g.target)}
                  {g.targetDate ? ` · by ${g.targetDate}` : ''}
                </p>
                <Progress value={(g.allocated / g.target) * 100} label={`${g.name} funded`} />
                <small className="v-caption">
                  Allocated from {accounts.find((a) => a.id === g.accountId)?.name || 'removed account'}
                </small>
                <div className="v-actions mt-5">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => open({ ...g, kind: 'goals' })}
                    icon={<Pencil size={14} />}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePlanItem('goals', g.id)}
                    icon={<Trash2 size={14} />}
                  >
                    Remove goal
                  </Button>
                </div>
              </Panel>
            ))}
          </div>
          {!data.goals.length && (
            <Panel>
              <div className="v-empty">
                <Target size={30} />
                <h2>What are you saving for?</h2>
                <p className="v-muted">
                  Give a portion of your existing money a purpose. Start with a laptop, a trip or an emergency
                  fund.
                </p>
              </div>
            </Panel>
          )}
          <p className="v-notice">
            Goal allocations are part of your existing balances. They never add to net worth.
          </p>
        </>
      ) : (
        <Panel title="Upcoming commitments">
          {data.recurring.length ? (
            data.recurring
              .sort((a, b) => a.nextDue.localeCompare(b.nextDue))
              .map((r) => (
                <div className="v-activity" key={r.id}>
                  <span className="v-icon-tile">
                    <CalendarDays size={18} />
                  </span>
                  <div>
                    <strong>{r.name}</strong>
                    <small>
                      {r.nextDue} · {r.frequency} · not posted
                    </small>
                  </div>
                  <b>{formatMoney(r.amount)}</b>
                  <div className="v-actions">
                    <button
                      className="v-icon-button"
                      aria-label={`Edit ${r.name}`}
                      onClick={() => open({ ...r, kind: 'upcoming' })}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="v-icon-button"
                      aria-label={`Skip occurrence of ${r.name}`}
                      onClick={() => {
                        saveRecurring({ ...r, nextDue: nextOccurrence(r.nextDue, r.frequency) });
                        setNotice('Moved to the next occurrence. No transaction was created.');
                      }}
                    >
                      <SkipForward size={16} />
                    </button>
                    <button
                      className="v-icon-button"
                      aria-label={`Remove ${r.name}`}
                      onClick={() => removePlanItem('recurring', r.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
          ) : (
            <div className="v-empty">
              <CalendarDays size={30} />
              <h2>Give future you a heads-up.</h2>
              <p className="v-muted">
                Track subscriptions, rent, bills and SIP commitments. Planned items do not create expenses.
              </p>
            </div>
          )}
          <p className="v-caption">
            Record actual payments in Activity or import their transactions. Use skip to advance a planned
            occurrence.
          </p>
        </Panel>
      )}
      <Modal
        isOpen={!!form}
        onClose={() => setForm(null)}
        title={isGoal ? 'Savings goal' : 'Recurring commitment'}
      >
        <form onSubmit={submit} className="v-form">
          <Input
            label="Name"
            required
            maxLength={80}
            value={form?.name || ''}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          {isGoal ? (
            <>
              <Select
                label="Allocate from account"
                required
                value={form?.accountId || ''}
                options={accounts
                  .filter((a) => ['savings', 'current', 'cash'].includes(a.type))
                  .map((a) => ({ value: a.id, label: `${a.name} · ${formatMoney(a.balance)}` }))}
                onChange={(e) => setForm({ ...form, accountId: e.target.value })}
              />
              <Input
                label="Target amount"
                type="number"
                min="0.01"
                step="0.01"
                required
                value={form?.target || ''}
                onChange={(e) => setForm({ ...form, target: e.target.value })}
              />
              <Input
                label="Amount allocated"
                type="number"
                min="0"
                step="0.01"
                required
                value={form?.allocated ?? '0'}
                onChange={(e) => setForm({ ...form, allocated: e.target.value })}
              />
              <Input
                label="Target date (optional)"
                type="date"
                value={form?.targetDate || ''}
                onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
              />
            </>
          ) : (
            <>
              <Input
                label="Expected amount"
                type="number"
                min="0.01"
                step="0.01"
                required
                value={form?.amount || ''}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
              <Input
                label="Next due date"
                type="date"
                required
                value={form?.nextDue || ''}
                onChange={(e) => setForm({ ...form, nextDue: e.target.value })}
              />
              <Select
                label="Frequency"
                value={form?.frequency || 'monthly'}
                options={['weekly', 'monthly', 'yearly'].map((v) => ({ value: v, label: v }))}
                onChange={(e) => setForm({ ...form, frequency: e.target.value })}
              />
            </>
          )}
          {error && (
            <p role="alert" className="v-error">
              {error}
            </p>
          )}
          <Button type="submit">Save {isGoal ? 'goal' : 'commitment'}</Button>
        </form>
      </Modal>
    </div>
  );
}
