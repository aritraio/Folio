import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSettings, saveSettings } from '../services/storage';

/**
 * ThemeContext — Provides the current resolved theme ('light' | 'dark'),
 * the user's preference ('light' | 'dark' | 'system'), and a setter.
 */
const ThemeContext = createContext({
  theme: 'light', // resolved: 'light' | 'dark'
  preference: 'system', // user setting: 'light' | 'dark' | 'system'
  setPreference: () => {},
});

export const useTheme = () => useContext(ThemeContext);

/**
 * Resolve the effective theme from the user's preference.
 * If 'system', query the media query for prefers-color-scheme.
 */
function resolveTheme(preference) {
  if (preference === 'dark') return 'dark';
  if (preference === 'light') return 'light';
  // 'system' — check OS preference
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

/**
 * Apply or remove the 'dark' class on <html>.
 */
function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

/**
 * ThemeProvider — Wraps the app and manages dark/light mode.
 *
 * Reads the user's theme preference from localStorage (via settings),
 * respects `prefers-color-scheme` for the "system" option,
 * and listens for changes from the Settings page or OS.
 */
export default function ThemeProvider({ children }) {
  const [preference, setPreferenceState] = useState(() => {
    const settings = getSettings();
    return settings.theme || 'system';
  });

  const [theme, setTheme] = useState(() => resolveTheme(preference));

  // Apply the dark class whenever theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Re-resolve when preference changes
  useEffect(() => {
    setTheme(resolveTheme(preference));
  }, [preference]);

  // Listen for OS color scheme changes (only matters when preference === 'system')
  useEffect(() => {
    if (preference !== 'system') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      setTheme(e.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [preference]);

  // Listen for settings changes from other parts of the app (e.g. Settings page)
  useEffect(() => {
    const handler = () => {
      const settings = getSettings();
      const newPref = settings.theme || 'system';
      setPreferenceState(newPref);
    };
    window.addEventListener('ledger_settings_updated', handler);
    return () => window.removeEventListener('ledger_settings_updated', handler);
  }, []);

  // Setter that also persists to localStorage
  const setPreference = useCallback((newPref) => {
    setPreferenceState(newPref);
    const settings = getSettings();
    saveSettings({ ...settings, theme: newPref });
    window.dispatchEvent(new Event('ledger_settings_updated'));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, preference, setPreference }}>{children}</ThemeContext.Provider>
  );
}
