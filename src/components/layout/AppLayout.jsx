import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import GlobalSearch from './GlobalSearch';
import ErrorBoundary from './ErrorBoundary';

/**
 * AppLayout — App shell wrapper with Navbar + <Outlet />.
 *
 * - Sticky Navbar at top (with integrated mobile nav)
 * - Max-width container (~1400px) with generous padding
 * - <Outlet /> for routed page content, guarded by ErrorBoundary
 * - Skip-link + main landmark for keyboard / screen-reader users
 * - Subtle page transition via CSS animation (disabled on reduced-motion)
 */
export default function AppLayout() {
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-ivory dark:bg-surface-dark transition-colors duration-200">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-zinc-900 focus:text-white focus:text-sm focus:font-medium"
      >
        Skip to content
      </a>

      {/* Top Navigation */}
      <Navbar onSearchClick={() => setIsSearchOpen(true)} />

      {/* Global Search Overlay */}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Page Content */}
      <main id="main-content" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <ErrorBoundary key={location.pathname}>
          <div key={location.pathname} className="animate-fade-in motion-reduce:animate-none">
            <Outlet />
          </div>
        </ErrorBoundary>
      </main>
    </div>
  );
}
