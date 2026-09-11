import React, { useEffect, useRef, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
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
import { useData } from '../../contexts/DataContext';

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
 * SidebarDrawer — Unified side hamburger menu for all screen sizes.
 *
 * - 280px (320px on sm+) panel, 1px right border, dark scrim w/ blur
 * - 280ms expo slide-in + per-item stagger cascade
 * - Full keyboard support: Escape closes, Tab trapped, focus restored
 *
 * @param {boolean} isOpen
 * @param {() => void} onClose
 */
export default function SidebarDrawer({ isOpen, onClose }) {
  const drawerRef = useRef(null);
  const previousActiveRef = useRef(null);
  const navigate = useNavigate();
  const { settings } = useData();
  const userName = settings?.userName || 'User';
  const userEmail = settings?.email || '';
  const initials = (userName || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const close = useCallback(() => {
    onClose();
  }, [onClose]);

  // Escape + focus trap + scroll lock while open; restore focus on close.
  useEffect(() => {
    if (!isOpen) {
      previousActiveRef.current?.focus?.();
      return;
    }

    previousActiveRef.current = document.activeElement;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        close();
        return;
      }
      if (e.key === 'Tab') {
        const focusable = drawerRef.current?.querySelectorAll(
          'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const timer = setTimeout(() => {
      drawerRef.current?.querySelector('button')?.focus();
    }, 100);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop scrim */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-backdrop-fade motion-reduce:animate-none"
        onClick={close}
        aria-hidden="true"
      />

      {/* Slide-in panel */}
      <aside
        ref={drawerRef}
        id="sidebar-drawer"
        className="
          drawer-panel motion-reduce:animate-none
          absolute top-0 left-0 bottom-0
          w-[280px] max-w-[85vw] sm:w-[320px]
          bg-white dark:bg-[#0A0A0A]
          border-r border-[#E5E5E5] dark:border-[#262626]
          flex flex-col
        "
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
      >
        {/* Header */}
        <div
          className="drawer-item flex items-center justify-between px-5 h-16 border-b border-[#E5E5E5] dark:border-[#262626] shrink-0"
          style={{ '--stagger-delay': '25ms' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A]">
              <Terminal className="w-5 h-5" />
            </div>
            <span className="font-sans text-base font-semibold tracking-tight text-[#0A0A0A] dark:text-white">
              FOLIO
            </span>
            <span className="font-mono text-[10px] font-medium text-[#8E9192] border border-[#E5E5E5] dark:border-[#262626] rounded px-1.5 py-0.5">
              v1.0
            </span>
          </div>
          <button
            onClick={close}
            className="
              p-2 rounded
              text-[#8E9192] hover:text-[#0A0A0A] dark:hover:text-white
              hover:bg-[#F5F5F5] dark:hover:bg-[#1E1E1E]
              transition-all duration-150 ease-out
              active:scale-[0.97]
            "
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto py-4 px-3" aria-label="Primary">
          <p
            className="drawer-item px-3 pb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8E9192]"
            style={{ '--stagger-delay': '40ms' }}
          >
            Menu
          </p>
          <ul className="space-y-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon }, i) => (
              <li
                key={to}
                className="drawer-item"
                style={{ '--stagger-delay': `${50 + i * 25}ms` }}
              >
                <NavLink
                  to={to}
                  end={to === '/'}
                  onClick={close}
                  className={({ isActive }) => `
                    relative flex items-center gap-3 px-3 py-2.5 rounded
                    text-sm font-medium
                    border
                    transition-all duration-150 ease-out
                    active:scale-[0.97]
                    ${
                      isActive
                        ? 'bg-[#0A0A0A] text-white border-[#0A0A0A] dark:bg-white dark:text-[#0A0A0A] dark:border-white'
                        : 'border-transparent text-[#404040] dark:text-[#C4C7C8] hover:bg-[#F5F5F5] dark:hover:bg-[#1E1E1E] hover:text-[#0A0A0A] dark:hover:text-white hover:translate-x-1'
                    }
                  `}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-full bg-white dark:bg-[#0A0A0A]"
                          aria-hidden="true"
                        />
                      )}
                      <Icon className="w-[18px] h-[18px] shrink-0" />
                      <span>{label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div
          className="drawer-item px-5 py-4 border-t border-[#E5E5E5] dark:border-[#262626] shrink-0"
          style={{ '--stagger-delay': '225ms' }}
        >
          <button
            onClick={() => {
              close();
              navigate('/settings');
            }}
            className="
              w-full flex items-center gap-3 p-1.5 -m-1.5 rounded
              hover:bg-[#F5F5F5] dark:hover:bg-[#1E1E1E]
              transition-all duration-150 ease-out
              active:scale-[0.97]
              text-left
            "
            aria-label="Open settings"
          >
            <div className="w-8 h-8 rounded bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] flex items-center justify-center text-xs font-bold font-mono shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#0A0A0A] dark:text-white truncate">
                {userName}
              </p>
              {userEmail && <p className="text-xs text-[#8E9192] truncate font-mono">{userEmail}</p>}
            </div>
          </button>
          <p className="mt-3 text-center font-mono text-[10px] tracking-wider text-[#8E9192]">
            Made by Aritra &amp; Dishari with ❤️
          </p>
        </div>
      </aside>
    </div>
  );
}
