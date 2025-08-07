import React, { useEffect } from 'react';
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
import { Helmet } from 'react-helmet-async';
import { trackClick } from './utils/analytics';

function App() {
  const location = useLocation();

  useEffect(() => {
    const restorePosition = () => {
      const lastY = sessionStorage.getItem("lastScrollY");
      if (location?.state?.restorePosition && lastY) {
        const y = parseInt(lastY, 10);
        if (!isNaN(y)) {
          let attempts = 0;
          const scroll = () => {
            window.scrollTo({ top: y, behavior: "smooth" });
            attempts++;
            if (attempts < 5) setTimeout(scroll, 300);
          };
          scroll();
          sessionStorage.removeItem("lastScrollY");
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
                <Phone className="h-4 w-4" />
                (402) 556-6715
              </a>
            </div>
            <Navbar />
            <main>
              <HeroSection />
              <ServicesSection />
              <AboutSection />
              <TestimonialsSection />
              <PricingSection />
              <ContactSection />
            </main>
            <EmergencyButton />
            <BackToTop />
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
    </Routes>
  );
}
// test push from StackBlitz

export default App;