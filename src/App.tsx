import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { trackPageView } from './utils/analytics';
import MinimalShell from './layouts/MinimalShell';
import HomePage from './pages/HomePage';
import DynamicServicePage from './pages/DynamicServicePage';
import ServiceAreasPage from './components/ServiceAreasPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import SearchPage from './pages/SearchPage';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/ErrorBoundary';
import { captureAttributionFromURL, resetScrollTracking } from './utils/analytics';

function PageViewTracker() {
  const loc = useLocation();
  React.useEffect(() => {
    trackPageView();
  }, [loc.pathname, loc.search, loc.hash]);

  React.useEffect(() => {
    resetScrollTracking();
  }, [loc.pathname]);

  return null;
}

function App() {
  const location = useLocation();

  useEffect(() => {
    // capture on every route change so last touch stays fresh
    try { captureAttributionFromURL(); } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search, location.hash]);

  // Only scroll to top on real route changes, never on hash-only changes
  useEffect(() => {
    const restorePosition = () => {
      const lastY = sessionStorage.getItem("lastScrollY");
      
      if (!location?.state?.restorePosition && !location?.state?.scrollTo && !location?.state?.scrollFx) {
        requestAnimationFrame(() => {
          window.scrollTo(0, 0);
        });
        return;
      }
      
      if (location?.state?.restorePosition && lastY) {
        const y = parseInt(lastY, 10);
        if (!isNaN(y)) {
          let attempts = 0; // keep attempts in scope of scroll()

          const scroll = () => {
            window.scrollTo({ top: y, behavior: "smooth" });
            attempts++;

            // Stop early if we are basically at target to avoid extra jank
            const closeEnough = Math.abs(window.scrollY - y) < 2;

            if (!closeEnough && attempts < 10) {
              setTimeout(scroll, 300); // increased retries for late layout shifts
            } else {
              try { sessionStorage.removeItem("lastScrollY"); } catch {}
            }
          };

          scroll();
          return;
        }
      } else if (location?.state?.scrollTo === "services") {
        const el = document.querySelector("#services");
        if (el && el.getBoundingClientRect().height > 0) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    };

    restorePosition();
  }, [location.pathname]);

  return (
    <ErrorBoundary>
      <PageViewTracker />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[1000] focus:bg-black focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
      >
        Skip to content
      </a>
      <Routes>
        <Route element={<MinimalShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/services/:slug" element={<DynamicServicePage />} />
          <Route path="/service-areas" element={<ServiceAreasPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/blog/:category(emergency|keys|residential|commercial)" element={<BlogPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}

export default App;