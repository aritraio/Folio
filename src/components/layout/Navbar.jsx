import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Wallet,
  LayoutDashboard,
  ArrowLeftRight,
  Landmark,
  BarChart3,
  PiggyBank,
  TrendingUp,
  Settings,
  Search,
  Bell,
  User,
  Download,
  Moon,
  Sun,
  Sparkles,
} from 'lucide-react';
import MobileNav from './MobileNav';
import { useTheme } from '../ThemeProvider';
import { useData } from '../../contexts/DataContext';
import { downloadBackup } from '../../services/storage';
import StatementUploadModal from '../statements/StatementUploadModal';

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
 * Navbar — Desktop top navigation bar.
 *
 * Features:
 * - Logo / product name ("Ledger") left-aligned
 * - 7 navigation links with uppercase labels & icons
 * - Active link indicator (bottom border highlight)
 * - Right side: search icon, notification icon, user avatar/menu
 * - Sticky header with backdrop blur
 * - Dark mode support
 *
 * @param {() => void} onSearchClick — callback when search icon is clicked
 */
export default function Navbar({ onSearchClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);
  const { theme, preference, setPreference } = useTheme();
  const { settings } = useData();
  const userName = settings?.userName || 'User';
  const userEmail = settings?.email || '';
  const initials = (userName || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  // Cycle: light → dark → system → light …
  const cycleTheme = () => {
    const next = preference === 'light' ? 'dark' : preference === 'dark' ? 'system' : 'light';
    setPreference(next);
  };

  const themeLabel = preference === 'system' ? `System (${theme})` : preference === 'dark' ? 'Dark' : 'Light';

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    if (userMenuOpen || notifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen, notifOpen]);

  // Close menus on route change
  useEffect(() => {
    setUserMenuOpen(false);
    setNotifOpen(false);
  }, [location.pathname]);

  return (
    <nav
      className="
        sticky top-0 z-30
        bg-white/80 dark:bg-surface-dark/80
        backdrop-blur-xl
        border-b border-ivory-border dark:border-surface-dark-border
        transition-colors duration-200
      "
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* ── Left: Mobile Hamburger + Logo ── */}
          <div className="flex items-center gap-2">
            <MobileNav />
            <NavLink
              to="/"
              className="flex items-center gap-2.5 shrink-0 group"
              aria-label="Ledger — Go to dashboard"
            >
              <div
                className="
              p-2 rounded-lg
              bg-amber-50 dark:bg-[rgba(245,158,11,0.12)]
              text-brand-amber
              group-hover:bg-amber-100 dark:group-hover:bg-[rgba(245,158,11,0.2)]
              transition-colors duration-150
            "
              >
                <Wallet className="w-5 h-5" />
              </div>
              <span className="font-serif-display text-xl font-bold tracking-tight text-zinc-900 dark:text-text-dark-primary">
                Ledger
              </span>
            </NavLink>
          </div>

          {/* ── Center: Navigation Links ── */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                aria-label={label}
                className={({ isActive }) => `
                  relative px-3 py-2 rounded-lg
                  flex items-center gap-1.5
                  text-[11px] font-semibold uppercase tracking-widest
                  transition-all duration-150 press-feedback
                  ${
                    isActive
                      ? 'bg-amber-50 dark:bg-[rgba(232,117,0,0.14)] text-brand-amber dark:text-amber-400'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-text-dark-primary hover:bg-ivory-muted dark:hover:bg-surface-dark-elevated'
                  }
                `}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>

          {/* ── Right: Theme, Search, Notifications, Avatar ── */}
          <div className="flex items-center gap-2">
            {/* Primary action: Import Statement (§33) — clearly dominant */}
            <button
              onClick={() => setIsStatementModalOpen(true)}
              className="
                flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] text-xs font-semibold
                bg-ledger text-white shadow-sm
                hover:bg-brand-amber-hover
                transition-all cursor-pointer press-feedback
              "
              title="Import bank or credit card statement (CSV/PDF)"
            >
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Import Statement</span>
            </button>

            {/* Theme toggle */}
            <button
              onClick={cycleTheme}
              className="
                relative p-2.5 rounded-lg
                text-zinc-500 dark:text-zinc-400
                hover:text-zinc-900 dark:hover:text-text-dark-primary
                hover:bg-ivory-muted dark:hover:bg-surface-dark-elevated
                transition-colors duration-150
                group
              "
              aria-label={`Toggle theme (current: ${themeLabel})`}
              title={`Theme: ${themeLabel}`}
            >
              {theme === 'dark' ? (
                <Moon className="w-[18px] h-[18px]" />
              ) : (
                <Sun className="w-[18px] h-[18px]" />
              )}
            </button>

            {/* Search */}
            <button
              onClick={onSearchClick}
              className="
                p-2.5 rounded-lg
                text-zinc-500 dark:text-zinc-400
                hover:text-zinc-900 dark:hover:text-text-dark-primary
                hover:bg-ivory-muted dark:hover:bg-surface-dark-elevated
                transition-colors duration-150
              "
              aria-label="Search (Ctrl+K)"
              title="Search (Ctrl+K)"
            >
              <Search className="w-[18px] h-[18px]" />
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="
                  relative p-2.5 rounded-lg
                  text-zinc-500 dark:text-zinc-400
                  hover:text-zinc-900 dark:hover:text-text-dark-primary
                  hover:bg-ivory-muted dark:hover:bg-surface-dark-elevated
                  transition-colors duration-150
                "
                aria-label="Notifications"
                aria-expanded={notifOpen}
                aria-haspopup="true"
              >
                <Bell className="w-[18px] h-[18px]" />
                <span
                  className="absolute top-2 right-2 w-1.5 h-1.5 bg-brand-red rounded-full"
                  aria-hidden="true"
                />
              </button>
              {notifOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-72 p-4 bg-white dark:bg-surface-dark-card border border-ivory-border dark:border-surface-dark-border rounded-xl shadow-elevated dark:shadow-dark-elevated z-50"
                  role="menu"
                  aria-label="Notifications"
                >
                  <p className="text-sm font-semibold text-zinc-900 dark:text-text-dark-primary mb-1">
                    You&apos;re all caught up
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Local-first demo: budgets, insights and reminders update from your transactions on the
                    Dashboard. No server notifications in v1.
                  </p>
                  <button
                    onClick={() => {
                      setNotifOpen(false);
                      navigate('/');
                    }}
                    className="mt-3 text-xs font-medium text-brand-amber hover:underline"
                  >
                    View insights →
                  </button>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-ivory-border dark:bg-surface-dark-border mx-1.5" aria-hidden="true" />

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="
                  flex items-center gap-2 p-1.5 pr-3 rounded-lg
                  hover:bg-ivory-muted dark:hover:bg-surface-dark-elevated
                  transition-colors duration-150
                "
                aria-label="User menu"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                <div
                  className="
                  w-7 h-7 rounded-full
                  bg-gradient-to-br from-amber-400 to-orange-500
                  flex items-center justify-center
                  text-white text-xs font-bold
                  shadow-sm
                "
                  aria-hidden="true"
                >
                  {initials}
                </div>
                <span className="hidden sm:block text-sm font-medium text-zinc-700 dark:text-text-dark-secondary">
                  {userName}
                </span>
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <div
                  className="
                    absolute right-0 top-full mt-2
                    w-56 py-1.5
                    bg-white dark:bg-surface-dark-card
                    border border-ivory-border dark:border-surface-dark-border
                    rounded-xl shadow-elevated dark:shadow-dark-elevated
                    animate-fade-in-up
                    z-50
                  "
                  role="menu"
                >
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-ivory-border dark:border-surface-dark-border">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-text-dark-primary">
                      {userName}
                    </p>
                    {userEmail && <p className="text-xs text-zinc-500 dark:text-zinc-500">{userEmail}</p>}
                  </div>

                  <div className="py-1">
                    <NavLink
                      to="/settings"
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-zinc-700 dark:text-text-dark-secondary hover:bg-ivory-muted dark:hover:bg-surface-dark-elevated transition-colors"
                      role="menuitem"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </NavLink>
                    <button
                      className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-zinc-700 dark:text-text-dark-secondary hover:bg-ivory-muted dark:hover:bg-surface-dark-elevated transition-colors"
                      role="menuitem"
                      onClick={() => {
                        setUserMenuOpen(false);
                        try {
                          downloadBackup();
                        } catch {
                          navigate('/settings');
                        }
                      }}
                    >
                      <Download className="w-4 h-4" />
                      Export backup
                    </button>
                  </div>

                  <div className="border-t border-ivory-border dark:border-surface-dark-border pt-1">
                    <button
                      className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-zinc-500 dark:text-zinc-400 hover:bg-ivory-muted dark:hover:bg-surface-dark-elevated transition-colors"
                      role="menuitem"
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate('/settings');
                      }}
                    >
                      <User className="w-4 h-4" />
                      Manage data
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Removed the global style for nav links since we now use a component-level span */}
      <StatementUploadModal isOpen={isStatementModalOpen} onClose={() => setIsStatementModalOpen(false)} />
    </nav>
  );
}
