import React, { useState, useEffect, useRef } from 'react';
import { Phone, MapPin, Mail, Clock } from 'lucide-react';
import PillBadge from './ui/PillBadge';
import { trackFormEvent, trackClick, trackEvent } from '../utils/analytics';

const ContactSection: React.FC = () => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: 'Residential',
    message: ''
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.6 }
    );

    if (headingRef.current) {
      observer.observe(headingRef.current);
    }

    return () => {
      if (headingRef.current) observer.unobserve(headingRef.current);
    };
  }, [hasAnimated]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Track form submission
    trackFormEvent('form_submit', 'contact_form', {
      service_type: formData.service,
      has_phone: !!formData.phone,
      has_email: !!formData.email,
      message_length: formData.message.length
    });
    
    alert('Form submitted! In a real application, this would send your request to our team.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      service: 'Residential',
      message: ''
    });
  };

  const handleInputFocus = (fieldName: string) => {
    trackEvent('form_input_focus', {
      field_name: fieldName,
      form_name: 'contact_form'
    });
  };

  const handleServiceChange = (service: string) => {
    trackEvent('service_type_select', {
      selected_service: service,
      form_name: 'contact_form'
    });
    setFormData({ ...formData, service });
    setDropdownOpen(false);
  };

  return (
    <section id="contact" className="py-24 scroll-mt-[38px]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <PillBadge variant="contact">Contact Us</PillBadge>
          <div className="bg-gradient-to-r from-[#7b1414] via-[#4e0e2f] via-[#2c0727] via-[#0f1f4c] via-[#1e3267] to-[#0a112e] bg-[length:300%_300%] animate-contactHeatWave transition-all duration-[3000ms] ease-in-out rounded-xl shadow-lg border border-white/10 px-6 py-4 max-w-4xl mx-auto flex flex-col items-center justify-center">
            <h2
              ref={headingRef}
              className={`text-3xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#ffb47e] via-[#fca17c] to-[#ff8960] ${
                hasAnimated ? 'typewriter' : ''
              }`}
            >
              Get in Touch
            </h2>
            <p className="text-lg text-white max-w-3xl mx-auto text-shadow-white animate-text-glow">
              Need emergency locksmith services or have questions about our services? Contact us 24/7.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-16">
          <div>
            <div className="bg-gradient-to-br from-[#7b1414] via-[#4e0e2f] to-[#2c0727] bg-opacity-40 backdrop-blur-lg rounded-3xl p-8 border border-white/10 shadow-2xl ring-1 ring-white/20 transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl mb-8">
              <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-red-600/20 p-3 rounded-full mr-4">
                    <Phone className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <p className="font-medium text-white mb-1">Phone</p>
                    <a 
                      href="tel:+14025566715" 
                      onClick={(e) => trackClick('contact_phone_click', e.currentTarget, { 
                        phone_number: '+14025566715',
                        source: 'contact_section',
                        page_section: 'contact'
                      })}
                      className="text-white/70 hover:text-red-500 transition-colors"
                    >
                      (402) 556-6715
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-red-600/20 p-3 rounded-full mr-4">
                    <Mail className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <p className="font-medium text-white mb-1">Email</p>
                    <a 
                      href="mailto:Aksarbenlocks@gmail.com" 
                      onClick={(e) => trackClick('contact_email_click', e.currentTarget, { 
                        email: 'info@aksarbenlocksmiths.com',
                        source: 'contact_section',
                        page_section: 'contact'
                      })}
                      className="text-white/70 hover:text-red-500 transition-colors"
                    >
                      info@aksarbenlocksmiths.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-red-600/20 p-3 rounded-full mr-4">
                    <MapPin className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <p className="font-medium text-white mb-1">Service Area</p>
                    <p className="text-white/70">
                      Omaha, Nebraska & All Surrounding Cities
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-red-600/20 p-3 rounded-full mr-4">
                    <Clock className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <p className="font-medium text-white mb-1">Hours</p>
                    <p className="text-white/70">
                      24/7 Emergency Service
                    </p>
                    <p className="text-white/70">
                      Office: Mon-Fri 8am-6pm
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 h-64">
              <div className="w-full h-64 bg-[url('/images/map-service-area.png')] bg-cover bg-[center_bottom_20%] rounded-2xl shadow-xl border border-white/20"></div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-[#0f1f4c] via-[#1e3267] to-[#0a112e] bg-opacity-40 backdrop-blur-lg rounded-3xl p-8 border border-white/10 shadow-2xl ring-1 ring-white/20 transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl">
            <h3 className="text-2xl font-bold mb-6">Send Us a Message</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-white/80 mb-2">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => handleInputFocus('name')}
                  autoComplete="name"
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="Your name"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-white/80 mb-2">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => handleInputFocus('email')}
                    autoComplete="email"
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                    placeholder="Your email"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-white/80 mb-2">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onFocus={() => handleInputFocus('phone')}
                    autoComplete="tel"
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                    placeholder="Your phone"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="service" className="block text-white/80 mb-2">Service Needed</label>
                <div className="relative w-full">
                  <button
                    type="button"
                    className="w-full bg-[#0d152b]/80 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 transition-all duration-300 shadow-lg ring-1 ring-white/10 backdrop-blur-lg flex justify-between items-center"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    {formData.service}
                    <svg
                      className="w-5 h-5 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute z-10 mt-2 w-full bg-[#0d152b] border border-white/20 rounded-lg shadow-lg ring-1 ring-white/10 backdrop-blur-lg">
                      {['Residential', 'Commercial', 'Automotive', 'Safe Services', 'Other'].map(option => (
                        <div
                          key={option}
                          className={`p-3 text-white hover:bg-red-500 cursor-pointer transition`}
                          onClick={() => handleServiceChange(option)}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-white/80 mb-2">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  onFocus={() => handleInputFocus('message')}
                  required
                  rows={4}
                  className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="Describe what you need..."
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full transition-colors font-medium w-full"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;