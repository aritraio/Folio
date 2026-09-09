import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, RefreshCw, AlertTriangle, CheckCircle2, Lightbulb } from 'lucide-react';
import { generateSpendingFindings } from '../../services/geminiService';
import { useData } from '../../contexts/DataContext';
import { Badge } from '../ui';

/**
 * Ledger Insights — formerly "AI Spending Findings & Discoveries" (§13).
 * Intelligent editorial rows, not generic cards. Every finding carries
 * evidence + comparison + confidence (§75–§77). Gemini enhances when a key
 * is configured; otherwise the transparent heuristic engine runs locally.
 */
export default function AiSpendingAdvisor({ transactions = [], accounts = [], budgets = [] }) {
  const { settings } = useData();
  const apiKey = settings?.geminiApiKey || '';
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ranAt, setRanAt] = useState(null);

  const fetchFindings = async () => {
    setLoading(true);
    try {
      const results = await generateSpendingFindings(transactions, accounts, budgets, apiKey);
      setFindings(Array.isArray(results) ? results.slice(0, 3) : []);
      setRanAt(new Date());
    } catch (err) {
      console.error('Failed to generate findings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (transactions.length > 0) {
      fetchFindings();
    }
  }, [transactions.length, accounts.length, apiKey]);

  const iconFor = useMemo(
    () => (severity) =>
      severity === 'alert' ? (
        <AlertTriangle className="w-3.5 h-3.5 text-brand-red" aria-label="Attention" />
      ) : severity === 'positive' ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-brand-emerald" aria-label="Positive" />
      ) : (
        <Lightbulb className="w-3.5 h-3.5 text-brand-amber" aria-label="Observation" />
      ),
    []
  );

  return (
    <section
      className="section-divider pt-6 animate-fade-in-up"
      aria-label="Ledger insights: automated spending findings"
    >
      <div className="flex items-center justify-between gap-3 mb-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-amber" aria-hidden="true" />
          <h2 className="heading-sm text-zinc-900 dark:text-text-dark-primary">Ledger Insights</h2>
          <Badge variant={apiKey ? 'amber' : 'gray'} size="sm">
            {apiKey ? 'Gemini AI' : 'Heuristic engine'}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {ranAt && (
            <span className="hidden sm:inline text-[11px] text-text-tertiary dark:text-text-dark-tertiary">
              {findings.length} finding{findings.length === 1 ? '' : 's'}
            </span>
          )}
          <button
            onClick={fetchFindings}
            disabled={loading}
            className="p-2 rounded-lg border border-ivory-border dark:border-surface-dark-border hover:bg-ivory-muted dark:hover:bg-surface-dark-elevated text-text-secondary dark:text-text-dark-secondary transition-colors disabled:opacity-50 press-feedback"
            title="Re-run analysis"
            aria-label="Re-run spending analysis"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      <p className="text-xs text-text-secondary dark:text-text-dark-secondary mb-2">
        Descriptive patterns from your ledger — anomalies, recurring charges, liquidity. No investment advice.
      </p>

      {loading && findings.length === 0 ? (
        <div className="py-8 flex items-center gap-2" role="status" aria-label="Analyzing transactions">
          <div className="space-y-3 w-full">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton h-16 w-full" />
            ))}
          </div>
          <span className="sr-only">Analyzing financial transactions…</span>
        </div>
      ) : findings.length === 0 ? (
        <div className="py-8 text-center">
          <p className="eyebrow mb-2">Nothing flagged</p>
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
            No unusual patterns in the current window. Check back after more activity.
          </p>
        </div>
      ) : (
        <div>
          {findings.map((item, idx) => (
            <article
              key={idx}
              className="py-5 border-b border-ivory-border dark:border-surface-dark-border last:border-0"
            >
              <div className="flex items-center gap-2 mb-1.5">
                {iconFor(item.severity)}
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-secondary dark:text-text-dark-secondary">
                  {item.tag}
                </p>
                {item.confidence && (
                  <span className="ml-auto text-[11px] text-text-tertiary dark:text-text-dark-tertiary">
                    {item.confidence}
                  </span>
                )}
              </div>
              <h3 className="text-[15px] font-semibold text-zinc-900 dark:text-text-dark-primary leading-snug">
                {item.title}
              </h3>
              <p className="text-sm text-text-secondary dark:text-text-dark-secondary leading-relaxed mt-1">
                {item.description}
              </p>
              {item.evidence && (
                <p className="text-xs mono text-zinc-700 dark:text-text-dark-secondary mt-2">{item.evidence}</p>
              )}
              <div className="mt-2">
                <Link
                  to={item.link || '/transactions'}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand-amber hover:text-brand-amber-hover transition-colors"
                >
                  View related activity →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
