import { describe, it, expect } from 'vitest';
import { toDate, formatDate, getMonthYear, getLastNMonths, isThisMonth, isLastMonth } from './dateUtils.js';

describe('dateUtils', () => {
  it('toDate parses ISO and falls back safely', () => {
    expect(toDate('2026-08-10').getFullYear()).toBe(2026);
    expect(toDate(new Date('2026-01-01')).getMonth()).toBe(0);
    expect(toDate(null)).toBeInstanceOf(Date);
  });

  it('formatDate / getMonthYear', () => {
    expect(formatDate('2026-08-10')).toContain('Aug');
    expect(getMonthYear('2026-08-10')).toBe('August 2026');
  });

  it('getLastNMonths returns ordered keys', () => {
    const out = getLastNMonths(3, new Date('2026-09-15'));
    expect(out.map((m) => m.monthKey)).toEqual(['2026-07', '2026-08', '2026-09']);
    expect(out[0]).toHaveProperty('label');
    expect(out[0]).toHaveProperty('shortLabel');
  });

  it('isThisMonth / isLastMonth', () => {
    const now = new Date();
    expect(isThisMonth(now)).toBe(true);
    const last = new Date(now.getFullYear(), now.getMonth() - 1, 15);
    expect(isLastMonth(last)).toBe(true);
  });
});
