import React, { useState, useEffect } from 'react';
import { Modal, Input, Button } from '../ui';
import { searchMutualFunds, fetchLatestNav, POPULAR_INDIAN_MUTUAL_FUNDS } from '../../services/amfiService';
import { formatINR } from '../../utils/formatCurrency';
import { Search, RefreshCw } from 'lucide-react';

/**
 * MutualFundSearchModal — Search Indian Mutual Funds via AMFI directory and track holdings.
 */
export default function MutualFundSearchModal({ isOpen, onClose, holding, onSave }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedFund, setSelectedFund] = useState(null);
  const [units, setUnits] = useState('');
  const [avgNav, setAvgNav] = useState('');
  const [currentNav, setCurrentNav] = useState('');
  const [fetchingNav, setFetchingNav] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (holding) {
        setSelectedFund({
          schemeName: holding.name,
          category: holding.category,
        });
        setUnits(String(holding.units || ''));
        setAvgNav(String(holding.avgPrice || ''));
        setCurrentNav(String(holding.currentPrice || ''));
      } else {
        setSelectedFund(null);
        setUnits('');
        setAvgNav('');
        setCurrentNav('');
        setSearchQuery('');
        setSearchResults(POPULAR_INDIAN_MUTUAL_FUNDS.slice(0, 5));
      }
      setErrors({});
    }
  }, [isOpen, holding]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    setSearching(true);
    try {
      const results = await searchMutualFunds(query);
      setSearchResults(results);
    } catch (e) {
      console.warn('Search failed:', e);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectFund = async (fund) => {
    setSelectedFund(fund);
    if (fund.nav) {
      setCurrentNav(String(fund.nav));
      if (!avgNav) setAvgNav(String(fund.nav));
    } else if (fund.schemeCode) {
      setFetchingNav(true);
      try {
        const live = await fetchLatestNav(fund.schemeCode);
        setCurrentNav(String(live.nav));
        if (!avgNav) setAvgNav(String(live.nav));
      } catch {
        setCurrentNav('100.0');
      } finally {
        setFetchingNav(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!selectedFund) newErrors.fund = 'Please search and select a mutual fund';
    if (!units || Number(units) <= 0) newErrors.units = 'Valid units required';
    if (!avgNav || Number(avgNav) <= 0) newErrors.avgNav = 'Valid purchase NAV required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      ...(holding || {}),
      name: selectedFund.schemeName,
      type: 'mutual_fund',
      category: 'Mutual Fund',
      units: Number(units),
      avgPrice: Number(avgNav),
      currentPrice: Number(currentNav) || Number(avgNav),
      schemeCode: selectedFund.schemeCode,
    };

    onSave(payload);
    onClose();
  };

  const investedAmount = (Number(units) || 0) * (Number(avgNav) || 0);
  const currentVal = (Number(units) || 0) * (Number(currentNav) || Number(avgNav) || 0);
  const returns = currentVal - investedAmount;
  const returnPct = investedAmount > 0 ? (returns / investedAmount) * 100 : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={holding ? 'Edit Mutual Fund Holding' : 'Add Indian Mutual Fund (AMFI)'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-1">
        {/* Fund Search Section */}
        {!selectedFund ? (
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-text-tertiary absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by fund name (e.g. Parag Parikh, Quant Small Cap, Mirae Asset)..."
                autoFocus
                className="
                  w-full pl-9 pr-4 py-2.5 rounded-lg text-xs
                  bg-white dark:bg-surface-dark-card
                  border border-ivory-border dark:border-surface-dark-border
                  text-zinc-900 dark:text-text-dark-primary
                  focus:ring-2 focus:ring-brand-amber focus:outline-none
                "
              />
              {searching && (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-amber absolute right-3 top-3" />
              )}
            </div>

            {errors.fund && <p className="text-xs text-red-500">{errors.fund}</p>}

            <div className="space-y-1.5 max-h-56 overflow-y-auto divide-y divide-ivory-border dark:divide-surface-dark-border border border-ivory-border dark:border-surface-dark-border rounded-lg">
              {searchResults.map((fund) => (
                <div
                  key={fund.schemeCode || fund.schemeName}
                  onClick={() => handleSelectFund(fund)}
                  className="p-2.5 text-xs hover:bg-ivory-tertiary dark:hover:bg-surface-dark-hover cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-900 dark:text-text-dark-primary line-clamp-1">
                      {fund.schemeName}
                    </span>
                    {fund.nav && (
                      <span className="mono font-medium text-text-secondary ml-2 shrink-0">
                        NAV: ₹{fund.nav}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-text-tertiary flex items-center gap-2 mt-0.5">
                    <span>{fund.amc || 'Direct Plan'}</span>
                    <span>•</span>
                    <span>{fund.category || 'Equity'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-lg border border-brand-amber/40 bg-amber-50/20 dark:bg-amber-950/20 flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <span className="text-[10px] uppercase font-bold text-brand-amber">Selected Fund</span>
              <p className="text-xs font-semibold text-zinc-900 dark:text-text-dark-primary truncate">
                {selectedFund.schemeName}
              </p>
              <p className="text-[11px] text-text-secondary">
                Latest AMFI NAV: {fetchingNav ? 'Fetching...' : `₹${currentNav || '—'}`}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedFund(null)} type="button">
              Change
            </Button>
          </div>
        )}

        {/* Units and Pricing Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Units Held"
            name="units"
            type="number"
            step="0.001"
            min="0.001"
            value={units}
            onChange={(e) => setUnits(e.target.value)}
            placeholder="e.g. 142.85"
            error={errors.units}
            required
          />

          <Input
            label="Average Purchase NAV (₹)"
            name="avgNav"
            type="number"
            step="0.01"
            min="0.01"
            value={avgNav}
            onChange={(e) => setAvgNav(e.target.value)}
            placeholder="e.g. 68.50"
            error={errors.avgNav}
            required
          />
        </div>

        <Input
          label="Current Market NAV (₹)"
          name="currentNav"
          type="number"
          step="0.01"
          min="0.01"
          value={currentNav}
          onChange={(e) => setCurrentNav(e.target.value)}
          placeholder="Auto-fetched via AMFI"
        />

        {/* Live Return Preview Card */}
        {investedAmount > 0 && (
          <div className="p-3 rounded-lg border border-ivory-border dark:border-surface-dark-border bg-ivory-warm/30 dark:bg-surface-dark-card/40 grid grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-text-tertiary">Invested</span>
              <p className="font-semibold mono text-zinc-900 dark:text-text-dark-primary">
                {formatINR(investedAmount)}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-text-tertiary">Current Value</span>
              <p className="font-semibold mono text-zinc-900 dark:text-text-dark-primary">
                {formatINR(currentVal)}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-text-tertiary">Overall Return</span>
              <p className={`font-semibold mono ${returns >= 0 ? 'text-brand-emerald' : 'text-brand-red'}`}>
                {returns >= 0 ? '+' : ''}
                {formatINR(returns)} ({returnPct.toFixed(1)}%)
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {holding ? 'Update Holding' : 'Save to Portfolio'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
