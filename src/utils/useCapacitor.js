import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { useTheme } from '../components/ThemeProvider';

/**
 * useCapacitor — Hook to bridge native Android platform features with Folio.
 * - Manages hardware back button navigation & modal dismissals
 * - Dynamically synchronizes native status bar styling with the active theme
 */
export function useCapacitor() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  // 1. Synchronize Status Bar with the active theme
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const isDark = theme === 'dark' || document.documentElement.classList.contains('dark');

    StatusBar.setStyle({
      style: isDark ? Style.Dark : Style.Light,
    }).catch(() => {});

    StatusBar.setBackgroundColor({
      color: isDark ? '#0A0A0A' : '#FAFAFA',
    }).catch(() => {});
  }, [theme]);

  // 2. Hardware Back Button handler
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let backListenerHandle = null;

    const setupListener = async () => {
      backListenerHandle = await App.addListener('backButton', () => {
        // Priority 1: If an open modal/dialog exists, dismiss it
        const openDialog = document.querySelector('[role="dialog"], [aria-modal="true"]');
        if (openDialog) {
          const closeButton = openDialog.querySelector('button[aria-label*="close" i], button[title*="close" i]');
          if (closeButton) {
            closeButton.click();
            return;
          }
          // Dispatch Escape key event as fallback
          if (typeof window !== 'undefined' && window.KeyboardEvent) {
            document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }));
          }
          return;
        }

        // Priority 2: If we are on a subpage, navigate back
        if (location.pathname !== '/') {
          navigate(-1);
        } else {
          // Priority 3: On dashboard root, exit app
          App.exitApp();
        }
      });
    };

    setupListener();

    return () => {
      if (backListenerHandle) {
        backListenerHandle.remove();
      }
    };
  }, [location.pathname, navigate]);
}
