import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import PillBadge from './ui/PillBadge';
import { trackClick, trackEvent } from '../utils/analytics';

const testimonials = [
  {
    name: "Michael Johnson",
    position: "Homeowner",
    testimonial: "I was locked out of my house at 11 PM and called AksarbenLocksmiths. They arrived in just 15 minutes and got me back inside without damaging my door. Fantastic service!",
    rating: 5,
    image: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  },
  {
    name: "Sarah Williams",
    position: "Business Owner",
    testimonial: "We needed our entire office rekeyed after an employee left. AksarbenLocksmiths handled everything professionally and efficiently. They even provided recommendations for improving our security system.",
    rating: 5,
    image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  },
  {
    name: "David Thompson",
    position: "Car Owner",
    testimonial: "Locked my keys in my car at the grocery store. Called these guys and they were there in 20 minutes. Quick, professional, and reasonably priced. Would definitely recommend!",
    rating: 5,
    image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  },
  {
    name: "Jennifer Davis",
    position: "Property Manager",
    testimonial: "We've been using AksarbenLocksmiths for all our properties for years. They're reliable, fast, and their work is always top-notch. Wouldn't trust anyone else with our security needs.",
    rating: 5,
    image: "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  },
];

const TestimonialsSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [hasTrackedView, setHasTrackedView] = useState(false);

  useEffect(() => {
    if (!autoplay) return;

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoplay]);

  const handlePrev = () => {
    setAutoplay(false);
    trackClick('testimonial_arrow_click', undefined, { 
      direction: 'previous',
      page_section: 'testimonials',
      element_text: 'Previous'
    });
    setActiveIndex((current) => (current - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setAutoplay(false);
    trackClick('testimonial_arrow_click', undefined, { 
      direction: 'next',
      page_section: 'testimonials',
      element_text: 'Next'
    });
    setActiveIndex((current) => (current + 1) % testimonials.length);
  };

  // Track testimonial view only when section becomes visible and user has interacted
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !autoplay && !hasTrackedView) {
          const currentTestimonial = testimonials[activeIndex];
          trackEvent('testimonial_view', {
            testimonial_name: currentTestimonial.name,
            testimonial_position: currentTestimonial.position,
            testimonial_index: activeIndex
          });
          setHasTrackedView(true);
        }
      },
      { threshold: 0.5 }
    );

    const testimonialsSection = document.getElementById('testimonials');
    if (testimonialsSection) {
      observer.observe(testimonialsSection);
    }

    return () => {
      if (testimonialsSection) observer.unobserve(testimonialsSection);
    };
  }, [activeIndex, autoplay, hasTrackedView]);

  return (
    <section id="testimonials" className="py-24 scroll-mt-[38px]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <PillBadge variant="testimonials">Testimonials</PillBadge>
          
          {/* 🌌 STRONG TWILIGHT MOTION OVERLAY */}
          <div className="relative px-6 py-10 mt-6 rounded-2xl shadow-2xl border border-white/10 ring-1 ring-white/10 max-w-4xl mx-auto overflow-hidden bg-black/80 backdrop-blur-md">
            
            {/* 🌌 STRONG TWILIGHT MOTION OVERLAY */}
            <div className="absolute inset-0 z-0 animate-twilight-flow bg-gradient-to-r from-purple-900 via-fuchsia-600 to-purple-900 opacity-50 blur-sm scale-[1.4]"></div>

            {/* ✨ CONTENT ABOVE SHIMMER */}
            <div className="relative z-10 space-y-4">
              <h2 className="text-4xl font-extrabold text-blue-300 animate-text-glow">
                What Our Customers Say
              </h2>
              <p className="text-white text-lg text-shadow-white">
                <strong>What should I expect when calling Aksarben Locksmiths?</strong><br />
                You'll speak with a local expert who can assess your needs and dispatch help. We're fully licensed and ready to assist with residential, commercial, or vehicle lockouts.
              </p>
            </div>
          </div>
        </div>
        
        <div className="relative">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  <div className={`
                    ${index % 4 === 0 ? 'bg-gradient-to-br from-blue-900/80 via-indigo-800/80 to-purple-900/80' : ''}
                    ${index % 4 === 1 ? 'bg-gradient-to-br from-red-900/80 via-pink-800/80 to-orange-800/80' : ''}
                    ${index % 4 === 2 ? 'bg-gradient-to-br from-yellow-800/80 via-amber-700/80 to-orange-800/80' : ''}
                    ${index % 4 === 3 ? 'bg-gradient-to-br from-teal-900/80 via-cyan-800/80 to-blue-900/80' : ''}
                    hover:bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 ring-1 ring-white/5 px-8 py-6 shadow-lg max-w-4xl mx-auto transition-all duration-300 hover:shadow-xl hover:shadow-red-900/10
                  `}>
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                      <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 border-2 border-red-500">
                        <img 
                          src={testimonial.image} 
                          alt={`Customer testimonial photo of ${testimonial.name}, ${testimonial.position || 'locksmith customer'}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-center md:justify-start mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} 
                            />
                          ))}
                        </div>
                        <blockquote className="text-white text-lg italic mb-4">
                          "{testimonial.testimonial}"
                        </blockquote>
                        <div className="text-left">
                          <p className="text-white font-bold">{testimonial.name}</p>
                          <p className="text-white/70 text-sm">{testimonial.position}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <button 
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:translate-x-0 bg-black/50 hover:bg-red-600 text-white rounded-full p-2 transition-colors z-10"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button 
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-0 bg-black/50 hover:bg-red-600 text-white rounded-full p-2 transition-colors z-10"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex justify-center mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                setAutoplay(false);
                trackClick('testimonial_dot_click', e.currentTarget, { 
                  testimonial_index: index,
                  testimonial_name: testimonials[index].name,
                  page_section: 'testimonials'
                });
                setActiveIndex(index);
              }}
              className={`w-3 h-3 rounded-full mx-1 transition-colors ${
                index === activeIndex ? 'bg-red-600' : 'bg-white/30'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;