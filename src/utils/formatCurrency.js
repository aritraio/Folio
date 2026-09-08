/**
 * Currency formatting utilities for Ledger.
 * INR-first, but currency-aware via settings (INR/USD/EUR).
 */
import { CURRENCIES } from '../constants/finance.js';

function readSettingsCurrency() {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('ledger_settings');
      if (raw) {
        const s = JSON.parse(raw);
        if (s && typeof s.currency === 'string' && CURRENCIES[s.currency]) return s.currency;
      }
    }
  } catch {
    /* ignore — fall back to INR */
  }
  return 'INR';
}

export function resolveCurrency(explicit) {
  if (explicit && CURRENCIES[explicit]) return explicit;
  return readSettingsCurrency();
}

export function getCurrencySymbol(currency) {
  const code = resolveCurrency(currency);
  return CURRENCIES[code].symbol;
}

export function getCurrencyLocale(currency) {
  const code = resolveCurrency(currency);
  return CURRENCIES[code].locale;
}

/**
 * Format a number as standard currency.
 * Example INR: 142500 -> "₹1,42,500"
 * Pass { currency: 'USD' } to override settings.
 */
export function formatMoney(amount, options = {}) {
  const currency = resolveCurrency(options.currency);
  const { showSymbol = true, maximumFractionDigits = 0 } = options;

  if (amount === undefined || amount === null || Number.isNaN(Number(amount))) {
    return showSymbol ? `${CURRENCIES[currency].symbol}0` : '0';
  }

  const locale = CURRENCIES[currency].locale;
  const formatted = new Intl.NumberFormat(locale, {
    maximumFractionDigits,
    minimumFractionDigits: maximumFractionDigits,
  }).format(Math.abs(Number(amount)));

  const sign = Number(amount) < 0 ? '−' : '';
  const symbol = showSymbol ? CURRENCIES[currency].symbol : '';

  return `${sign}${symbol}${formatted}`;
}

/**
 * Format a number as standard Indian Rupee (INR) currency.
 * Kept for backward compat — delegates to formatMoney.
 * Pass { currency: 'USD'|'EUR' } to honor settings/override.
 */
export function formatINR(amount, options = {}) {
  if (options.currency) return formatMoney(amount, options);
  // Default: honor user settings so the Settings currency switch works.
  // Callers needing strict INR can pass { currency: 'INR' }.
  return formatMoney(amount, { ...options, currency: resolveCurrency() });
}

/**
 * Format large numbers compactly.
 * INR: 842350 -> "₹8.42L", 12500000 -> "₹1.25Cr", 45000 -> "₹45K"
 * USD/EUR: uses Intl compact notation ($1.2M, €842K).
 */
export function formatCompact(amount, options = {}) {
  const currency = resolveCurrency(options.currency);
  if (amount === undefined || amount === null || Number.isNaN(Number(amount))) {
    return `${CURRENCIES[currency].symbol}0`;
  }

  const num = Number(amount);
  const absAmount = Math.abs(num);
  const sign = num < 0 ? '−' : '';
  const symbol = CURRENCIES[currency].symbol;

  if (currency === 'INR') {
    if (absAmount >= 10000000) {
      const inCr = (absAmount / 10000000).toFixed(2);
      return `${sign}${symbol}${parseFloat(inCr)}Cr`;
    }
    if (absAmount >= 100000) {
      const inLakh = (absAmount / 100000).toFixed(2);
      return `${sign}${symbol}${parseFloat(inLakh)}L`;
    }
    if (absAmount >= 1000) {
      const inK = (absAmount / 1000).toFixed(1);
      return `${sign}${symbol}${parseFloat(inK)}K`;
    }
    return formatMoney(amount, { currency });
  }

  if (absAmount >= 1000000) {
    return `${sign}${symbol}${parseFloat((absAmount / 1000000).toFixed(2))}M`;
  }
  if (absAmount >= 1000) {
    return `${sign}${symbol}${parseFloat((absAmount / 1000).toFixed(1))}K`;
  }
  return formatMoney(amount, { currency });
}

/**
 * Format a number as percentage string with sign.
 * Example: 4.312 -> "+4.31%", -1.2 -> "-1.20%"
 */
export function formatPercent(value, decimals = 2) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return '0.00%';
  }

  const num = Number(value);
  const sign = num > 0 ? '+' : num < 0 ? '' : '';
  return `${sign}${num.toFixed(decimals)}%`;
}

/**
 * Format monetary change with explicit prefix sign (+ or -).
 * Example: 34820 -> "+₹34,820", -2499 -> "−₹2,499"
 */
export function formatChange(amount, options = {}) {
  const currency = resolveCurrency(options.currency);
  if (amount === undefined || amount === null || Number.isNaN(Number(amount))) {
    return `${CURRENCIES[currency].symbol}0`;
  }

  if (Number(amount) === 0) return `${CURRENCIES[currency].symbol}0`;

  const sign = Number(amount) > 0 ? '+' : '−';
  const formatted = formatMoney(Math.abs(Number(amount)), { currency });
  return `${sign}${formatted}`;
}
