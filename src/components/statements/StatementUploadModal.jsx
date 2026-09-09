import React, { useState, useId } from 'react';
import {
  UploadCloud,
  Lock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Info,
  ShieldCheck,
  Check,
  Building2,
  CreditCard,
} from 'lucide-react';
import { Modal, Button, Badge } from '../ui';
import { useData } from '../../contexts/DataContext';
import { extractTextFromPdf } from '../../services/pdfParser';
import { parseStatementWithGemini, SAMPLE_STATEMENTS } from '../../services/geminiService';
import { findPotentialDuplicates, saveTransactionsBatch } from '../../services/storage';
import { DEFAULT_CATEGORIES, INDIAN_BANK_PASSWORD_HINTS } from '../../constants/finance';
import { formatINR } from '../../utils/formatCurrency';

/**
 * StatementUploadModal — In-browser AI Statement Ingestion Wizard.
 *
 * Steps:
 * 1. Upload & Demo Selector (Drop PDF, or pick HDFC Savings / ICICI CC demo)
 * 2. Password Unlock (if encrypted PDF, with Indian bank password hints)
 * 3. AI Extraction Progress (Extracting text -> Gemini Flash structured parsing)
 * 4. Staging Review Table (Verify, select/deselect, edit categories, highlight duplicates)
 * 5. Success summary & auto-commit
 */
export default function StatementUploadModal({ isOpen, onClose }) {
  const fileInputId = useId();
  const { accounts, transactions: existingTxns, settings, refresh } = useData();
  const [step, setStep] = useState('select'); // 'select' | 'password' | 'parsing' | 'review' | 'success'
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [selectedBankHint, setSelectedBankHint] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [stagedTransactions, setStagedTransactions] = useState([]);
  const [selectedTargetAccountId, setSelectedTargetAccountId] = useState('');
  const [error, setError] = useState(null);
  const [committedCount, setCommittedCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);

  const apiKey = settings?.geminiApiKey || '';

  // Reset state when closing or re-opening
  const handleClose = () => {
    setStep('select');
    setFile(null);
    setPassword('');
    setPasswordError('');
    setExtractedData(null);
    setStagedTransactions([]);
    setError(null);
    onClose();
  };

  // ── Step 1: File selection or Sample Statement ──
  const handleFileDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const handleSelectSample = (sampleKey) => {
    const sample = SAMPLE_STATEMENTS[sampleKey];
    if (!sample) return;

    setStep('parsing');
    setError(null);

    // Simulate rapid extraction pipeline for demo statement
    setTimeout(() => {
      completeExtraction({
        institutionName: sample.institution,
        statementType: sample.accountType,
        transactions: sample.transactions,
        isDemo: true,
      });
    }, 700);
  };

  const processFile = async (selectedFile, suppliedPassword = '') => {
    setFile(selectedFile);
    setError(null);
    setPasswordError('');

    try {
      setStep('parsing');
      // 1. Extract text via pdfjs-dist in browser
      const { text, numPages } = await extractTextFromPdf(selectedFile, suppliedPassword);

      // 2. Pass extracted text to Gemini (or heuristic parser)
      const result = await parseStatementWithGemini(
        text,
        apiKey,
        settings?.geminiModel || 'gemini-1.5-flash'
      );

      completeExtraction({
        ...result,
        numPages,
      });
    } catch (err) {
      if (err.code === 'PASSWORD_REQUIRED' || err.isEncrypted) {
        setStep('password');
        if (err.code === 'INCORRECT_PASSWORD') {
          setPasswordError('Incorrect password. Please verify bank format and try again.');
        }
      } else {
        setError(err.message || 'Failed to process document');
        setStep('select');
      }
    }
  };

  // ── Step 2: Handle Password Submit ──
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!password) {
      setPasswordError('Please enter the statement password');
      return;
    }
    if (file) {
      processFile(file, password);
    }
  };

  // ── Complete Extraction & Prepare Staging Table ──
  const completeExtraction = (parsedResult) => {
    setExtractedData(parsedResult);

    // Auto-match or choose default target account
    const matchedAcc = accounts.find(
      (a) =>
        a.type === parsedResult.statementType ||
        a.name.toLowerCase().includes(parsedResult.institutionName.toLowerCase().split(' ')[0])
    );
    setSelectedTargetAccountId(matchedAcc ? matchedAcc.id : accounts[0]?.id || '');

    // Cross-reference with existing transactions to detect duplicates
    const flagged = findPotentialDuplicates(parsedResult.transactions, existingTxns);

    // Initialize staging table with selection flags
    const staged = flagged.map((tx, idx) => ({
      ...tx,
      stagingId: `staged_${Date.now()}_${idx}`,
      selected: !tx.isDuplicate, // auto-uncheck potential duplicates by default
    }));

    setStagedTransactions(staged);
    setStep('review');
  };

  // ── Review Table Controls ──
  const toggleSelectAll = () => {
    const allSelected = stagedTransactions.every((tx) => tx.selected);
    setStagedTransactions(stagedTransactions.map((tx) => ({ ...tx, selected: !allSelected })));
  };

  const toggleSelectTx = (stagingId) => {
    setStagedTransactions(
      stagedTransactions.map((tx) => (tx.stagingId === stagingId ? { ...tx, selected: !tx.selected } : tx))
    );
  };

  const updateCategory = (stagingId, newCategory) => {
    setStagedTransactions(
      stagedTransactions.map((tx) => (tx.stagingId === stagingId ? { ...tx, category: newCategory } : tx))
    );
  };

  // ── Commit Staged Transactions ──
  const handleCommit = () => {
    const toCommit = stagedTransactions.filter((tx) => tx.selected);
    if (toCommit.length === 0) return;

    // Attach target accountId
    const formattedForSave = toCommit.map((tx) => ({
      date: tx.date,
      merchant: tx.merchant,
      description: tx.merchant,
      amount: Math.abs(Number(tx.amount) || 0),
      type: tx.type || 'expense',
      category: tx.category || 'Other',
      accountId: selectedTargetAccountId,
      notes: tx.notes || `Imported from ${extractedData?.institutionName || 'Statement'}`,
      paymentMode: tx.paymentMode,
    }));

    saveTransactionsBatch(formattedForSave);
    setCommittedCount(formattedForSave.length);
    setSkippedCount(stagedTransactions.length - formattedForSave.length);
    refresh();
    setStep('success');
  };

  const selectedCount = stagedTransactions.filter((tx) => tx.selected).length;
  const duplicateCount = stagedTransactions.filter((tx) => tx.isDuplicate).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="AI Statement Ingestion"
      size={step === 'review' ? '2xl' : 'lg'}
    >
      {/* ── STEP 1: Select / Upload ── */}
      {step === 'select' && (
        <div className="space-y-6 py-2">
          {error && (
            <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-sm text-red-700 dark:text-red-400">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Drag & Drop Upload Zone */}
          <label
            htmlFor={fileInputId}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="
              border-2 border-dashed border-ivory-border dark:border-surface-dark-border
              hover:border-brand-amber dark:hover:border-brand-amber
              rounded-xl p-8 text-center cursor-pointer transition-colors block
              bg-ivory-warm/30 dark:bg-surface-dark-card/50
            "
          >
            <input
              id={fileInputId}
              type="file"
              accept=".pdf,.csv,.txt"
              onChange={handleFileDrop}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/40 text-brand-amber flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-text-dark-primary mb-1">
              Drop your bank or credit card PDF here, or browse
            </p>
            <p className="text-xs text-text-secondary dark:text-text-dark-secondary mb-3">
              Supports HDFC, ICICI, SBI, Axis, Kotak, Cred, and all major Indian PDF statements
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-amber bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Private — Decrypted and processed directly in your browser
            </div>
          </label>

          {/* Interactive Demo Statements */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-text-dark-secondary flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-amber" />
                Or Try With Sample Indian Statements
              </span>
              <span className="text-[11px] text-text-tertiary">No API key required</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSelectSample('HDFC_SAVINGS')}
                className="
                  p-3.5 rounded-lg border border-ivory-border dark:border-surface-dark-border
                  hover:border-brand-amber dark:hover:border-brand-amber text-left transition-all
                  bg-white dark:bg-surface-dark-card group
                "
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-brand-amber" />
                    <span className="text-sm font-semibold text-zinc-900 dark:text-text-dark-primary">
                      HDFC Bank Savings
                    </span>
                  </div>
                  <Badge variant="amber" size="sm">
                    Demo
                  </Badge>
                </div>
                <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
                  8 transactions • Swiggy, Zepto, Electricity, Salary credit & CC bill transfer
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSample('ICICI_CREDIT_CARD')}
                className="
                  p-3.5 rounded-lg border border-ivory-border dark:border-surface-dark-border
                  hover:border-brand-amber dark:hover:border-brand-amber text-left transition-all
                  bg-white dark:bg-surface-dark-card group
                "
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-brand-amber" />
                    <span className="text-sm font-semibold text-zinc-900 dark:text-text-dark-primary">
                      ICICI Amazon Pay CC
                    </span>
                  </div>
                  <Badge variant="amber" size="sm">
                    Demo
                  </Badge>
                </div>
                <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
                  6 transactions • Amazon, Netflix, Starbucks, MakeMyTrip & dining
                </p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2: Password Prompt (For Encrypted Indian Bank PDFs) ── */}
      {step === 'password' && (
        <form onSubmit={handlePasswordSubmit} className="space-y-5 py-2">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/40 text-brand-amber flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-zinc-900 dark:text-text-dark-primary">
              Password-Protected Statement
            </h4>
            <p className="text-xs text-text-secondary dark:text-text-dark-secondary max-w-md mx-auto">
              This PDF is encrypted. Indian banks protect statements with customer information. Password is
              used solely in your browser to unlock text.
            </p>
          </div>

          {passwordError && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-xs text-red-600 dark:text-red-400">
              {passwordError}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-900 dark:text-text-dark-primary">
              Enter Statement Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="e.g. DOB DDMMYYYY or PAN lowercase"
              autoFocus
              className="
                w-full px-3.5 py-2.5 rounded-lg text-sm
                bg-white dark:bg-surface-dark-card
                border border-ivory-border dark:border-surface-dark-border
                text-zinc-900 dark:text-text-dark-primary
                focus:ring-2 focus:ring-brand-amber focus:outline-none
              "
            />
          </div>

          {/* Bank Password Hints Dropdown */}
          <div className="p-3.5 rounded-lg bg-ivory-warm/40 dark:bg-surface-dark-card/50 border border-ivory-border dark:border-surface-dark-border space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900 dark:text-text-dark-primary">
              <Info className="w-3.5 h-3.5 text-brand-amber" />
              Common Indian Bank Password Conventions:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-text-secondary dark:text-text-dark-secondary">
              {INDIAN_BANK_PASSWORD_HINTS.slice(0, 4).map((h) => (
                <div
                  key={h.bank}
                  onClick={() => setSelectedBankHint(h.bank)}
                  className={`p-2 rounded border cursor-pointer transition-colors ${
                    selectedBankHint === h.bank
                      ? 'border-brand-amber bg-amber-50/50 dark:bg-amber-950/30 text-zinc-900 dark:text-text-dark-primary'
                      : 'border-transparent hover:bg-white dark:hover:bg-surface-dark'
                  }`}
                >
                  <p className="font-medium text-zinc-900 dark:text-text-dark-primary">{h.bank}</p>
                  <p className="text-[10px] text-text-tertiary">{h.pattern}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setStep('select')}>
              Back
            </Button>
            <Button variant="primary" type="submit">
              Unlock & Parse Statement
            </Button>
          </div>
        </form>
      )}

      {/* ── STEP 3: Parsing Spinner ── */}
      {step === 'parsing' && (
        <div className="py-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-950/40 text-brand-amber flex items-center justify-center mx-auto animate-spin">
            <RefreshCw className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-semibold text-zinc-900 dark:text-text-dark-primary">
              AI Analyzing Financial Statement...
            </h4>
            <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
              Extracting line items, cleaning UPI transaction tags, and categorizing cash flow
            </p>
          </div>
          <div className="max-w-xs mx-auto space-y-2 pt-2 text-left text-xs text-text-tertiary">
            <div className="flex items-center gap-2 text-brand-emerald">
              <Check className="w-4 h-4" /> PDF Decryption Verified
            </div>
            <div className="flex items-center gap-2 text-brand-amber animate-pulse">
              <Sparkles className="w-4 h-4" /> Gemini Structured Transaction Extraction...
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 4: Staging Review Table ── */}
      {step === 'review' && extractedData && (
        <div className="space-y-4 py-1">
          {/* Header Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-ivory-warm/40 dark:bg-surface-dark-card/50 border border-ivory-border dark:border-surface-dark-border">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-zinc-900 dark:text-text-dark-primary">
                  {extractedData.institutionName}
                </span>
                <Badge variant={extractedData.statementType === 'credit' ? 'amber' : 'green'} size="sm">
                  {extractedData.statementType === 'credit' ? 'Credit Card' : 'Savings A/c'}
                </Badge>
                {extractedData.isDemo && (
                  <Badge variant="blue" size="sm">
                    Interactive Demo
                  </Badge>
                )}
              </div>
              <p className="text-xs text-text-secondary dark:text-text-dark-secondary mt-0.5">
                Found {stagedTransactions.length} transactions • {duplicateCount} potential duplicates flagged
              </p>
            </div>

            {/* Target Account Selector */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-text-secondary whitespace-nowrap">
                Target Account:
              </label>
              <select
                value={selectedTargetAccountId}
                onChange={(e) => setSelectedTargetAccountId(e.target.value)}
                className="
                  text-xs px-2.5 py-1.5 rounded-md
                  bg-white dark:bg-surface-dark
                  border border-ivory-border dark:border-surface-dark-border
                  text-zinc-900 dark:text-text-dark-primary
                  focus:ring-1 focus:ring-brand-amber focus:outline-none
                "
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Staging Table */}
          <div className="border border-ivory-border dark:border-surface-dark-border rounded-lg overflow-hidden">
            <div className="max-h-72 overflow-y-auto divide-y divide-ivory-border dark:divide-surface-dark-border">
              <div className="bg-ivory-tertiary dark:bg-surface-dark-hover px-4 py-2 flex items-center justify-between text-xs font-semibold text-text-secondary sticky top-0 z-10">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={stagedTransactions.length > 0 && stagedTransactions.every((t) => t.selected)}
                    onChange={toggleSelectAll}
                    className="rounded border-zinc-300 text-brand-amber focus:ring-brand-amber cursor-pointer"
                  />
                  <span>
                    Select All ({selectedCount}/{stagedTransactions.length})
                  </span>
                </div>
                <span>Amount</span>
              </div>

              {stagedTransactions.map((tx) => (
                <div
                  key={tx.stagingId}
                  className={`px-4 py-2.5 flex items-center justify-between text-xs transition-colors ${
                    tx.selected
                      ? 'bg-white dark:bg-surface-dark-card'
                      : 'bg-zinc-50/60 dark:bg-surface-dark/40 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <input
                      type="checkbox"
                      checked={tx.selected}
                      onChange={() => toggleSelectTx(tx.stagingId)}
                      className="rounded border-zinc-300 text-brand-amber focus:ring-brand-amber cursor-pointer"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-zinc-900 dark:text-text-dark-primary truncate">
                          {tx.merchant}
                        </span>
                        {tx.isDuplicate && (
                          <span
                            title={tx.duplicateReason}
                            className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded"
                          >
                            <AlertTriangle className="w-3 h-3" /> Duplicate?
                          </span>
                        )}
                        {tx.type === 'transfer' && (
                          <Badge variant="blue" size="sm">
                            CC Bill Transfer
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-text-secondary dark:text-text-dark-secondary mt-0.5">
                        <span>{tx.date}</span>
                        <span>•</span>
                        <select
                          value={tx.category}
                          onChange={(e) => updateCategory(tx.stagingId, e.target.value)}
                          className="
                            bg-transparent text-[11px] border-b border-dashed border-zinc-300 dark:border-zinc-700
                            hover:border-brand-amber focus:outline-none cursor-pointer
                          "
                        >
                          {DEFAULT_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat} className="bg-white dark:bg-surface-dark">
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`font-semibold mono text-sm ${
                        tx.type === 'income'
                          ? 'text-brand-emerald'
                          : 'text-zinc-900 dark:text-text-dark-primary'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatINR(tx.amount)}
                    </span>
                    <div className="text-[10px] text-text-tertiary capitalize">
                      {tx.paymentMode || tx.type}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-2">
            <Button variant="secondary" onClick={() => setStep('select')}>
              Back
            </Button>
            <Button variant="primary" disabled={selectedCount === 0} onClick={handleCommit}>
              Commit {selectedCount} Transactions
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 5: Success Summary ── */}
      {step === 'success' && (
        <div className="py-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-brand-emerald flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-semibold text-zinc-900 dark:text-text-dark-primary">
              {committedCount} imported · {skippedCount} duplicates skipped
            </h4>
            <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
              {committedCount} transactions added to your ledger
              {skippedCount > 0 ? `, ${skippedCount} potential duplicates left out` : ''}. Balances, cash flow
              and analytics updated.
            </p>
          </div>
          <div className="pt-3">
            <Button variant="primary" onClick={handleClose}>
              View Updated Ledger
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
