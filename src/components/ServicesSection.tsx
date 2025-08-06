import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Car, Key, RefreshCw, Shield, KeyRound } from 'lucide-react';
import PillBadge from './ui/PillBadge';
import { trackEvent } from '../utils/analytics';

const services = [
  {
    slug: 'residential',
    title: 'Residential Lockouts',
    description: 'Locked out of your home? Our technicians will get you back inside quickly with minimal damage.',
    image: '/images/Services Thumbnails/Residential-Service-Photo.webp',
    icon: <Home className="h-12 w-12 text-white" />,
  },
  {
    slug: 'automotive',
    title: 'Automotive Lockouts',
    description: 'Car key lost or locked inside? We can unlock any vehicles without damage and create replacement keys.',
    image: '/images/Services Thumbnails/Automotive-Lockout.webp',
    icon: <Car className="h-12 w-12 text-white" />,
  },
  {
    slug: 'extraction',
    title: 'Broken Key Extraction',
    description: 'Key snapped off in your lock? We\'ll extract the broken piece and provide a new key on the spot.',
    image: '/images/Services Thumbnails/Broken-Key-Extraction.webp',
    icon: <Key className="h-12 w-12 text-white" />,
  },
  {
    slug: 'duplication',
    title: 'Key Duplication',
    description: 'Fast and accurate duplication for all types of keys, including high-security.',
    image: '/images/Services Thumbnails/Key-Duplication.webp',
    icon: <RefreshCw className="h-12 w-12 text-white" />,
  },
  {
    slug: 'rekeying',
    title: 'Lock Rekeying',
    description: 'Change your locks to work with new keys without replacing the whole unit.',
    image: '/images/Services Thumbnails/Lock-ReKeying.webp',
    icon: <Shield className="h-12 w-12 text-white" />,
  },
  {
    slug: 'consultation',
    title: 'Security Consultation',
    description: 'Expert advice to upgrade your home or office\'s lock systems.',
    image: '/images/Services Thumbnails/Security-Consultation.webp',
    icon: <KeyRound className="h-12 w-12 text-white" />,
  }
];

const ServicesSection: React.FC = () => {
  const gradientClasses = [
    "group bg-gradient-to-br from-blue-900/50 via-indigo-800/50 to-purple-900/50 hover:bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-red-900/10 border border-white/10",
    "group bg-gradient-to-br from-red-900/50 via-pink-800/50 to-orange-800/50 hover:bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-red-900/10 border border-white/10",
    "group bg-gradient-to-br from-yellow-800/50 via-amber-700/50 to-orange-800/50 hover:bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-red-900/10 border border-white/10",
    "group bg-gradient-to-br from-teal-900/50 via-cyan-800/50 to-blue-900/50 hover:bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-red-900/10 border border-white/10",
    "group bg-gradient-to-br from-purple-900/50 via-fuchsia-800/50 to-pink-700/50 hover:bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-red-900/10 border border-white/10",
    "group bg-gradient-to-br from-emerald-900/50 via-green-800/50 to-teal-900/50 hover:bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-red-900/10 border border-white/10"
  ];

  return (
    <section id="services" className="py-24 scroll-mt-[38px]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <PillBadge variant="services">Our Expertise</PillBadge>
          <div className="bg-gradient-to-br from-black via-red-800 via-orange-600 via-blue-700 to-blue-900 bg-[length:400%_400%] bg-[position:0%_50%] animate-gradient-footer rounded-3xl px-10 py-10 shadow-2xl max-w-4xl mx-auto text-center space-y-6 mb-4 lg:mb-8 border border-white/10 transition-transform duration-300 ease-in-out hover:scale-105">
            <h2 className="text-4xl font-bold text-transparent bg-clip-text red-blue-hypersweep">
              Professional Locksmith Services
            </h2>
            <p className="text-white text-lg [text-shadow:0_0_6px_rgba(255,255,255,0.8)]">
              From Emergency Lockouts to Complete Key Solutions<br />
              Our Team of Skilled Locksmiths are Ready to Help 24/7
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Link
              key={index}
              to={`/services/${service.slug}`}
              state={{ scrollTo: "services" }}
              onClick={(e) => {
                sessionStorage.setItem("lastScrollY", window.scrollY.toString());
                trackEvent('service_tile_click', {
                  service: service.slug,
                  service_title: service.title,
                  service_name: service.title,
                  element_text: service.title,
                  target_url: `/services/${service.slug}`,
                  page_section: 'services'
                });
              }}
              className={`relative block transition-transform duration-200 hover:scale-[1.02] ${gradientClasses[index]}`}
            >
              <div className="absolute top-0 right-0 bg-red-600 text-white text-[13px] font-semibold px-4 py-1 rounded-bl-xl shadow-md z-10">
                Learn More
              </div>
              <div className="h-48 overflow-hidden">
                <img 
                  src={service.image} 
                  alt={service.slug === 'residential' ? 'Residential locksmith omaha home lockout services' : 
                       service.slug === 'automotive' ? 'Car locksmith omaha auto lockout services' : 
                       service.slug === 'extraction' ? 'Emergency locksmith omaha broken key extraction' : 
                       service.slug === 'duplication' ? 'Key duplication omaha mobile locksmith services' : 
                       service.slug === 'rekeying' ? 'Rekeying locks omaha professional locksmith' : 
                       'Commercial locksmith omaha business security services'} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3 group-hover:text-red-500 transition-colors">
                  {service.title}
                </h3>
                <p className="text-white/70">
                  {service.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;