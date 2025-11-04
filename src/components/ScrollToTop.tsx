import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop
 * Scrolls window to top whenever the route (location.pathname) changes.
 * Mount this once under <Router/> in App.tsx.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // use 'auto' to jump to top immediately; change to 'smooth' if you prefer animation
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
