import React from 'react';
import { Shield, Award, Clock, CheckCircle } from 'lucide-react';
import PillBadge from './ui/PillBadge';
import { trackClick, trackEngagement } from '../utils/analytics';

// Trigger full rebuild to refresh Tailwind purge cache

const AboutSection: React.FC = () => {
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          trackEngagement('section_view', 'about_section', {
            visibility_threshold: '50%'
          });
        }
      },
      { threshold: 0.5 }
    );

    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      observer.observe(aboutSection);
    }

    return () => {
      if (aboutSection) observer.unobserve(aboutSection);
    };
  }, []);

  const handleImageHover = (imageName: string, action: 'enter' | 'leave') => {
    trackEngagement('image_hover', `about_image_${imageName}`, {
      hover_action: action
    });
  };

  return (
    <section id="about" className="py-24 scroll-mt-[38px]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <PillBadge variant="about" className="mb-[24px]">About Us</PillBadge>

            {/* FifteenYearsContainer */}
            <div className="relative overflow-hidden bg-black/80 backdrop-blur-md p-5 pt-3 pb-3 rounded-2xl shadow-xl ring-1 ring-white/10 shadow-inner backdrop-saturate-150 max-w-2xl mx-auto mt-[10px] mb-[32px] transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] animate-luxury-fade-up">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-black to-blue-900 opacity-40 animate-luxury-horizontal-shimmer z-0"></div>
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-900 via-blue-300 to-blue-900 bg-clip-text text-transparent bg-[length:400%_100%] bg-[position:0%_50%] animate-[text-shimmer_10s_linear_infinite] text-center">Trusted Locksmith Services in Omaha for Over 15 Years</h2>
                <div className="mt-4 text-white relative -top-4">
                  <p className="font-semibold">What should I expect when calling Aksarben Locksmiths?</p>
                  <p className="text-gray-300 mt-1">
                    You'll speak with a local expert who can assess your needs and dispatch help. We're fully licensed and ready to assist with residential, commercial, or vehicle lockouts.
                  </p>
                </div>
                
                <div className="space-y-3 mb-4">
                  {[
                    { icon: <Shield className="h-5 w-5 text-red-500" />, text: "Licensed, bonded, and insured for your peace of mind" },
                    { icon: <Award className="h-5 w-5 text-red-500" />, text: "Certified by the Associated Locksmiths of America (ALOA)" },
                    { icon: <Clock className="h-5 w-5 text-red-500" />, text: "Trusted emergency service with prompt arrival" },
                    { icon: <CheckCircle className="h-5 w-5 text-red-500" />, text: "100% satisfaction guarantee on all services" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start">
                      <div className="mr-3 mt-1">{item.icon}</div>
                      <p className="text-white font-bold [text-shadow:0_0_6px_rgba(255,255,255,0.4)]">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4 flex-wrap mt-4">
              <a 
                href="#contact" 
                onClick={(e) => trackClick('cta_contact_click', e.currentTarget, { 
                  source: 'about_section',
                  page_section: 'about'
                })}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full transition-colors font-medium"
              >
                Contact Us
              </a>
              <a 
                href="#testimonials" 
                onClick={(e) => trackClick('cta_testimonials_click', e.currentTarget, { 
                  source: 'about_section',
                  page_section: 'about'
                })}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300 font-medium"
              >
                See Testimonials
              </a>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-6">
            <div className="space-y-12">
              <div className="rounded-2xl overflow-hidden h-64 transform translate-y-8">
                <img 
                  src="/images/About Us Thumbnails/About-Us-Photo-1.webp" 
                  alt="Key duplication omaha - mobile locksmith omaha cutting keys" 
                  className="object-cover w-full h-full border-2 border-white/20 shadow-lg rounded-2xl transition-transform duration-300 ease-out transform hover:scale-105"
                  onMouseEnter={() => handleImageHover('1', 'enter')}
                  onMouseLeave={() => handleImageHover('1', 'leave')}
                  onClick={(e) => trackClick('about_image_click', e.currentTarget, {
                    page_section: 'about',
                    image_name: 'key_duplication_process'
                  })}
                />
              </div>
              <div className="rounded-2xl overflow-hidden h-48">
                <img 
                  src="/images/About Us Thumbnails/About-Us-Photo-3.webp" 
                  alt="Commercial locksmith omaha repairing business door locks" 
                  className="object-cover w-full h-full border-2 border-white/20 shadow-lg rounded-2xl transition-transform duration-300 ease-out transform hover:scale-105"
                  onMouseEnter={() => handleImageHover('3', 'enter')}
                  onMouseLeave={() => handleImageHover('3', 'leave')}
                  onClick={(e) => trackClick('about_image_click', e.currentTarget, {
                    page_section: 'about',
                    image_name: 'commercial_door_lock_repair'
                  })}
                />
              </div>
            </div>
            <div className="space-y-12">
              <div className="rounded-2xl overflow-hidden h-48">
                <img 
                  src="/images/About Us Thumbnails/About-Us-Photo-2.webp" 
                  alt="Residential locksmith omaha installing home door locks" 
                  className="object-cover w-full h-full border-2 border-white/20 shadow-lg rounded-2xl transition-transform duration-300 ease-out transform hover:scale-105"
                  onMouseEnter={() => handleImageHover('2', 'enter')}
                  onMouseLeave={() => handleImageHover('2', 'leave')}
                  onClick={(e) => trackClick('about_image_click', e.currentTarget, {
                    page_section: 'about',
                    image_name: 'residential_door_lock_repair'
                  })}
                />
              </div>
              <div className="rounded-2xl overflow-hidden h-64 transform translate-y-[-2rem]">
                <img 
                  src="/images/About Us Thumbnails/About-Us-Photo-4.webp" 
                  alt="Emergency locksmith omaha mobile tools for 24 hour service" 
                  className="object-cover w-full h-full border-2 border-white/20 shadow-lg rounded-2xl transition-transform duration-300 ease-out transform hover:scale-105"
                  onMouseEnter={() => handleImageHover('4', 'enter')}
                  onMouseLeave={() => handleImageHover('4', 'leave')}
                  onClick={(e) => trackClick('about_image_click', e.currentTarget, {
                    page_section: 'about',
                    image_name: 'locksmith_tools'
                  })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;