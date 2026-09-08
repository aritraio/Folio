import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, X } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { formatMoney } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/dateUtils';

function useDebouncedValue(value, delay = 150) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function GlobalSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const { transactions, accounts, budgets, investments } = useData();

  const debouncedQuery = useDebouncedValue(query, 150);

  const results = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return { transactions: [], accounts: [], budgets: [], investments: [] };

    const txMatches = transactions
      .filter((t) => {
        const acc = accounts.find((a) => a.id === t.accountId);
        return (
          t.merchant?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.category?.toLowerCase().includes(q) ||
          t.notes?.toLowerCase().includes(q) ||
          acc?.name.toLowerCase().includes(q)
        );
      })
      .slice(0, 6)
      .map((t) => ({ kind: 'transaction', id: t.id, data: t }));

    const accMatches = accounts
      .filter((a) => a.name?.toLowerCase().includes(q))
      .slice(0, 2)
      .map((a) => ({ kind: 'account', id: a.id, data: a }));

    const budMatches = budgets
      .filter((b) => b.category?.toLowerCase().includes(q))
      .slice(0, 2)
      .map((b) => ({ kind: 'budget', id: b.id, data: b }));

    const invMatches = investments
      .filter((i) => i.name?.toLowerCase().includes(q))
      .slice(0, 2)
      .map((i) => ({ kind: 'investment', id: i.id, data: i }));

    return {
      transactions: txMatches,
      accounts: accMatches,
      budgets: budMatches,
      investments: invMatches,
    };
  }, [debouncedQuery, transactions, accounts, budgets, investments]);

  const flatResults = useMemo(
    () => [...results.transactions, ...results.accounts, ...results.budgets, ...results.investments],
    [results]
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [debouncedQuery]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (flatResults.length ? (prev + 1) % flatResults.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        flatResults.length ? (prev - 1 + flatResults.length) % flatResults.length : 0
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatResults[selectedIndex]) {
        handleSelect(flatResults[selectedIndex]);
      } else if (query.trim()) {
        navigate(`/transactions?search=${encodeURIComponent(query.trim())}`);
        onClose();
      }
    }
  };

  const handleSelect = (item) => {
    if (item.kind === 'transaction') {
      navigate(
        `/transactions?search=${encodeURIComponent(item.data.merchant || item.data.description || '')}`
      );
    } else if (item.kind === 'account') {
      navigate('/accounts');
    } else if (item.kind === 'budget') {
      navigate('/budgets');
    } else if (item.kind === 'investment') {
      navigate('/investments');
    }
    onClose();
  };

  if (!isOpen) return null;

  const hasQuery = query.trim().length > 0;
  const hasResults = flatResults.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] sm:pt-[15vh] px-4 backdrop-blur-sm bg-zinc-900/40 dark:bg-black/60"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Global search"
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-surface-dark-card rounded-2xl shadow-modal overflow-hidden animate-fade-in-scale motion-reduce:animate-none border border-ivory-border dark:border-surface-dark-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 border-b border-ivory-border dark:border-surface-dark-border">
          <Search className="w-5 h-5 text-zinc-400 dark:text-zinc-500 shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={hasResults}
            aria-controls="global-search-results"
            aria-label="Search transactions, accounts, budgets, investments"
            className="w-full bg-transparent border-0 py-4 px-3 text-lg text-zinc-900 dark:text-text-dark-primary placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-0"
            placeholder="Search transactions, accounts, budgets…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setTimeout(() => inputRef.current?.focus(), 10);
              }}
              aria-label="Clear search"
              className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:text-zinc-300 dark:hover:bg-surface-dark-elevated transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="max-h-[60vh] overflow-y-auto" id="global-search-results" role="listbox">
          {hasQuery && !hasResults ? (
            <div className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-400">
              <p>No results found for &ldquo;{query}&rdquo;</p>
            </div>
          ) : (
            <ul className="py-2">
              {flatResults.map((item, idx) => (
                <li key={`${item.kind}-${item.id}`} role="option" aria-selected={idx === selectedIndex}>
                  {item.kind === 'transaction' ? (
                    <button
                      className={`w-full text-left px-4 py-3 flex items-center justify-between group transition-colors ${
                        idx === selectedIndex
                          ? 'bg-ivory-muted dark:bg-surface-dark-elevated'
                          : 'hover:bg-ivory-muted/50 dark:hover:bg-surface-dark-elevated/50'
                      }`}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      onClick={() => handleSelect(item)}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            item.data.type === 'expense'
                              ? 'bg-brand-red'
                              : item.data.type === 'income'
                                ? 'bg-brand-emerald'
                                : 'bg-brand-amber'
                          }`}
                        />
                        <div className="truncate">
                          <div className="text-sm font-semibold text-zinc-900 dark:text-text-dark-primary truncate">
                            {item.data.merchant || item.data.description}
                          </div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate flex items-center gap-2">
                            <span>{item.data.category}</span>
                            <span>•</span>
                            <span>{formatDate(item.data.date)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <span
                          className={`font-mono font-medium ${
                            item.data.type === 'expense'
                              ? 'text-zinc-900 dark:text-text-dark-primary'
                              : item.data.type === 'income'
                                ? 'text-brand-emerald'
                                : 'text-zinc-500'
                          }`}
                        >
                          {item.data.type === 'expense' ? '−' : item.data.type === 'income' ? '+' : ''}
                          {formatMoney(item.data.amount)}
                        </span>
                        <ArrowRight
                          className={`w-4 h-4 transition-colors ${
                            idx === selectedIndex
                              ? 'text-zinc-400 dark:text-zinc-300'
                              : 'text-transparent group-hover:text-zinc-300 dark:group-hover:text-zinc-600'
                          }`}
                        />
                      </div>
                    </button>
                  ) : (
                    <button
                      className={`w-full text-left px-4 py-3 flex items-center justify-between group transition-colors ${
                        idx === selectedIndex
                          ? 'bg-ivory-muted dark:bg-surface-dark-elevated'
                          : 'hover:bg-ivory-muted/50 dark:hover:bg-surface-dark-elevated/50'
                      }`}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      onClick={() => handleSelect(item)}
                    >
                      <div className="truncate">
                        <div className="text-xs uppercase tracking-wider text-zinc-400 mb-0.5">
                          {item.kind}
                        </div>
                        <div className="text-sm font-semibold text-zinc-900 dark:text-text-dark-primary truncate">
                          {item.kind === 'account'
                            ? item.data.name
                            : item.kind === 'budget'
                              ? item.data.category
                              : item.data.name}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-400" />
                    </button>
                  )}
                </li>
              ))}
              {hasQuery && hasResults && (
                <li className="px-4 py-2 border-t border-ivory-border dark:border-surface-dark-border mt-2">
                  <button
                    onClick={() => {
                      navigate(`/transactions?search=${encodeURIComponent(query.trim())}`);
                      onClose();
                    }}
                    className="w-full py-2 text-sm text-center font-medium text-brand-amber hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
                  >
                    View all results for &ldquo;{query.trim()}&rdquo;
                  </button>
                </li>
              )}
            </ul>
          )}
        </div>

        <div className="px-4 py-3 bg-zinc-50 dark:bg-surface-dark text-xs text-zinc-500 dark:text-zinc-400 border-t border-ivory-border dark:border-surface-dark-border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300">
                ↑
              </kbd>{' '}
              <kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300">
                ↓
              </kbd>{' '}
              to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300">
                Enter
              </kbd>{' '}
              to select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300">
                Esc
              </kbd>{' '}
              to close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
