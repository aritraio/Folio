import { useTheme } from '../components/ThemeProvider';

/**
 * useChartTheme — Terminal Recharts theme, aware of light/dark mode.
 *
 * Dark mode: white linework on #0A0A0A/#141414 surfaces.
 * Light mode: black linework on #FAFAFA/#FFFFFF surfaces.
 * Financial signals (#00b894 / #ff6b6b) are identical in both modes.
 */

export const MONO_DARK = Object.freeze([
  '#FFFFFF',
  '#E4E4E7',
  '#A1A1AA',
  '#71717A',
  '#52525B',
  '#3F3F46',
  '#27272A',
]);

export const MONO_LIGHT = Object.freeze([
  '#27272A',
  '#3F3F46',
  '#52525B',
  '#71717A',
  '#A1A1AA',
  '#8E9192',
  '#C4C7C8',
]);

/* Invert a dark-mode gray tone for light surfaces (identity for mid gray). */
const INVERT_TONE = Object.freeze({
  '#FFFFFF': '#27272A',
  '#E4E4E7': '#3F3F46',
  '#A1A1AA': '#52525B',
  '#71717A': '#71717A',
  '#52525B': '#A1A1AA',
  '#3F3F46': '#E4E4E7',
  '#27272A': '#FFFFFF',
});

export function themedMonoColor(color, isDark) {
  if (isDark) return color;
  return INVERT_TONE[color] || color;
}

export const FINANCE_IN = '#00b894';
export const FINANCE_OUT = '#ff6b6b';

export default function useChartTheme() {
  const { theme } = useTheme();
  const isDark = theme !== 'light';

  return {
    isDark,
    /** Primary linework: white in dark, black in light. */
    line: isDark ? '#FFFFFF' : '#0A0A0A',
    /** Grid: #262626 in dark, #E5E5E5 in light. */
    grid: isDark ? '#262626' : '#E5E5E5',
    tick: '#8E9192',
    cursor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(10, 10, 10, 0.04)',
    areaTop: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(10, 10, 10, 0.05)',
    areaBottom: 'rgba(255, 255, 255, 0)',
    activeDotFill: isDark ? '#0A0A0A' : '#FFFFFF',
    income: FINANCE_IN,
    expense: FINANCE_OUT,
    monoPalette: isDark ? MONO_DARK : MONO_LIGHT,
    mono: (index) => (isDark ? MONO_DARK : MONO_LIGHT)[index % 7],
    monoColor: (color) => themedMonoColor(color, isDark),
  };
}
