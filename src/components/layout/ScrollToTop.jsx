import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Scroll to top on route change (and move focus for screen readers). */
export default function ScrollToTop() {
  const { pathname, search } = useLocation();
  const lesson = pathname === '/learn' ? search : '';
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    const main = document.getElementById('main-content');
    if (main) {
      main.setAttribute('tabindex', '-1');
      // Do not steal focus on every nav for mouse users — only make it focusable.
    }
  }, [pathname, lesson]);
  return null;
}
