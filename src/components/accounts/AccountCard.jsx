import React from 'react';
import { Link } from 'react-router-dom';
import { Landmark, CreditCard, Wallet, Pencil, Trash2, ArrowUpRight } from 'lucide-react';
import { formatMoney } from '../../utils/formatCurrency';
import { Progress } from '../ui/WorkspaceUI';
export default function AccountCard({ account, onEdit, onDelete }) {
  const credit = account.type === 'credit',
    Icon = credit ? CreditCard : account.type === 'cash' ? Wallet : Landmark;
  return (
    <article className="v-panel">
      <div className="v-row">
        <span className="v-tag">
          {credit
            ? 'Credit card'
            : account.type === 'cash'
              ? 'Cash'
              : account.type === 'investment'
                ? 'Investment balance'
                : account.type + ' account'}
        </span>
        <Icon size={19} />
      </div>
      <h3 className="mt-5 font-semibold">{account.name}</h3>
      <p className="v-caption">
        {account.bank || 'Manually tracked'}{' '}
        {account.accountNumber && account.accountNumber !== 'N/A'
          ? `· •••• ${account.accountNumber.slice(-4)}`
          : ''}
      </p>
      <p className="v-large-money">{formatMoney(account.balance)}</p>
      <small className="v-muted">
        {credit ? (account.balance < 0 ? 'Credit on your card' : 'Total outstanding') : 'Tracked balance'}
      </small>
      {credit && (
        <div className="v-bank-detail">
          <div className="v-row">
            <span>Statement amount</span>
            <strong>
              {account.statementBalance != null ? formatMoney(account.statementBalance) : 'Not recorded'}
            </strong>
          </div>
          <div className="v-row mt-3">
            <span>Minimum due</span>
            <strong>{account.minimumDue != null ? formatMoney(account.minimumDue) : 'Not recorded'}</strong>
          </div>
          <div className="v-row mt-3">
            <span>Pay by</span>
            <strong>{account.dueDate || 'Set a due date'}</strong>
          </div>
          {account.creditLimit > 0 && (
            <>
              <Progress
                value={(Math.max(0, account.balance) / account.creditLimit) * 100}
                label="Credit utilization"
              />
              <small className="v-caption">
                {Math.round((Math.max(0, account.balance) / account.creditLimit) * 100)}% of{' '}
                {formatMoney(account.creditLimit)} limit
              </small>
            </>
          )}
        </div>
      )}
      <p className="v-caption">
        {account.updatedAt
          ? `Updated ${account.updatedAt.slice(0, 10)}`
          : 'Manual balance · update when reconciled'}
      </p>
      <div className="v-row mt-5">
        <Link className="v-text-link" to={`/transactions?accountId=${encodeURIComponent(account.id)}`}>
          Activity <ArrowUpRight size={14} />
        </Link>
        <div className="v-actions">
          <button
            className="v-icon-button"
            onClick={() => onEdit(account)}
            aria-label={`Edit ${account.name}`}
          >
            <Pencil size={16} />
          </button>
          <button
            className="v-icon-button"
            onClick={() => onDelete(account.id)}
            aria-label={`Delete ${account.name}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}
