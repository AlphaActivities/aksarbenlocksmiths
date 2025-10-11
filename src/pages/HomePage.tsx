import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Phone } from 'lucide-react';
import { trackClick } from '../utils/analytics';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import ServicesSection from '../components/ServicesSection';
import AboutSection from '../components/AboutSection';
import TestimonialsSection from '../components/TestimonialsSection';
import PricingSection from '../components/PricingSection';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';
import EmergencyButton from '../components/EmergencyButton';
import BackToTop from '../components/BackToTop';

export default function HomePage() {
  return (
    <div className="text-white bg-[#0b1220]">
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
      <HeroSection />
      <ServicesSection />
      <AboutSection />
      <TestimonialsSection />
      <PricingSection />
      <ContactSection />
      <EmergencyButton />
      <BackToTop />

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
        <link rel="canonical" href="https://aksarbenlocksmiths.com/" />
        <meta name="robots" content="index, follow" />
        <link rel="preload" as="image" href="/images/poster.webp" imagesrcset="/images/poster.webp" />
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
  );
}
