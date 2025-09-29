import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Phone } from 'lucide-react';
import { trackPageView } from './utils/analytics';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ServicesSection from './components/ServicesSection';
import AboutSection from './components/AboutSection';
import TestimonialsSection from './components/TestimonialsSection';
import PricingSection from './components/PricingSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import EmergencyButton from './components/EmergencyButton';
import BackToTop from './components/BackToTop';
import DynamicServicePage from './pages/DynamicServicePage';
import ServiceAreasPage from './components/ServiceAreasPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import BlogCategoryPage from './pages/BlogCategoryPage';
import SearchPage from './pages/SearchPage';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/ErrorBoundary';
import { Helmet } from 'react-helmet-async';
import { trackClick, captureAttributionFromURL } from './utils/analytics';

function PageViewTracker() {
  const loc = useLocation();
  React.useEffect(() => {
    // fire a virtual page_view on every route change
    trackPageView();
  }, [loc.pathname, loc.search, loc.hash]);
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
        window.scrollTo({ top: 0, behavior: "auto" });
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
        <Route
          path="/"
          element={
            <div className="text-white">
              {/*
                HERO background media:
                - <img className="hero-poster hero-bg"> shows when prefers-reduced-motion: reduce
                - <video className="hero-video hero-bg"> shows otherwise
                - Both use the SAME poster image to ensure visual parity
              */}
              {(() => {
                const heroPoster = "/images/Services Thumbnails/Residential-Service-Photo.webp";

                return (
                  <>
                    {/* Poster image fallback for reduced-motion and pre-playback */}
                    <img
                      src={heroPoster}
                      alt=""
                      aria-hidden="true"
                      className="hero-poster hero-bg fixed top-0 left-0 z-[-1] pointer-events-none select-none"
                      loading="eager"
                      decoding="async"
                    />

                    {/* Video wallpaper. We keep poster attr and use a <source> with media query
                        so the file is NOT fetched when user prefers reduced motion. */}
                    <video
                      className="hero-video hero-bg fixed top-0 left-0 z-[-1] pointer-events-none"
                      poster={heroPoster}
                      autoPlay
                      muted
                      loop
                      playsInline
                      controls={false}
                      disablePictureInPicture
                      controlsList="nodownload nofullscreen noremoteplayback"
                      aria-hidden="true"
                      preload="metadata"
                    >
                      {/* The media attribute prevents loading when reduced motion is on */}
                      <source
                        src="/videos/wallpaper.mp4"
                        type="video/mp4"
                        media="(prefers-reduced-motion: no-preference)"
                      />
                    </video>
                  </>
                );
              })()}
              <div className="fixed top-0 w-full z-50 bg-black backdrop-blur-md shadow-lg text-sm px-4 py-1 flex justify-between items-center">
                <span className="text-white animate-pulse">24/7 Emergency Service</span>
                <a
                  href="tel:+14025566715"
                  onClick={(e) => trackClick('top_bar_phone_click', e.currentTarget, { 
                    phone_number: '+14025566715',
                    source: 'top_emergency_bar',
                    page_section: 'emergency_top_bar'
                  })}
                  className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition animate-pulse"
                >
                  <Phone className="h-4 w-4" />
                  (402) 556-6715
                </a>
              </div>
              <Navbar />
              <main id="main-content" role="main">
                <HeroSection />
                <ServicesSection />
                <AboutSection />
                <TestimonialsSection />
                <PricingSection />
                <ContactSection />
              </main>
              <EmergencyButton />
              <BackToTop />
              {/* Invisible FAQ Schema for AEO */}
              <section className="hidden" aria-hidden="true">
                <h2>Frequently Asked Questions - Aksarben Locksmiths LLC</h2>
                <div>
                  <h3>How fast can a locksmith get to me in Omaha?</h3>
                  <p>Serving the Omaha metro with mobile locksmith support, response times vary by distance and traffic.</p>
                  
                  <h3>Do you offer 24/7 emergency locksmith services?</h3>
                  <p>Yes! Aksarben Locksmiths LLC operates 24 hours a day, 7 days a week — including weekends and holidays. Locked out? Call us anytime.</p>
                  
                  <h3>Can you rekey my locks the same day?</h3>
                  <p>Absolutely. We provide fast, same-day rekeying for residential and commercial properties across Omaha and nearby cities.</p>
                  
                  <h3>What types of locksmith services do you provide?</h3>
                  <p>We handle emergency lockouts, car key replacements, rekeying, commercial lock repair, key duplication, and high-security installs — all mobile!</p>
                  
                  <h3>Do you service areas outside Omaha?</h3>
                  <p>Yes — we proudly serve Council Bluffs, Papillion, Bellevue, La Vista, Millard, Ralston, Elkhorn, and more. We come to you!</p>
                </div>
              </section>
              
              <Helmet>
                <script type="application/ld+json">{`
                  {
                    "@context": "https://schema.org",
                    "@type": "FAQPage",
                    "mainEntity": [
                      {
                        "@type": "Question",
                        "name": "How fast can a locksmith get to me in Omaha?",
                        "acceptedAnswer": {
                          "@type": "Answer",
                          "text": "Serving the Omaha metro area and surrounding suburbs with prompt, dependable locksmith service."
                        }
                      },
                      {
                        "@type": "Question",
                        "name": "Do you offer 24/7 emergency locksmith services?",
                        "acceptedAnswer": {
                          "@type": "Answer",
                          "text": "Yes! Aksarben Locksmiths LLC operates 24 hours a day, 7 days a week — including weekends and holidays. Locked out? Call us anytime."
                        }
                      },
                      {
                        "@type": "Question",
                        "name": "Can you rekey my locks the same day?",
                        "acceptedAnswer": {
                          "@type": "Answer",
                          "text": "Absolutely. We provide fast, same-day rekeying for residential and commercial properties across Omaha and nearby cities."
                        }
                      },
                      {
                        "@type": "Question",
                        "name": "What types of locksmith services do you provide?",
                        "acceptedAnswer": {
                          "@type": "Answer",
                          "text": "We handle emergency lockouts, car key replacements, rekeying, commercial lock repair, key duplication, and high-security installs — all mobile!"
                        }
                      },
                      {
                        "@type": "Question",
                        "name": "Do you service areas outside Omaha?",
                        "acceptedAnswer": {
                          "@type": "Answer",
                          "text": "Yes — we proudly serve Council Bluffs, Papillion, Bellevue, La Vista, Millard, Ralston, Elkhorn, and more. We come to you!"
                        }
                      }
                    ]
                  }
                `}</script>
              </Helmet>
              <Footer />
            </div>
          }
        />
        <Route path="/services/:slug" element={<DynamicServicePage />} />
        <Route path="/service-areas" element={<ServiceAreasPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/blog/:category(emergency|keys|residential|commercial)" element={<BlogPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;