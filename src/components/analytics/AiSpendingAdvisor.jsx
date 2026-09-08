import React, { useState, useEffect } from 'react';
import { Sparkles, AlertTriangle, Lightbulb, CheckCircle2, RefreshCw } from 'lucide-react';
import { generateSpendingFindings } from '../../services/geminiService';
import { useData } from '../../contexts/DataContext';
import { Badge } from '../ui';

/**
 * AiSpendingAdvisor — Proactive AI Financial Briefing Card.
 * Discovers spending anomalies, subscription traps, and credit card utilization insights.
 */
export default function AiSpendingAdvisor({ transactions = [], accounts = [], budgets = [] }) {
  const { settings } = useData();
  const apiKey = settings?.geminiApiKey || '';
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFindings = async () => {
    setLoading(true);
    try {
      const results = await generateSpendingFindings(transactions, accounts, budgets, apiKey);
      setFindings(results);
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

  return (
    <div className="card p-5 space-y-4 border-amber-200/60 dark:border-amber-900/30 bg-gradient-to-br from-amber-50/20 via-transparent to-transparent animate-fade-in-up">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-brand-amber flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-serif-display font-bold text-zinc-900 dark:text-text-dark-primary">
                AI Spending Findings & Discoveries
              </h3>
              <Badge variant={apiKey ? 'amber' : 'gray'} size="sm">
                {apiKey ? 'Gemini AI Active' : 'Heuristic Engine'}
              </Badge>
            </div>
            <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
              Automated pattern detection across subscriptions, lifestyle creep, and liquidity cushion
            </p>
          </div>
        </div>

        <button
          onClick={fetchFindings}
          disabled={loading}
          className="
            p-2 rounded-lg border border-ivory-border dark:border-surface-dark-border
            hover:bg-ivory-tertiary dark:hover:bg-surface-dark-hover
            text-text-secondary dark:text-text-dark-secondary transition-colors
            disabled:opacity-50
          "
          title="Re-run Analysis"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Findings Grid */}
      {loading && findings.length === 0 ? (
        <div className="py-8 text-center text-xs text-text-secondary flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-brand-amber" />
          Analyzing financial transactions...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {findings.map((item, idx) => {
            const isAlert = item.severity === 'alert';
            const isPositive = item.severity === 'positive';
            return (
              <div
                key={idx}
                className={`
                  p-3.5 rounded-lg border text-xs space-y-1.5 transition-all
                  ${
                    isAlert
                      ? 'bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-900/40'
                      : isPositive
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                        : 'bg-white dark:bg-surface-dark-card border-ivory-border dark:border-surface-dark-border'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                    {item.tag}
                  </span>
                  {isAlert && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                  {isPositive && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                  {!isAlert && !isPositive && <Lightbulb className="w-3.5 h-3.5 text-brand-amber" />}
                </div>

                <h4 className="font-semibold text-zinc-900 dark:text-text-dark-primary text-sm">
                  {item.title}
                </h4>
                <p className="text-text-secondary dark:text-text-dark-secondary leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
