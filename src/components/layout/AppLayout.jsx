import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import GlobalSearch from './GlobalSearch';
import ErrorBoundary from './ErrorBoundary';

/**
 * AppLayout — Terminal shell: 1px-bordered top nav + <Outlet />.
 * Dark default #0A0A0A, light #FAFAFA. No blur, no glow.
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
    <div className="min-h-screen bg-[#FAFAFA] text-[#0A0A0A] dark:bg-[#0A0A0A] dark:text-white transition-colors duration-200 flex flex-col justify-between">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:px-4 focus:py-2 focus:rounded focus:bg-white focus:text-[#0A0A0A] focus:text-sm focus:font-medium"
      >
        Skip to content
      </a>

      {/* Top Navigation */}
      <Navbar onSearchClick={() => setIsSearchOpen(true)} />

      {/* Global Search Overlay */}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Page Content */}
      <main id="main-content" className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <ErrorBoundary key={location.pathname}>
          <div key={location.pathname} className="animate-fade-in motion-reduce:animate-none">
            <Outlet />
          </div>
        </ErrorBoundary>
      </main>

      {/* Bottom Bar */}
      <footer className="w-full border-t border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] py-4 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-[#8E9192]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#0A0A0A] dark:text-white">FOLIO</span>
            <span>· Personal Wealth Terminal</span>
          </div>
          <div>Made by Aritra &amp; Dishari with ❤️</div>
        </div>
      </footer>
    </div>
  );
}
