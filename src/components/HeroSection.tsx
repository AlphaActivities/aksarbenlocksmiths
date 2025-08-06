import React from "react";
import { trackClick } from "../utils/analytics";

const HeroSection: React.FC = () => {
  return (
    <section id="home" className="relative min-h-screen lg:h-[140vh] w-full scroll-mt-[120px] pt-[480px] md:pt-[580px] text-white flex flex-col justify-end z-0 overflow-hidden">
      <div className="relative z-20 max-w-7xl mx-auto px-6 md:px-12 h-full flex flex-col justify-end">

        <div className="bg-black/80 backdrop-blur rounded-2xl px-6 py-10 shadow-xl max-w-5xl mx-auto text-center space-y-8 mb-4 lg:mb-[30px]">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-md">
            Locked Out? <span className="text-red-500">We're Already on the Way!</span>
          </h1>
          <p className="text-sm md:text-base text-white/70 font-medium [text-shadow:0_0_6px_rgba(255,255,255,0.8)]">
            Serving Omaha with 24/7 emergency service. Car, Home, Business & Safe Lockouts
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: "No Damage Entry", desc: "Professional tools protecting property" },
              { title: "Licensed & Insured", desc: "Your safety is our top priority" },
              { title: "Fast Response", desc: "Quick, reliable help when you need it most" },
              { title: "All Lock Types", desc: "From cars to safes – we handle it all" }
            ].map((card, idx) => (
              <div
                key={idx}
                onClick={(e) => trackClick('hero_feature_card_click', e.currentTarget, {
                  card_title: card.title,
                  card_index: idx,
                  page_section: 'hero'
                })}
                className={`glow-card-${idx} rounded-xl text-white p-4 border border-red-500/20 shadow-lg animate-fade-in-up transition-transform duration-300 ease-in-out hover:scale-105`}
              >
                <div className="z-10 relative">
                  <h3 className="text-lg font-bold text-white/90">{card.title}</h3>
                  <p className="text-sm text-white/70 mt-1">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* <div className="hidden lg:block h-12"></div> */}
      </div>
    </section>
  );
};

export default HeroSection;