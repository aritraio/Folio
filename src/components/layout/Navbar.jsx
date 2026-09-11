import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Terminal,
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
} from 'lucide-react';
import MobileNav from './MobileNav';
import { useTheme } from '../ThemeProvider';
import { useData } from '../../contexts/DataContext';
import { downloadBackup } from '../../services/storage';

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
 * Navbar — Terminal top navigation.
 * Bg #0A0A0A/#111111 with crisp 1px #262626 border. Active route:
 * solid white indicator + high-contrast neutral badge. Monochrome brand.
 */
export default function Navbar({ onSearchClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
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
        bg-white dark:bg-[#111111]
        border-b border-[#E5E5E5] dark:border-[#262626]
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
              aria-label="Folio — Go to dashboard"
            >
              <div
                className="
              p-2 rounded
              bg-[#0A0A0A] text-white
              dark:bg-white dark:text-[#0A0A0A]
              group-hover:opacity-80
              transition-opacity duration-150
            "
              >
                <Terminal className="w-5 h-5" />
              </div>
              <span className="font-sans text-lg font-semibold tracking-tight text-[#0A0A0A] dark:text-white">
                FOLIO
                <span className="ml-2 font-mono text-[10px] font-medium text-[#8E9192] tracking-widest">
                  v1.0
                </span>
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
                className={({ isActive }) => `
                  relative px-3 py-2 rounded
                  flex items-center gap-1.5
                  text-[11px] font-semibold uppercase tracking-widest
                  transition-colors duration-150
                  ${
                    isActive
                      ? 'text-[#0A0A0A] bg-[#F5F5F5] border border-[#E5E5E5] dark:text-white dark:bg-[#1E1E1E] dark:border-[#404040]'
                      : 'text-[#8E9192] border border-transparent hover:text-[#0A0A0A] hover:bg-[#F5F5F5] dark:hover:text-white dark:hover:bg-[#1E1E1E] group'
                  }
                `}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
                {/* Active indicator — solid white line */}
                {({ isActive }) => (
                  <span
                    className={`
                      absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] rounded-sm bg-current transition-all duration-200
                      ${isActive ? 'w-4 opacity-100' : 'w-0 opacity-0 group-hover:w-4 group-hover:opacity-100'}
                    `}
                  />
                )}
              </NavLink>
            ))}
          </div>

          {/* ── Right: Actions ── */}
          <div className="flex items-center gap-1">
            {/* Theme Toggle */}
            <button
              onClick={cycleTheme}
              className="
                relative p-2.5 rounded
                text-[#8E9192]
                hover:text-[#0A0A0A] dark:hover:text-white
                hover:bg-[#F5F5F5] dark:hover:bg-[#1E1E1E]
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
                p-2.5 rounded
                text-[#8E9192]
                hover:text-[#0A0A0A] dark:hover:text-white
                hover:bg-[#F5F5F5] dark:hover:bg-[#1E1E1E]
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
                  relative p-2.5 rounded
                  text-[#8E9192]
                  hover:text-[#0A0A0A] dark:hover:text-white
                  hover:bg-[#F5F5F5] dark:hover:bg-[#1E1E1E]
                  transition-colors duration-150
                "
                aria-label="Notifications"
                aria-expanded={notifOpen}
                aria-haspopup="true"
              >
                <Bell className="w-[18px] h-[18px]" />
                <span
                  className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#ff6b6b] rounded-full"
                  aria-hidden="true"
                />
              </button>
              {notifOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-72 p-4 bg-white dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] rounded-md z-50"
                  role="menu"
                  aria-label="Notifications"
                >
                  <p className="text-sm font-semibold text-[#0A0A0A] dark:text-white mb-1">
                    You&apos;re all caught up
                  </p>
                  <p className="text-xs text-[#8E9192] leading-relaxed">
                    Local-first demo: budgets, insights and reminders update from your transactions on the
                    Dashboard. No server notifications in v1.
                  </p>
                  <button
                    onClick={() => {
                      setNotifOpen(false);
                      navigate('/');
                    }}
                    className="mt-3 text-xs font-medium text-[#0A0A0A] dark:text-white hover:opacity-70 underline underline-offset-2"
                  >
                    View insights →
                  </button>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-[#E5E5E5] dark:bg-[#262626] mx-1.5" aria-hidden="true" />

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="
                  flex items-center gap-2 p-1.5 pr-3 rounded
                  hover:bg-[#F5F5F5] dark:hover:bg-[#1E1E1E]
                  transition-colors duration-150
                "
                aria-label="User menu"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                <div
                  className="
                  w-7 h-7 rounded
                  bg-[#0A0A0A] text-white
                  dark:bg-white dark:text-[#0A0A0A]
                  flex items-center justify-center
                  text-xs font-bold font-mono
                "
                  aria-hidden="true"
                >
                  {initials}
                </div>
                <span className="hidden sm:block text-sm font-medium text-[#404040] dark:text-[#C4C7C8]">
                  {userName}
                </span>
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <div
                  className="
                    absolute right-0 top-full mt-2
                    w-56 py-1.5
                    bg-white dark:bg-[#141414]
                    border border-[#E5E5E5] dark:border-[#262626]
                    rounded-md
                    animate-fade-in-up
                    z-50
                  "
                  role="menu"
                >
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-[#E5E5E5] dark:border-[#262626]">
                    <p className="text-sm font-semibold text-[#0A0A0A] dark:text-white">
                      {userName}
                    </p>
                    {userEmail && <p className="text-xs text-[#8E9192]">{userEmail}</p>}
                  </div>

                  <div className="py-1">
                    <NavLink
                      to="/settings"
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#404040] dark:text-[#C4C7C8] hover:bg-[#F5F5F5] dark:hover:bg-[#1E1E1E] transition-colors"
                      role="menuitem"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </NavLink>
                    <button
                      className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-[#404040] dark:text-[#C4C7C8] hover:bg-[#F5F5F5] dark:hover:bg-[#1E1E1E] transition-colors"
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

                  <div className="border-t border-[#E5E5E5] dark:border-[#262626] pt-1">
                    <button
                      className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-[#8E9192] hover:bg-[#F5F5F5] dark:hover:bg-[#1E1E1E] transition-colors"
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
    </nav>
  );
}
