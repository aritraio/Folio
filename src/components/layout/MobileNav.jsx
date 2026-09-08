import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Wallet,
  LayoutDashboard,
  ArrowLeftRight,
  Landmark,
  BarChart3,
  PiggyBank,
  TrendingUp,
  Settings,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/accounts', label: 'Accounts', icon: Landmark },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/budgets', label: 'Budgets', icon: PiggyBank },
  { to: '/investments', label: 'Investments', icon: TrendingUp },
  { to: '/settings', label: 'Settings', icon: Settings },
];

/**
 * MobileNav — Hamburger menu with slide-out drawer for mobile viewports.
 *
 * Features:
 * - Hamburger toggle (visible below lg breakpoint)
 * - Full-height slide-out drawer from the left
 * - Overlay backdrop with click-to-close
 * - Close on Escape key
 * - Focus trap inside drawer
 * - Auto-close on route change
 * - Accessible: aria-modal, aria-label, focus management
 */
export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const drawerRef = useRef(null);
  const triggerRef = useRef(null);
  const previousActiveRef = useRef(null);

  const open = () => {
    previousActiveRef.current = document.activeElement;
    setIsOpen(true);
  };

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Close on route change
  useEffect(() => {
    close();
  }, [location.pathname, close]);

  // Escape key + focus trap + body scroll lock
  useEffect(() => {
    if (!isOpen) {
      // Restore focus to trigger when closing
      previousActiveRef.current?.focus();
      return;
    }

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        close();
        return;
      }

      // Focus trap
      if (e.key === 'Tab') {
        const focusable = drawerRef.current?.querySelectorAll(
          'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable?.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Focus first item in drawer
    const timer = setTimeout(() => {
      const closeBtn = drawerRef.current?.querySelector('button');
      closeBtn?.focus();
    }, 100);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, close]);

  return (
    <>
      {/* Hamburger Button — visible only below lg */}
      <button
        ref={triggerRef}
        onClick={open}
        className="
          lg:hidden
          p-2 rounded-lg
          text-zinc-600 dark:text-zinc-400
          hover:bg-ivory-muted dark:hover:bg-surface-dark-elevated
          transition-colors duration-150
        "
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
        aria-controls="mobile-nav-drawer"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Overlay + Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 dark:bg-black/60 animate-backdrop-fade"
            onClick={close}
            aria-hidden="true"
          />

          {/* Drawer */}
          <aside
            ref={drawerRef}
            id="mobile-nav-drawer"
            className="
              absolute top-0 left-0 bottom-0
              w-72 max-w-[80vw]
              bg-white dark:bg-surface-dark-card
              border-r border-ivory-border dark:border-surface-dark-border
              shadow-modal
              flex flex-col
              animate-slide-in-left
            "
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 h-16 border-b border-ivory-border dark:border-surface-dark-border">
              <NavLink to="/" className="flex items-center gap-2.5" onClick={close}>
                <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-[rgba(245,158,11,0.12)] text-brand-amber">
                  <Wallet className="w-5 h-5" />
                </div>
                <span className="font-serif-display text-lg font-bold tracking-tight text-zinc-900 dark:text-text-dark-primary">
                  Ledger
                </span>
              </NavLink>
              <button
                onClick={close}
                className="
                  p-2 rounded-lg
                  text-zinc-400 hover:text-zinc-600
                  dark:text-zinc-500 dark:hover:text-zinc-300
                  hover:bg-zinc-100 dark:hover:bg-surface-dark-elevated
                  transition-colors duration-150
                "
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto py-4 px-3" aria-label="Mobile navigation">
              <ul className="space-y-1">
                {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      end={to === '/'}
                      onClick={close}
                      className={({ isActive }) => `
                        flex items-center gap-3 px-3 py-2.5 rounded-lg
                        text-sm font-medium
                        transition-all duration-150
                        ${
                          isActive
                            ? 'bg-amber-50 dark:bg-[rgba(245,158,11,0.12)] text-brand-amber dark:text-amber-400'
                            : 'text-zinc-700 dark:text-text-dark-secondary hover:bg-ivory-muted dark:hover:bg-surface-dark-elevated hover:text-zinc-900 dark:hover:text-text-dark-primary'
                        }
                      `}
                    >
                      <Icon className="w-[18px] h-[18px] shrink-0" />
                      <span>{label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Drawer Footer */}
            <div className="px-5 py-4 border-t border-ivory-border dark:border-surface-dark-border">
              <div className="flex items-center gap-3">
                <div
                  className="
                  w-8 h-8 rounded-full
                  bg-gradient-to-br from-amber-400 to-orange-500
                  flex items-center justify-center
                  text-white text-xs font-bold
                  shadow-sm
                "
                >
                  A
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-text-dark-primary truncate">
                    Aritra
                  </p>
                  <p className="text-xs text-zinc-500 truncate">aritra@example.com</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
