import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import SidebarDrawer from './SidebarDrawer';
import GlobalSearch from './GlobalSearch';
import ErrorBoundary from './ErrorBoundary';

/**
 * AppLayout — Minimal terminal shell.
 *
 * - Slim top bar (hamburger + brand + search pill + tools)
 * - Global SidebarDrawer (hamburger or `M` shortcut, all screen sizes)
 * - 180ms fade-and-rise page transition keyed on route
 * - Skip-link + main landmark for keyboard / screen-reader users
 */
export default function AppLayout() {
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((v) => !v);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
        return;
      }
      // `M` toggles the drawer — never while typing or with modifiers held.
      if (mod || e.altKey) return;
      const t = e.target;
      const tag = t && t.tagName;
      const typing =
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        (t && t.isContentEditable) ||
        (t && typeof t.getAttribute === 'function' && t.getAttribute('role') === 'combobox');
      if (!typing && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        toggleDrawer();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleDrawer]);

  // Close the drawer on route change (covers programmatic navigation).
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0A0A0A] dark:bg-[#0A0A0A] dark:text-white transition-colors duration-200">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:px-4 focus:py-2 focus:rounded focus:bg-white focus:text-[#0A0A0A] focus:text-sm focus:font-medium"
      >
        Skip to content
      </a>

      {/* Top Navigation */}
      <Navbar
        onSearchClick={() => setIsSearchOpen(true)}
        isDrawerOpen={isDrawerOpen}
        onMenuClick={toggleDrawer}
      />

      {/* Side Drawer + Global Search */}
      <SidebarDrawer isOpen={isDrawerOpen} onClose={closeDrawer} />
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Page Content */}
      <main id="main-content" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <ErrorBoundary key={location.pathname}>
          <div key={location.pathname} className="page-enter motion-reduce:animate-none">
            <Outlet />
          </div>
        </ErrorBoundary>
      </main>
    </div>
  );
}
