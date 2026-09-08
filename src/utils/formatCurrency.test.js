import { describe, it, expect, beforeEach } from 'vitest';
import { formatMoney, formatINR, formatCompact, formatPercent, formatChange } from './formatCurrency.js';

beforeEach(() => {
  localStorage.clear();
});

describe('formatMoney / formatINR', () => {
  it('formats INR with en-IN grouping by default', () => {
    expect(formatINR(142500)).toBe('₹1,42,500');
    expect(formatMoney(142500, { currency: 'INR' })).toBe('₹1,42,500');
  });
  it('honors USD override', () => {
    expect(formatMoney(142500, { currency: 'USD' })).toBe('$142,500');
  });
  it('uses minus sign − for negatives', () => {
    expect(formatINR(-2500)).toBe('−₹2,500');
  });
  it('handles NaN/null safely', () => {
    expect(formatINR(NaN)).toBe('₹0');
    expect(formatINR(null)).toBe('₹0');
    expect(formatMoney(undefined, { currency: 'USD' })).toBe('$0');
  });
  it('supports fraction digits', () => {
    expect(formatMoney(1234.5, { currency: 'USD', maximumFractionDigits: 2 })).toBe('$1,234.50');
  });
});

describe('formatCompact', () => {
  it('INR uses L/Cr/K', () => {
    expect(formatCompact(842350, { currency: 'INR' })).toBe('₹8.42L');
    expect(formatCompact(12500000, { currency: 'INR' })).toBe('₹1.25Cr');
    expect(formatCompact(45000, { currency: 'INR' })).toBe('₹45K');
  });
  it('USD uses K/M', () => {
    expect(formatCompact(2500000, { currency: 'USD' })).toBe('$2.5M');
    expect(formatCompact(45000, { currency: 'USD' })).toBe('$45K');
  });
});

describe('formatPercent / formatChange', () => {
  it('percent with sign', () => {
    expect(formatPercent(4.312)).toBe('+4.31%');
    expect(formatPercent(-1.2)).toBe('-1.20%');
    expect(formatPercent(0)).toBe('0.00%');
  });
  it('change prefixes +/− with symbol', () => {
    expect(formatChange(34820, { currency: 'INR' })).toBe('+₹34,820');
    expect(formatChange(-2499, { currency: 'INR' })).toBe('−₹2,499');
    expect(formatChange(0)).toBe('₹0');
  });
});
