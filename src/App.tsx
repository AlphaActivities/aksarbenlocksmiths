import React, { useEffect, useRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Phone } from 'lucide-react';
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
import { Helmet } from 'react-helmet-async';
import { trackClick } from './utils/analytics';

function App() {
  const location = useLocation();

  const didScrollFx = useRef(false);

  useEffect(() => {
    const fx = location?.state?.scrollFx as string | undefined;

    // Special mid then top effect, run once, then short circuit
    if (fx === "midThenTop" && !didScrollFx.current) {
      didScrollFx.current = true;

      requestAnimationFrame(() => {
        try {
          const mid = Math.max(0, Math.round(window.innerHeight * 0.5));
          // Jump to mid immediately
          window.scrollTo({ top: mid, behavior: "auto" });
          // Then quickly smooth to top
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }, 120);
        } catch {
          window.scrollTo({ top: 0, behavior: "auto" });
        }
      });

      return; // do not run default logic on this navigation
    }

    // Reset guard when no special effect is present
    if (!fx) didScrollFx.current = false;

    // Existing restore and default behavior
    const lastY = sessionStorage.getItem("lastScrollY");

    // Default top scroll when no flags
    if (!location?.state?.restorePosition && !location?.state?.scrollTo && !location?.state?.scrollFx) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    // Restore exact Y when returning to Home
    if (location?.state?.restorePosition && lastY) {
      const y = parseInt(lastY, 10);
      if (!isNaN(y)) {
        let attempts = 0;
        const scroll = () => {
          window.scrollTo({ top: y, behavior: "smooth" });
          attempts++;
          const closeEnough = Math.abs(window.scrollY - y) < 2;
          if (!closeEnough && attempts < 10) {
            setTimeout(scroll, 300);
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
  }, [location]);

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
  }, [location]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="text-white">
            <video
              autoPlay
              muted
              loop
              playsInline
              controls={false}
              disablePictureInPicture
              controlsList="nodownload nofullscreen noremoteplayback"
              aria-hidden="true"
              className="fixed top-0 left-0 w-full h-full object-cover z-[-1] pointer-events-none"
            >
              <source src="/videos/wallpaper.mp4" type="video/mp4" />
            </video>
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
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<BlogPostPage />} />
      <Route path="/blog/:slug" element={<BlogPostPage />} />
      <Route path="/blog" element={<BlogPage />} />
    </Routes>
  );
}

export default App;