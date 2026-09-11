import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Terminal,
  Menu,
  X,
  Search,
  User,
  Download,
  Moon,
  Sun,
  Settings,
} from 'lucide-react';
import { useTheme } from '../ThemeProvider';
import { useData } from '../../contexts/DataContext';
import { downloadBackup } from '../../services/storage';

const PAGE_LABELS = {
  '/': 'Dashboard',
  '/transactions': 'Transactions',
  '/accounts': 'Accounts',
  '/analytics': 'Analytics',
  '/budgets': 'Budgets',
  '/investments': 'Investments',
  '/settings': 'Settings',
};

/**
 * Navbar — Minimalist terminal top bar.
 *
 * Left: animated hamburger trigger + brand mark + live breadcrumb.
 * Center: quick-search pill (⌘K) on wide screens.
 * Right: theme flip toggle, search icon (compact screens), user pill.
 * Full navigation lives in the SidebarDrawer on all screen sizes.
 *
 * @param {() => void} onSearchClick
 * @param {boolean} isDrawerOpen
 * @param {() => void} onMenuClick
 */
export default function Navbar({ onSearchClick, isDrawerOpen = false, onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
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
  const activePage = PAGE_LABELS[location.pathname] || 'Not Found';

  // Close user menu on outside click / route change
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  useEffect(() => {
    setUserMenuOpen(false);
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
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 h-16">
          {/* ── Left: Hamburger + Brand + Breadcrumb ── */}
          <button
            onClick={onMenuClick}
            className="
              group p-2.5 rounded
              text-[#8E9192]
              hover:text-[#0A0A0A] dark:hover:text-white
              hover:bg-[#F5F5F5] dark:hover:bg-[#1E1E1E]
              transition-all duration-150 ease-out
              active:scale-[0.97]
            "
            aria-label={isDrawerOpen ? 'Close navigation menu' : 'Open navigation menu (M)'}
            aria-expanded={isDrawerOpen}
            aria-controls="sidebar-drawer"
          >
            <span
              key={isDrawerOpen ? 'x' : 'menu'}
              className="icon-flip motion-reduce:animate-none transition-transform duration-200 group-hover:rotate-90"
            >
              {isDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </span>
          </button>

          <NavLink
            to="/"
            className="flex items-center gap-2.5 shrink-0 group transition-all duration-150 ease-out active:scale-[0.97]"
            aria-label="Folio — Go to dashboard"
          >
            <div className="p-2 rounded bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] group-hover:opacity-80 transition-opacity duration-150">
              <Terminal className="w-5 h-5" />
            </div>
            <span className="font-sans text-lg font-semibold tracking-tight text-[#0A0A0A] dark:text-white">
              FOLIO
              <span className="ml-2 font-mono text-[10px] font-medium text-[#8E9192] tracking-widest">
                v1.0
              </span>
            </span>
          </NavLink>

          <span
            className="hidden md:flex items-center gap-2 ml-3 pl-3 border-l border-[#E5E5E5] dark:border-[#262626] font-mono text-xs text-[#8E9192] whitespace-nowrap"
            aria-label={`Current page: ${activePage}`}
            aria-live="polite"
          >
            <span>FOLIO</span>
            <span aria-hidden="true">/</span>
            <span key={activePage} className="page-enter motion-reduce:animate-none text-[#404040] dark:text-[#C4C7C8]">
              {activePage}
            </span>
          </span>

          {/* ── Center: quick-search pill ── */}
          <div className="hidden lg:flex flex-1 justify-center px-6">
            <button
              onClick={onSearchClick}
              className="
                w-full max-w-md flex items-center gap-2.5 px-3.5 py-2 rounded
                border border-[#E5E5E5] dark:border-[#262626]
                bg-[#F5F5F5] dark:bg-[#0A0A0A]
                text-sm text-[#8E9192]
                hover:border-[#CCCCCC] dark:hover:border-[#404040]
                hover:text-[#404040] dark:hover:text-[#C4C7C8]
                transition-all duration-150 ease-out
                active:scale-[0.97]
              "
              aria-label="Search (Ctrl+K)"
            >
              <Search className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left truncate">Search transactions, accounts…</span>
              <kbd className="shrink-0 font-mono text-[10px] px-1.5 py-0.5 rounded border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#1E1E1E]">
                ⌘K
              </kbd>
            </button>
          </div>
          <div className="flex-1 lg:hidden" />

          {/* ── Right: tools + profile ── */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Theme Toggle with flip */}
            <button
              onClick={cycleTheme}
              className="
                p-2.5 rounded
                text-[#8E9192]
                hover:text-[#0A0A0A] dark:hover:text-white
                hover:bg-[#F5F5F5] dark:hover:bg-[#1E1E1E]
                transition-all duration-150 ease-out
                active:scale-[0.97]
              "
              aria-label={`Toggle theme (current: ${themeLabel})`}
              title={`Theme: ${themeLabel}`}
            >
              <span key={theme} className="icon-flip motion-reduce:animate-none">
                {theme === 'dark' ? <Moon className="w-[18px] h-[18px]" /> : <Sun className="w-[18px] h-[18px]" />}
              </span>
            </button>

            {/* Search (compact screens — pill covers lg+) */}
            <button
              onClick={onSearchClick}
              className="
                lg:hidden p-2.5 rounded
                text-[#8E9192]
                hover:text-[#0A0A0A] dark:hover:text-white
                hover:bg-[#F5F5F5] dark:hover:bg-[#1E1E1E]
                transition-all duration-150 ease-out
                active:scale-[0.97]
              "
              aria-label="Search (Ctrl+K)"
              title="Search (Ctrl+K)"
            >
              <Search className="w-[18px] h-[18px]" />
            </button>

            <div className="w-px h-6 bg-[#E5E5E5] dark:bg-[#262626] mx-1.5" aria-hidden="true" />

            {/* User pill */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="
                  flex items-center gap-2 p-1.5 pr-2.5 rounded
                  border border-transparent
                  hover:bg-[#F5F5F5] dark:hover:bg-[#1E1E1E]
                  hover:border-[#E5E5E5] dark:hover:border-[#262626]
                  transition-all duration-150 ease-out
                  active:scale-[0.97]
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

              {userMenuOpen && (
                <div
                  className="
                    absolute right-0 top-full mt-2
                    w-56 py-1.5
                    bg-white dark:bg-[#141414]
                    border border-[#E5E5E5] dark:border-[#262626]
                    rounded-md
                    animate-fade-in-up motion-reduce:animate-none
                    z-50
                  "
                  role="menu"
                >
                  <div className="px-4 py-3 border-b border-[#E5E5E5] dark:border-[#262626]">
                    <p className="text-sm font-semibold text-[#0A0A0A] dark:text-white">
                      {userName}
                    </p>
                    {userEmail && <p className="text-xs text-[#8E9192] font-mono">{userEmail}</p>}
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
