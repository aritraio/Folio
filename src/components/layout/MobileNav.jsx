import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Terminal,
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
 * MobileNav — Terminal slide-out drawer. #111111 bg, 1px #262626 border.
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
          p-2 rounded
          text-[#8E9192]
          hover:bg-[#F5F5F5] dark:hover:bg-[#1E1E1E]
          hover:text-[#0A0A0A] dark:hover:text-white
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
            className="absolute inset-0 bg-black/60 animate-backdrop-fade"
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
              bg-white dark:bg-[#111111]
              border-r border-[#E5E5E5] dark:border-[#262626]
              flex flex-col
              animate-slide-in-left
            "
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 h-16 border-b border-[#E5E5E5] dark:border-[#262626]">
              <NavLink to="/" className="flex items-center gap-2.5" onClick={close}>
                <div className="p-1.5 rounded bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A]">
                  <Terminal className="w-5 h-5" />
                </div>
                <span className="font-sans text-lg font-semibold tracking-tight text-[#0A0A0A] dark:text-white">
                  FOLIO
                </span>
              </NavLink>
              <button
                onClick={close}
                className="
                  p-2 rounded
                  text-[#8E9192] hover:text-[#0A0A0A]
                  dark:hover:text-white
                  hover:bg-[#F5F5F5] dark:hover:bg-[#1E1E1E]
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
                        flex items-center gap-3 px-3 py-2.5 rounded
                        text-sm font-medium
                        border
                        transition-colors duration-150
                        ${
                          isActive
                            ? 'bg-[#F5F5F5] border-[#E5E5E5] text-[#0A0A0A] dark:bg-[#1E1E1E] dark:border-[#404040] dark:text-white'
                            : 'border-transparent text-[#404040] dark:text-[#C4C7C8] hover:bg-[#F5F5F5] dark:hover:bg-[#1E1E1E] hover:text-[#0A0A0A] dark:hover:text-white'
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
            <div className="px-5 py-4 border-t border-[#E5E5E5] dark:border-[#262626]">
              <div className="flex items-center gap-3">
                <div
                  className="
                  w-8 h-8 rounded
                  bg-[#0A0A0A] text-white
                  dark:bg-white dark:text-[#0A0A0A]
                  flex items-center justify-center
                  text-xs font-bold font-mono
                "
                >
                  A
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#0A0A0A] dark:text-white truncate">
                    Aritra
                  </p>
                  <p className="text-xs text-[#8E9192] truncate font-mono">aritra@example.com</p>
                </div>
              </div>
              <p className="mt-3 text-[11px] text-[#8E9192] font-mono text-center">
                Made by Aritra &amp; Dishari with ❤️
              </p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
