import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Facebook, MapPin, Phone, Mail, Twitter, Instagram } from 'lucide-react';
import { trackClick, trackEvent, buildEventName } from '../utils/analytics';
import { openWithAppFallback } from '../utils/openWithAppFallback';

const serviceLinks = [
  { name: 'Residential Lockouts', slug: 'residential' },
  { name: 'Automotive Lockouts', slug: 'automotive' },
  { name: 'Broken Key Extraction', slug: 'extraction' },
  { name: 'Key Duplication', slug: 'duplication' },
  { name: 'Lock Rekeying', slug: 'rekeying' },
  { name: 'Security Consultation', slug: 'consultation' }
];

const Footer: React.FC = () => {
  const navigate = useNavigate();
  return (
  <div className="relative overflow-hidden">
    <footer id="footer" className="relative border-t border-white/10 scroll-mt-[38px]">
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
                  src="/images/shield-logo.webp"
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
              {/* Facebook with app deep link + fallback */}
              <a
                href="https://m.facebook.com/AksarbenLocksmithsLLC/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-500 transition focus:outline-none focus:ring-2 focus:ring-red-500/60"
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
                    return;
                  }

                  trackClick('footer_social_click', e.currentTarget, {
                    platform: 'Facebook',
                    url: 'https://m.facebook.com/AksarbenLocksmithsLLC/',
                    page_section: 'footer',
                    intent: 'app_fallback',
                  });

                  e.preventDefault();

                  const ua = navigator.userAgent || '';
                  const isIOS = /iPad|iPhone|iPod/.test(ua);
                  const isAndroid = /Android/.test(ua);

                  const webUrl = 'https://m.facebook.com/AksarbenLocksmithsLLC/';
                  const appUrl = 'fb://facewebmodal/f?href=https://www.facebook.com/AksarbenLocksmithsLLC/';

                  if (isIOS || isAndroid) {
                    openWithAppFallback({
                      appUrl,
                      webUrl,
                      timeoutMs: 600,
                    });
                  } else {
                    window.location.href = webUrl;
                  }
                }}
              >
                <Facebook className="w-5 h-5 text-white" />
              </a>

              {/* Twitter, X with app deep link + fallback */}
              <a
                href="https://x.com/aksarbenlocks"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-500 transition focus:outline-none focus:ring-2 focus:ring-red-500/60"
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
                    return;
                  }

                  trackClick('footer_social_click', e.currentTarget, {
                    platform: 'Twitter',
                    url: 'https://x.com/aksarbenlocks',
                    page_section: 'footer',
                    intent: 'app_fallback',
                  });

                  e.preventDefault();

                  const ua = navigator.userAgent || '';
                  const isIOS = /iPad|iPhone|iPod/.test(ua);
                  const isAndroid = /Android/.test(ua);

                  const webUrl = 'https://x.com/aksarbenlocks';
                  const appUrl = 'twitter://user?screen_name=aksarbenlocks';

                  if (isIOS || isAndroid) {
                    openWithAppFallback({
                      appUrl,
                      webUrl,
                      timeoutMs: 600,
                    });
                  } else {
                    window.location.href = webUrl;
                  }
                }}
              >
                <Twitter className="w-5 h-5 text-white" />
              </a>

              {/* Instagram with app deep link + fallback */}
              <a
                href="https://www.instagram.com/aksarbenlocksmiths/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-500 transition focus:outline-none focus:ring-2 focus:ring-red-500/60"
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
                    return;
                  }

                  trackClick('footer_social_click', e.currentTarget, {
                    platform: 'Instagram',
                    url: 'https://www.instagram.com/aksarbenlocksmiths/',
                    page_section: 'footer',
                    intent: 'app_fallback',
                  });

                  e.preventDefault();

                  const ua = navigator.userAgent || '';
                  const isIOS = /iPad|iPhone|iPod/.test(ua);
                  const isAndroid = /Android/.test(ua);

                  const appUrl = 'instagram://user?username=aksarbenlocksmiths';
                  const webUrl = 'https://www.instagram.com/aksarbenlocksmiths/';

                  if (isIOS || isAndroid) {
                    openWithAppFallback({
                      appUrl,
                      webUrl,
                      timeoutMs: 600,
                    });
                  } else {
                    window.location.href = webUrl;
                  }
                }}
              >
                <Instagram className="w-5 h-5 text-white" />
              </a>

              {/* Google Maps with app deep link + smart link fallback */}
              <a
                href="https://maps.app.goo.gl/wEUyPutcxoth9yat8"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Google Maps"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-500 transition focus:outline-none focus:ring-2 focus:ring-red-500/60"
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
                    return;
                  }

                  trackClick('footer_social_click', e.currentTarget, {
                    platform: 'Google Maps',
                    url: 'https://maps.app.goo.gl/wEUyPutcxoth9yat8',
                    page_section: 'footer',
                    intent: 'app_fallback',
                  });

                  e.preventDefault();

                  const ua = navigator.userAgent || '';
                  const isIOS = /iPad|iPhone|iPod/.test(ua);
                  const isAndroid = /Android/.test(ua);

                  const webUrl = 'https://maps.app.goo.gl/wEUyPutcxoth9yat8';
                  const appUrl = 'comgooglemaps://?center=41.320272,-96.1460354&q=Aksarben+Locksmiths+LLC';

                  if (isIOS || isAndroid) {
                    openWithAppFallback({
                      appUrl,
                      webUrl,
                      timeoutMs: 600,
                    });
                  } else {
                    window.location.href = webUrl;
                  }
                }}
              >
                <MapPin className="w-5 h-5 text-white" />
              </a>

              {/* Yelp, new icon at the far right */}
              <a
                href="https://www.yelp.com/biz/aksarben-locksmiths-omaha-15"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Yelp"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-500 transition focus:outline-none focus:ring-2 focus:ring-red-500/60"
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
                    return;
                  }

                  trackClick('footer_social_click', e.currentTarget, {
                    platform: 'Yelp',
                    url: 'https://www.yelp.com/biz/aksarben-locksmiths-omaha-15',
                    page_section: 'footer',
                    intent: 'app_fallback',
                  });

                  e.preventDefault();

                  const ua = navigator.userAgent || '';
                  const isIOS = /iPad|iPhone|iPod/.test(ua);
                  const isAndroid = /Android/.test(ua);

                  const webUrl = 'https://www.yelp.com/biz/aksarben-locksmiths-omaha-15';
                  const appUrl = 'yelp:///biz/aksarben-locksmiths-omaha-15';

                  if (isIOS || isAndroid) {
                    openWithAppFallback({
                      appUrl,
                      webUrl,
                      timeoutMs: 600,
                    });
                  } else {
                    window.location.href = webUrl;
                  }
                }}
              >
                <img src="/icons/yelp.svg" alt="Yelp" className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* COLUMN 2 — QUICK LINKS */}
          <div>
            <h3 className="font-bold text-white text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li><a href="#home" onClick={(e) => {
                const eventName = buildEventName({ base: 'footer_nav_click', slug: 'home' });
                trackClick(eventName, e.currentTarget, { page_section: 'footer', nav_item: 'home' });
              }} className="hover:text-red-500 transition-colors">Home</a></li>
              <li><a href="#services" onClick={(e) => {
                const eventName = buildEventName({ base: 'footer_nav_click', slug: 'services' });
                trackClick(eventName, e.currentTarget, { page_section: 'footer', nav_item: 'services' });
              }} className="hover:text-red-500 transition-colors">Services</a></li>
              <li><a href="#about" onClick={(e) => {
                const eventName = buildEventName({ base: 'footer_nav_click', slug: 'about' });
                trackClick(eventName, e.currentTarget, { page_section: 'footer', nav_item: 'about' });
              }} className="hover:text-red-500 transition-colors">About Us</a></li>
              <li><a href="#testimonials" onClick={(e) => {
                const eventName = buildEventName({ base: 'footer_nav_click', slug: 'testimonials' });
                trackClick(eventName, e.currentTarget, { page_section: 'footer', nav_item: 'testimonials' });
              }} className="hover:text-red-500 transition-colors">Testimonials</a></li>
              <li><a href="#pricing" onClick={(e) => {
                const eventName = buildEventName({ base: 'footer_nav_click', slug: 'pricing' });
                trackClick(eventName, e.currentTarget, { page_section: 'footer', nav_item: 'pricing' });
              }} className="hover:text-red-500 transition-colors">Pricing</a></li>
              <li><a href="#contact" onClick={(e) => {
                const eventName = buildEventName({ base: 'footer_nav_click', slug: 'contact' });
                trackClick(eventName, e.currentTarget, { page_section: 'footer', nav_item: 'contact' });
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
                    state={{ scrollFx: "bottomThenTop" }}
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
            <h3 className="font-bold text-white text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3 md:space-y-4 text-white/70">
              <li className="flex items-center space-x-5">
                <Phone className="w-6 h-6 text-red-500" />
                <a
                  href="tel:+14025566715"
                  onClick={(e) => {
                    const eventName = buildEventName({ base: 'footer', action: 'call_button_click' });
                    trackClick(eventName, e.currentTarget, {
                      phone_number: '+14025566715',
                      page_section: 'footer',
                      origin: 'footer'
                    });
                  }}
                  className="text-lg font-medium hover:text-red-500 transition-colors"
                >
                  (402) 556-6715
                </a>
              </li>
              <li className="flex items-center space-x-5">
                <Mail className="w-6 h-6 text-red-500" />
                <a
                  href="mailto:AksarbenLocksmiths@gmail.com"
                  onClick={(e) => trackClick('footer_email_click', e.currentTarget, {
                    email: 'AksarbenLocksmiths@gmail.com',
                    source: 'footer',
                    page_section: 'footer'
                  })}
                  className="text-lg font-medium hover:text-red-500 transition-colors"
                >
                  AksarbenLocksmiths@gmail.com
                </a>
              </li>
              <li className="flex items-start space-x-5">
                <MapPin className="w-6 h-6 text-red-500 mt-1" />
                <Link
                  to="/service-areas"
                  state={{ fromFooter: true }}
                  onClick={(e) =>
                    trackClick('footer_service_areas_click', e.currentTarget as unknown as HTMLElement, {
                      source: 'footer',
                      page_section: 'footer',
                      destination: '/service-areas',
                    })
                  }
                  className="text-lg font-medium leading-relaxed hover:text-red-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded-md"
                  aria-label="View our Service Areas"
                  title="View our Service Areas"
                >
                  Omaha, Nebraska & All<br />Surrounding Cities
                </Link>
              </li>
              <li className="mt-0">
                <form
                  role="search"
                  aria-label="Site search"
                  className="relative"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const q = (new FormData(form).get('q') as string | null) ?? '';
                    try {
                      (document.body as HTMLElement)?.focus?.();
                    } catch {}
                    try {
                      trackClick('footer_search_submit', form as unknown as HTMLElement, {
                        source: 'footer',
                        page_section: 'footer',
                        q,
                      });
                    } catch {}
                    navigate(`/search${q ? `?q=${encodeURIComponent(q)}` : ''}`, { state: { fromFooter: true } });
                  }}
                >
                  <label htmlFor="footer-search" className="sr-only">Search services & blog</label>
                  <input
                    id="footer-search"
                    name="q"
                    type="search"
                    placeholder="Search services & blog…"
                    className="w-full rounded-xl bg-white/10 text-white placeholder-white/50 px-4 py-3 pr-12 border border-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    aria-label="Search"
                    className="absolute right-1.5 top-1.5 h-[2.25rem] px-3 rounded-lg text-white text-sm font-medium border border-white/10 bg-[linear-gradient(to_left,_#7f1d1d,_#991b1b,_#ef4444,_#b91c1c,_#991b1b,_#7f1d1d)] bg-[length:800%_100%] animate-[redHeatWaveReverse_3s_linear_infinite] hover:brightness-110 transition"
                  >
                    Search
                  </button>
                </form>
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
};

export default Footer;