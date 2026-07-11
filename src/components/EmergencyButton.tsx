import React, { useState, useEffect } from 'react';
import { Phone } from 'lucide-react';
import { trackClick, buildEventName } from '../utils/analytics';

const EmergencyButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show button after scrolling a bit
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <a
      href="tel:+14023507534"
      onClick={(e) => {
        const eventName = buildEventName({ base: 'floating_call_button', action: 'call_button_click' });
        trackClick(eventName, e.currentTarget, {
          phone_number: '+14023507534',
          page_section: 'floating_call',
          origin: 'floating_call_button'
        });
      }}
      className={`fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full transition-colors ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
      } motion-safe:animate-call-bounce`}
    >
      <Phone className="h-5 w-5" />
      <span className="font-medium">Call Now</span>
    </a>
  );
};

export default EmergencyButton;