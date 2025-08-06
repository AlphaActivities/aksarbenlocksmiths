import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, MapPin, Phone, Mail } from 'lucide-react';
import { trackClick, trackNavigation, trackEvent } from '../utils/analytics';

const serviceLinks = [
  { name: 'Residential Lockouts', slug: 'residential' },
  { name: 'Automotive Lockouts', slug: 'automotive' },
  { name: 'Broken Key Extraction', slug: 'extraction' },
  { name: 'Key Duplication', slug: 'duplication' },
  { name: 'Lock Rekeying', slug: 'rekeying' },
  { name: 'Security Consultation', slug: 'consultation' }
];

const Footer: React.FC = () => (
  <div className="relative overflow-hidden">
    <footer className="relative border-t border-white/10">
      <div className="animated-footer-bg" />
      <div className="footer-glass-effect" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-8 mb-12">

          {/* COLUMN 1 — LOGO + TEXT */}
          <div className="footer-logo-block flex flex-col items-center lg:items-start lg:translate-x-[-12px]">
            <a href="#" className="mb-6 block">
              <div className="relative flex items-center space-x-2 -translate-x-[12px] lg:-translate-x-[14px] ml-[-2px]">
                <div className="absolute w-12 h-12 rounded-full bg-blue-500/10 blur-xl animate-pulse" />
                <img
                  src="/images/shield-logo.png"
                  alt="Aksarben Locksmiths"
                  className="w-12 h-12 sm:w-14 sm:h-14 object-contain key-tilt-strong"
                />
                <span className="footer-flash-sweep text-lg sm:text-xl tracking-wide">
                  Aksarben Locksmiths
                </span>
              </div>
            </a>

            <div className="text-center lg:text-left">
              <p className="text-white/70 mb-3">
                <span className="text-white hover:text-red-500 transition-colors">
                  Professional Locksmith Services serving<br />
                  Omaha and surrounding areas.
                </span>
              </p>

              <div className="mb-3"></div> {/* ADDITIONAL SPACING GAP */}

              <p className="text-white/70 mb-3">
                <span className="text-white hover:text-red-500 transition-colors">
                  We are available 24/7 for Any<br />
                  Emergency Lockout or Security Situation.
                </span>
              </p>
            </div>

            <div className="flex space-x-4 mt-4">
              <a
                href="https://www.facebook.com/AksarbenLocksmithsLLC/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => trackClick('footer_social_click', e.currentTarget, { 
                  platform: 'Facebook',
                  url: 'https://www.facebook.com/AksarbenLocksmithsLLC/',
                  page_section: 'footer'
                })}
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-500 transition"
              >
                <Facebook className="w-5 h-5 text-white" />
              </a>
              <a
                href="https://www.google.com/maps/place/Aksarben+Locksmiths+LLC/@41.3203175,-96.4756949,10z"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => trackClick('footer_social_click', e.currentTarget, { 
                  platform: 'Google Maps',
                  url: 'https://www.google.com/maps/place/Aksarben+Locksmiths+LLC/@41.3203175,-96.4756949,10z',
                  page_section: 'footer'
                })}
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-500 transition"
              >
                <MapPin className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>

          {/* COLUMN 2 — QUICK LINKS */}
          <div>
            <h3 className="font-bold text-white text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li><a href="#home" onClick={(e) => {
                trackNavigation('home', 'footer');
                trackClick('footer_nav_click', e.currentTarget, { page_section: 'footer' });
              }} className="hover:text-red-500 transition-colors">Home</a></li>
              <li><a href="#services" onClick={(e) => {
                trackNavigation('services', 'footer');
                trackClick('footer_nav_click', e.currentTarget, { page_section: 'footer' });
              }} className="hover:text-red-500 transition-colors">Services</a></li>
              <li><a href="#about" onClick={(e) => {
                trackNavigation('about', 'footer');
                trackClick('footer_nav_click', e.currentTarget, { page_section: 'footer' });
              }} className="hover:text-red-500 transition-colors">About Us</a></li>
              <li><a href="#testimonials" onClick={(e) => {
                trackNavigation('testimonials', 'footer');
                trackClick('footer_nav_click', e.currentTarget, { page_section: 'footer' });
              }} className="hover:text-red-500 transition-colors">Testimonials</a></li>
              <li><a href="#pricing" onClick={(e) => {
                trackNavigation('pricing', 'footer');
                trackClick('footer_nav_click', e.currentTarget, { page_section: 'footer' });
              }} className="hover:text-red-500 transition-colors">Pricing</a></li>
              <li><a href="#contact" onClick={(e) => {
                trackNavigation('contact', 'footer');
                trackClick('footer_nav_click', e.currentTarget, { page_section: 'footer' });
              }} className="hover:text-red-500 transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* COLUMN 3 — SERVICES */}
          <div>
            <h3 className="font-bold text-white text-lg mb-6">Services</h3>
            <ul className="space-y-3">
              {serviceLinks.map((service) => (
                <li key={service.slug}>
                  <Link
                    to={`/services/${service.slug}`}
                    state={{ scrollTo: "services" }}
                    onClick={(e) => {
                      sessionStorage.setItem("lastScrollY", window.scrollY.toString());
                      trackEvent('service_tile_click', {
                        service: service.slug,
                        service_title: service.name,
                        service_name: service.name,
                        source: 'footer',
                        element_text: service.name,
                        target_url: `/services/${service.slug}`,
                        page_section: 'footer'
                      });
                    }}
                    className="hover:text-red-500 transition-colors"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 4 — CONTACT */}
          <div>
            <h3 className="font-bold text-white text-lg mb-10">Contact Us</h3>
            <ul className="space-y-8 text-white/70">
              <li className="flex items-center space-x-5">
                <Phone className="w-6 h-6 text-red-500" />
                <a 
                  href="tel:+14025566715" 
                  onClick={(e) => trackClick('footer_phone_click', e.currentTarget, { 
                    phone_number: '+14025566715',
                    source: 'footer',
                    page_section: 'footer'
                  })}
                  className="text-lg font-medium hover:text-red-500 transition-colors"
                >
                  (402) 556-6715
                </a>
              </li>
              <li className="flex items-center space-x-5">
                <Mail className="w-6 h-6 text-red-500" />
                <a 
                  href="mailto:Aksarbenlocks@gmail.com" 
                  onClick={(e) => trackClick('footer_email_click', e.currentTarget, { 
                    email: 'info@aksarbenlocksmiths.com',
                    source: 'footer',
                    page_section: 'footer'
                  })}
                  className="text-lg font-medium hover:text-red-500 transition-colors"
                >
                  info@aksarbenlocksmiths.com
                </a>
              </li>
              <li className="flex items-start space-x-5">
                <MapPin className="w-6 h-6 text-red-500 mt-1" />
                <span className="text-lg font-medium leading-relaxed">
                  Omaha, Nebraska & All<br />Surrounding Cities
                </span>
              </li>
            </ul>
          </div>

        </div>
        <div className="text-center text-white/50 text-sm">
          &copy; 2025 Aksarben Locksmiths. All rights reserved.
        </div>
      </div>
    </footer>
  </div>
);

export default Footer;