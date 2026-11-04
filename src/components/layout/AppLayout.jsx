import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  CalendarDays,
  MoreHorizontal,
  TrendingUp,
  PieChart,
  Upload,
  Settings,
  Search,
  Sun,
  Moon,
  MessageCircle,
  ArrowUpRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import { saveSettings } from '../../services/storage';
import { useData } from '../../contexts/DataContext';
import { useTheme } from '../ThemeProvider';
import GlobalSearch from './GlobalSearch';
import ErrorBoundary from './ErrorBoundary';
const primary = [
  ['/', 'Overview', LayoutDashboard],
  ['/transactions', 'Activity', ArrowLeftRight],
  ['/accounts', 'Accounts', Wallet],
  ['/plan', 'Plan', CalendarDays],
];
const secondary = [
  ['/investments', 'Investments', TrendingUp],
  ['/analytics', 'Insights', PieChart],
  ['/assistant', 'Assistant', MessageCircle],
  ['/imports/new', 'Import statement', Upload],
  ['/more', 'More', MoreHorizontal],
];
function Navigation({ items, mobile = false }) {
  const { pathname } = useLocation();
  return items.map(([to, label, Icon]) => (
    <NavLink
      key={to}
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `v-nav-link ${isActive || (mobile && to === '/more' && !primary.some(([path]) => path === pathname)) ? 'selected' : ''}`
      }
    >
      <Icon size={18} />
      <span>{mobile && to === '/' ? 'Home' : label}</span>
    </NavLink>
  ));
}
export default function AppLayout() {
  const { settings, demoProfiles, activeProfileId, switchProfile } = useData();
  const { theme, setPreference } = useTheme();
  const [search, setSearch] = useState(false);
  const location = useLocation();
  useEffect(() => {
    const key = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearch((s) => !s);
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);
  return (
    <div className="v-app">
      <a href="#main-content" className="v-skip">
        Skip to content
      </a>
      <aside className="v-sidebar">
        <Link to="/" className="v-brand">
          <span>f.</span>folio<small>V2</small>
        </Link>
        <div className="v-workspace">
          <span className="v-avatar">{settings.userName?.[0] || 'F'}</span>
          <div>
            <strong>{settings.userName || 'Your'}’s space</strong>
            <small>Personal finance</small>
          </div>
        </div>
        <nav aria-label="Main navigation">
          <Navigation items={[...primary, ...secondary]} />
        </nav>
        <div className="v-sidebar-foot">
          <small>Local workspace · manual balances</small>
          <Link className="v-nav-link" to="/settings">
            <Settings size={18} />
            Settings
          </Link>
          <Link className="v-nav-link" to="/login">
            <ArrowUpRight size={18} />
            Cloud account
          </Link>
        </div>
      </aside>
      <div className="v-body">
        <header className="v-topbar">
          <div className="v-breadcrumb">
            Personal workspace <span>/</span>{' '}
            <b>
              {[
                ...primary,
                ...secondary,
                ['/settings', 'Settings'],
                ['/learn', 'Learn'],
                ['/login', 'Cloud account'],
              ].find(([p]) => p === location.pathname)?.[1] || 'Folio'}
            </b>
          </div>
          <div className="v-top-actions">
            <button
              className="v-icon-button"
              aria-label={settings.hideAmounts ? 'Show amounts' : 'Hide amounts'}
              aria-pressed={!!settings.hideAmounts}
              onClick={() => saveSettings({ hideAmounts: !settings.hideAmounts })}
            >
              {settings.hideAmounts ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            <button className="v-icon-button" onClick={() => setSearch(true)} aria-label="Search workspace">
              <Search size={18} />
            </button>
            <button
              className="v-icon-button"
              onClick={() => setPreference(theme === 'dark' ? 'light' : 'dark')}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <label className="v-profile">
              <span className="sr-only">Demo profile</span>
              <select value={activeProfileId} onChange={(e) => switchProfile(e.target.value)}>
                {demoProfiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </header>
        <main id="main-content" className="v-main">
          <ErrorBoundary key={location.pathname}>
            <Outlet />
          </ErrorBoundary>
        </main>
        <nav className="v-mobile-nav" aria-label="Mobile navigation">
          <Navigation mobile items={[...primary, ['/more', 'More', MoreHorizontal]]} />
        </nav>
      </div>
      <GlobalSearch isOpen={search} onClose={() => setSearch(false)} />
    </div>
  );
}
