import React from 'react';
import { Check } from 'lucide-react';
import PillBadge from './ui/PillBadge';
import { trackClick } from '../utils/analytics';

const pricingPlans = [
  {
    title: "Emergency Service",
    description: "24/7 emergency lockout services for when you need help right away.",
    features: [
      "Available 24/7",
      "Rapid emergency response",
      "No damage entry methods",
      "Residential, commercial & auto",
      "Transparent pricing",
      "Licensed technicians"
    ],
    isPopular: true,
    buttonText: "Call Now",
    buttonLink: "tel:+14025566715"
  },
  {
    title: "Residential",
    description: "Complete locksmith services for your home security needs.",
    features: [
      "Lock installation & repair",
      "Rekeying services",
      "Key duplication",
      "Smart lock installation",
      "Security upgrades",
      "Free security consultation"
    ],
    isPopular: false,
    buttonText: "Get Quote",
    buttonLink: "#contact"
  },
  {
    title: "Commercial",
    description: "Professional locksmith solutions for businesses of all sizes.",
    features: [
      "Master key systems",
      "Access control installation",
      "High-security locks",
      "Exit device installation",
      "Door closer installation",
      "Scheduled maintenance"
    ],
    isPopular: false,
    buttonText: "Contact Us",
    buttonLink: "#contact"
  }
];

const PricingSection: React.FC = () => {
  return (
    <section id="pricing" className="py-24 scroll-mt-[38px]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <PillBadge variant="pricing">Pricing</PillBadge>
          <div className="relative bg-gradient-to-r from-blue-950 via-black to-indigo-950 animate-twilight-flow backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl max-w-5xl mx-auto mb-16 text-center overflow-hidden">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-500 to-yellow-300 animate-text-shimmer">
              Transparent & Competitive Pricing
            </h2>
            <p className="text-lg text-white max-w-3xl mx-auto text-shadow-white animate-text-glow">
              We offer fair and transparent pricing for all our services. No hidden fees or surprises.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <div 
              key={index} 
              className={`relative rounded-2xl overflow-hidden transition-transform duration-300 hover:transform hover:scale-105 ${
                plan.isPopular ? 'border-2 border-red-500 bg-gradient-to-b from-red-900/40 to-black/40 backdrop-blur-3xl' : 'border border-white/10 bg-gradient-to-b from-indigo-900/50 to-black/50 backdrop-blur-3xl'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 right-0">
                  <div className="bg-red-600 text-white text-xs font-bold px-3 py-1 transform rotate-0 translate-x-0 translate-y-0">
                    MOST POPULAR
                  </div>
                </div>
              )}
              
              <div className="p-8">
                <h3 className={`text-[1.35rem] md:text-[1.75rem] font-bold text-transparent bg-clip-text bg-gradient-to-r animate-text-shimmer-fast tracking-wide mb-2 ${
                  plan.title === "Emergency Service" ? "from-red-500 via-blue-500 to-red-600" :
                  plan.title === "Residential" ? "from-cyan-300 via-sky-400 to-blue-500" :
                  "from-cyan-300 via-sky-400 to-blue-500"
                }`}>{plan.title}</h3>
                <p className="text-white/70 text-sm italic mb-4">{plan.description}</p>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-white/90 text-sm font-medium tracking-tight">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <a 
                  href={plan.buttonLink} 
                  onClick={(e) => trackClick('pricing_cta_click', e.currentTarget, { 
                    plan_title: plan.title,
                    button_text: plan.buttonText,
                    is_popular: plan.isPopular,
                    page_section: 'pricing'
                  })}
                  className={`block text-center py-3 px-6 rounded-full font-medium shadow-lg hover:shadow-indigo-500/50 transition-all duration-300 ${
                    plan.isPopular 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-indigo-700 hover:bg-indigo-800 text-white border border-indigo-500'
                  }`}
                >
                  {plan.buttonText}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;