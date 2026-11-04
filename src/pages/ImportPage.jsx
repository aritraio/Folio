import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, FileCheck2, ArrowRight, RotateCcw } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { DEFAULT_CATEGORIES } from '../constants/finance';
import {
  parseStatement,
  duplicateCandidate,
  commitStatement,
  getImports,
  undoStatement,
  validDate,
} from '../services/statements';
import { localDate } from '../utils/financeV2';
import { generateId } from '../services/storage';
import { api } from '../services/cloud';
import { PageHeading, Panel } from '../components/ui/WorkspaceUI';
import { formatMoney } from '../utils/formatCurrency';
export default function ImportPage() {
  const { accounts, transactions } = useData(),
    [accountId, setAccount] = useState(''),
    [dateOrder, setDateOrder] = useState('DMY'),
    [rows, setRows] = useState(null),
    [mode, setMode] = useState('history'),
    [name, setName] = useState(''),
    [id, setId] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [consent, setConsent] = useState(false),
    [notice, setNotice] = useState('');
  const selected = rows?.filter((r) => r.selected) || [],
    invalid = selected.some((r) => r.error || !r.category || (r.type === 'transfer' && !r.toAccountId));
  function update(index, patch) {
    setRows((list) =>
      list.map((r, i) => {
        if (i !== index) return r;
        const next = { ...r, ...patch };
        next.error =
          !validDate(next.date) || next.date > localDate()
            ? 'Check the posting date'
            : !Number.isFinite(next.amount) || next.amount <= 0
              ? 'Check the amount'
              : !next.merchant.trim()
                ? 'Add a description'
                : '';
        return next;
      })
    );
  }
  async function readFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setNotice('');
    setBusy(true);
    try {
      if (!accountId) throw new Error('Choose an account first.');
      if (file.size > 5 * 1024 * 1024) throw new Error('Files must be smaller than 5 MB.');
      let parsed;
      if (file.name.toLowerCase().endsWith('.csv')) parsed = parseStatement(await file.text(), dateOrder);
      else if (file.name.toLowerCase().endsWith('.pdf')) {
        if (!consent) throw new Error('PDF processing needs your consent below.');
        const bytes = new Uint8Array(await file.arrayBuffer());
        let binary = '';
        for (const byte of bytes) binary += String.fromCharCode(byte);
        const result = await api('statement', {
          method: 'POST',
          body: JSON.stringify({ pdf: btoa(binary), consent: true }),
        });
        parsed = result.rows.map((r, i) => ({
          ...r,
          id: `row-${i}`,
          sourceRow: i + 1,
          selected: true,
          error: '',
        }));
      } else throw new Error('Choose a CSV or PDF file.');
      setName(file.name);
      setId(generateId('import'));
      setRows(
        parsed.map((r) => ({
          ...r,
          duplicate: duplicateCandidate(r, accountId, transactions),
          selected: r.selected && !duplicateCandidate(r, accountId, transactions),
        }))
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  }
  function commit() {
    try {
      const job = commitStatement({ rows, accountId, mode, id, name });
      setNotice(
        `${job.items.length} transactions imported. ${mode === 'history' ? 'Balances were kept as recorded.' : 'Balances were updated.'}`
      );
      setRows(null);
    } catch (e) {
      setError(e.message);
    }
  }
  function template() {
    const blob = new Blob(
        [
          'Date,Description,Amount,Type,Category\n2026-10-01,Example cafe,-250,expense,Food & Dining\n2026-10-02,Salary,25000,income,Salary\n',
        ],
        { type: 'text/csv' }
      ),
      url = URL.createObjectURL(blob),
      a = document.createElement('a');
    a.href = url;
    a.download = 'folio-statement-template.csv';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <div className="v-stack">
      <PageHeading
        title={rows ? 'A quick check, then you’re done.' : 'Less typing. More clarity.'}
        description={
          rows ? `${name} · review every selected row` : 'Import a statement, review it, then save it.'
        }
      />
      {error && (
        <p className="v-error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="v-notice" role="status">
          {notice}{' '}
          <Link className="v-text-link" to="/transactions">
            View activity <ArrowRight size={14} />
          </Link>
        </p>
      )}
      <Panel>
        <div className="v-form-grid">
          <label className="v-field">
            Import into
            <select value={accountId} disabled={!!rows || busy} onChange={(e) => setAccount(e.target.value)}>
              <option value="">Choose an account</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          <label className="v-field">
            CSV date order
            <select
              value={dateOrder}
              disabled={!!rows || busy}
              onChange={(e) => setDateOrder(e.target.value)}
            >
              <option value="DMY">Day / Month / Year</option>
              <option value="MDY">Month / Day / Year</option>
            </select>
          </label>
        </div>
        {!rows ? (
          <>
            <div className="v-upload-area">
              <Upload size={30} />
              <h2>Bring your statement into Folio</h2>
              <p className="v-muted">
                CSV: Date, Description, signed Amount or Debit/Credit columns.
                <br />
                PDF: AI-assisted beta, requires configured cloud services and sign-in.
                <br />
                Up to 1,000 rows · 5 MB maximum.
              </p>
              <label className="v-button v-primary">
                {busy ? 'Reading statement…' : 'Choose a file'}
                <input
                  aria-label="Statement file"
                  type="file"
                  accept=".csv,.pdf"
                  disabled={busy || !accountId}
                  onChange={readFile}
                  className="sr-only"
                />
              </label>
              <button className="v-text-link" onClick={template}>
                Download CSV template
              </button>
            </div>
            <label className="v-checkbox">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>
                I consent to sending a PDF to OpenAI through the authenticated server to extract transactions.
                Statements may include personal and financial details.
              </span>
            </label>
            <p className="v-caption">
              CSV is processed on this device. PDF parsing is a beta: check amounts, dates and missing rows
              against the original. Originals are not saved by Folio; AI provider retention rules still apply.
            </p>
          </>
        ) : (
          <>
            <div className="v-row mt-5">
              <span className="v-tag">
                <FileCheck2 size={14} />
                {rows.length} rows · {selected.length} selected
              </span>
              <button
                className="v-text-link"
                onClick={() => {
                  setRows(null);
                  setError('');
                }}
              >
                Choose another file
              </button>
            </div>
            <p className="v-caption">
              Possible duplicates are excluded initially. Include them only after checking the original.
              Choose categories for uncertain rows; own-account movements and card repayments are transfers.
            </p>
            <div className="v-import-rows">
              {rows.map((r, i) => (
                <div className="v-import-row" key={r.id}>
                  <label className="v-checkbox">
                    <input
                      type="checkbox"
                      checked={r.selected}
                      onChange={(e) => update(i, { selected: e.target.checked })}
                    />
                    <span className="sr-only">Include row {r.sourceRow}</span>
                  </label>
                  <div className="v-import-detail">
                    <strong>{r.merchant}</strong>
                    <small>
                      {r.date} · {formatMoney(r.amount)} · source row {r.sourceRow}
                    </small>
                    {r.duplicate && <span className="v-tag">Possible duplicate</span>}
                    {r.error && <span className="v-error">{r.error} · correct or exclude this row</span>}
                    <div className="v-form-grid">
                      <label className="v-field">
                        Date
                        <input
                          type="date"
                          value={r.date}
                          max={localDate()}
                          onChange={(e) => update(i, { date: e.target.value })}
                        />
                      </label>
                      <label className="v-field">
                        Amount
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={Number.isFinite(r.amount) ? r.amount : ''}
                          onChange={(e) => update(i, { amount: Number(e.target.value) })}
                        />
                      </label>
                      <label className="v-field">
                        Type
                        <select
                          value={r.type}
                          onChange={(e) =>
                            update(i, {
                              type: e.target.value,
                              ...(e.target.value === 'transfer' ? { category: 'Other' } : {}),
                            })
                          }
                        >
                          {['expense', 'income', 'transfer'].map((t) => (
                            <option key={t}>{t}</option>
                          ))}
                        </select>
                      </label>
                      <label className="v-field">
                        Category
                        <select value={r.category} onChange={(e) => update(i, { category: e.target.value })}>
                          <option value="">Needs review</option>
                          {DEFAULT_CATEGORIES.map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                      </label>
                      {r.type === 'transfer' && (
                        <label className="v-field">
                          Destination
                          <select
                            value={r.toAccountId || ''}
                            onChange={(e) => update(i, { toAccountId: e.target.value })}
                          >
                            <option value="">Choose destination</option>
                            {accounts
                              .filter((a) => a.id !== accountId)
                              .map((a) => (
                                <option key={a.id} value={a.id}>
                                  {a.name}
                                </option>
                              ))}
                          </select>
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <label className="v-field mt-5">
              How should this affect your balance?
              <select value={mode} onChange={(e) => setMode(e.target.value)}>
                <option value="history">History only — balance already includes these transactions</option>
                <option value="apply">Apply transactions — change balances from their current values</option>
              </select>
            </label>
            <p className="v-notice">
              {mode === 'history'
                ? 'Use this for past statements when you already entered a current balance. These records affect insights but will not change balances, even if edited or deleted.'
                : 'Only use this when current balances do not include these transactions. Transfers will change both accounts.'}
            </p>
            <button
              className="v-button v-primary"
              disabled={busy || invalid || !selected.length}
              onClick={commit}
            >
              Import {selected.length} transactions <ArrowRight size={16} />
            </button>
          </>
        )}
      </Panel>
      <Panel title="Import history">
        {getImports().length ? (
          getImports().map((j) => (
            <div className="v-activity" key={j.id}>
              <FileCheck2 size={20} />
              <div>
                <strong>{j.name}</strong>
                <small>
                  {j.items.length} transactions · {j.mode === 'history' ? 'history only' : 'balances applied'}{' '}
                  · {j.createdAt.slice(0, 10)} · {j.status}
                </small>
              </div>
              {j.status === 'imported' && (
                <button
                  className="v-button"
                  onClick={() => {
                    try {
                      undoStatement(j.id);
                      setNotice('Import undone.');
                      setError('');
                    } catch (e) {
                      setError(e.message);
                    }
                  }}
                >
                  <RotateCcw size={14} />
                  Undo
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="v-muted">Your reviewed imports will appear here.</p>
        )}
      </Panel>
    </div>
  );
}
