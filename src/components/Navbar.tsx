import React, { useState, useEffect } from 'react';
import { Menu, X, Phone } from 'lucide-react';
import { trackNavigation, trackClick } from '../utils/analytics';

const navItems = [
  { label: "🚨 Emergency", href: "#home" },
  { label: "🛠️ Services", href: "#services" },
  { label: "🌟 Reviews", href: "#testimonials" },
  { label: "📍 About", href: "#about" },
  { label: "💲 Prices", href: "#pricing" },
  { label: "📞 Contact", href: "#contact" },
];

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsTablet(window.innerWidth < 1280);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Reset scroll position when menu opens in mobile-horizontal mode
  useEffect(() => {
    if (menuOpen && menuRef.current) {
      // Only reset scroll in mobile-horizontal mode (768px - 1039px)
      if (window.innerWidth >= 768 && window.innerWidth <= 1039) {
        menuRef.current.scrollTop = 0;
      }
    }
  }, [menuOpen]);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('.red-cascade-menu') && !target.closest('.menu-trigger')) {
        setMenuOpen(false);
      }
    };

    const handleScroll = () => {
      setMenuOpen(false);
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-[42px] w-full z-40 h-[72px] px-4 sm:px-6 md:px-12">
      <div className="max-w-7xl mx-auto relative h-full">
        <div className={`absolute inset-0 rounded-full transition-all duration-300 ease-in-out ${
          isScrolled ? 'bg-gradient-to-r from-red-900/80 via-black/70 to-red-900/80 animate-heatwave backdrop-blur-md shadow-xl bg-[length:400%_100%]' : 'bg-transparent'
        }`} />
        
        <nav className="relative z-10 h-full flex items-center justify-between px-4">
          <a 
            href="#" 
            onClick={(e) => trackClick('logo_click', e.currentTarget, {
              source: 'navbar',
              page_section: 'logo'
            })}
            className="flex items-center gap-2 flex-1 xl:flex-initial relative ml-[-2px]"
          >
            <img
              src="/images/shield-logo.png"
              alt="Aksarben Locksmiths Logo"
              className="w-14 h-14 sm:w-16 sm:h-16 object-contain key-tilt-strong" 
            />
            <span 
              className="animated-gradient font-extrabold text-xl sm:text-2xl tracking-wide whitespace-nowrap drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-center xl:text-left flex-1"
              style={{ transform: 'translateX(-4px)' }}
            >
              Aksarben Locksmiths
            </span>
          </a>

          <div className="hidden xl:flex flex-1 justify-center">
            <ul className="hidden xl:flex items-center gap-6">
              {[
                'Home',
                'Services',
                'About',
                'Testimonials',
                'Pricing',
                'Contact',
              ].map((item) => (
                <li key={item}>
                  <a 
                    href={`#${item.toLowerCase()}`} 
                    onClick={(e) => {
                      trackNavigation(item.toLowerCase(), 'header');
                      trackClick('navigation_click', e.currentTarget, {
                        page_section: 'header_navigation',
                        nav_item: item.toLowerCase()
                      });
                    }}
                    className="px-4 py-1 rounded-full bg-[length:400%_100%] bg-gradient-to-r from-blue-900 via-blue-700 to-blue-900 animate-heatwave backdrop-blur-md border border-blue-800/30 text-white transition-all duration-200 hover:scale-110 hover:shadow-[0_0_12px_4px_rgba(59,130,246,0.6)] hover:duration-100"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <a
            href="tel:+14025566715"
            onClick={(e) => trackClick('header_call_now', e.currentTarget, { 
              phone_number: '+14025566715',
              page_section: 'header_cta'
            })}
            className="hidden xl:flex items-center gap-2 px-4 py-1 rounded-full bg-red-700/90 text-white border border-red-800/30 transition-all duration-200 hover:scale-110 hover:shadow-[0_0_12px_4px_rgba(239,68,68,0.6)] hover:duration-100 flex-shrink-0"
          >
            <Phone className="h-4 w-4" />
            <span className="font-medium">Call Now</span>
          </a>

          <button
            onClick={(e) => {
              const newMenuState = !menuOpen;
              setMenuOpen(newMenuState);
              trackClick('hamburger_menu_toggle', e.currentTarget, {
                source: 'mobile_nav',
                state: newMenuState ? 'open' : 'close'
              });
            }}
            className="xl:hidden menu-trigger w-10 h-10 flex items-center justify-center bg-gradient-to-r from-red-600 to-red-500 rounded-full shadow-lg hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-0 active:outline-none"
            aria-label="Toggle Menu"
          >
            {menuOpen ? (
              <X className="w-6 h-6 text-white animate-safe-chaos" />
            ) : (
              <Menu className="w-6 h-6 text-white transition-all duration-300" />
            )}
          </button>
        </nav>
      </div>

      {/* Red Cascade Menu */}
      {isTablet && (
        <div 
          className={`fixed top-[124px] left-0 w-full z-50 px-4 sm:px-6 md:px-12 transition-all duration-300 ${
            menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
        >
          <div ref={menuRef} className="mobile-menu max-h-[calc(100vh-124px)] overflow-y-auto">
            <div
              className="red-cascade-menu animate-red-lava-wave rounded-2xl border border-red-500/20 shadow-xl px-6 py-5 backdrop-blur-md space-y-3"
              role="menu"
              aria-label="Mobile navigation menu"
            >
              {navItems.map((item, idx) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    setMenuOpen(false);
                    trackNavigation(item.href.replace('#', ''), 'mobile_menu');
                    trackClick('mobile_nav_click', e.currentTarget, {
                      page_section: 'mobile_menu',
                      nav_item: item.href.replace('#', '')
                    });
                  }}
                  role="menuitem"
                  style={{ animationDelay: `${idx * 0.12}s` }}
                  className="block w-full px-6 py-3 rounded-full bg-gradient-to-r from-red-600 to-red-500 text-white font-bold text-center shadow-lg hover:brightness-110 transition-all animate-fade-in-up"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;