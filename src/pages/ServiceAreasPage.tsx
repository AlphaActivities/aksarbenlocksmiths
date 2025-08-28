import React from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { trackClick } from "../utils/analytics";

export default function ServiceAreasPage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!location?.state?.restorePosition) {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, []); // run once on mount
  const location = useLocation();

  useEffect(() => {
    if (location?.state?.openAtTop && !location?.state?.restorePosition) {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [location]);

  const mainAreas = [
    "Boca Raton",
    "Delray Beach",
    "Boynton Beach",
    "Highland Beach",
    "Gulf Stream",
    "Manalapan",
    "Ocean Ridge",
    "Briny Breezes",
    "Lantana",
    "Lake Worth Beach",
    "Atlantis",
    "Hypoluxo",
    "Juno Beach",
    "North Palm Beach",
    "Palm Beach Gardens",
    "Jupiter",
    "Tequesta",
    "Palm Beach Shores",
    "Riviera Beach",
    "Singer Island",
    "West Palm Beach",
    "Palm Beach",
    "South Palm Beach",
    "Manalapan",
    "Ocean Ridge",
    "Briny Breezes"
  ];

  const otherAreas = [
    "Coconut Creek",
    "Coral Springs",
    "Deerfield Beach",
    "Lighthouse Point",
    "Pompano Beach",
    "Fort Lauderdale",
    "Lauderdale-by-the-Sea",
    "Oakland Park",
    "Wilton Manors",
    "Parkland",
    "Margate",
    "Tamarac",
    "North Lauderdale",
    "Lauderhill",
    "Sunrise",
    "Plantation",
    "Davie",
    "Cooper City",
    "Southwest Ranches",
    "Weston",
    "Pembroke Pines",
    "Miramar",
    "Hollywood",
    "Hallandale Beach",
    "Aventura",
    "Sunny Isles Beach",
    "North Miami Beach",
    "Bal Harbour",
    "Bay Harbor Islands",
    "Surfside",
    "Miami Beach",
    "Miami",
    "Coral Gables",
    "Pinecrest",
    "Palmetto Bay",
    "Cutler Bay",
    "Homestead",
    "Florida City"
  ];

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <Helmet>
        <title>Service Areas - South Florida Pressure Washing</title>
        <meta name="description" content="We provide professional pressure washing services throughout South Florida, including Boca Raton, Delray Beach, Boynton Beach, and surrounding communities." />
      </Helmet>

      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="fixed inset-0 w-full h-full object-cover opacity-45 z-0"
        src="/videos/wallpaper.mp4"
      />
      <div className="animated-footer-bg" />
      <div className="footer-glass-effect" />
      <div className="animated-footer-bg" />
      <div className="footer-glass-effect" />

      {/* page shell, mirror DynamicServicePage tokens */}
      <div className="relative z-10 min-h-screen px-6 py-12 pt-16">
        <button
          onClick={() => {
            trackClick("service_areas_back_button");
            navigate(-1);
          }}
          className="mb-8 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <h1 className="text-4xl font-bold mb-4 text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Service Areas
        </h1>
        
        <p className="text-white/80 text-center mb-8 max-w-2xl mx-auto">
          We proudly serve South Florida with professional pressure washing services. 
          From residential driveways to commercial properties, we cover all major areas 
          and surrounding communities.
        </p>

        {/* Main Areas */}
        <section className="mb-12 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 sm:p-6">
          <h2 className="text-white text-2xl font-bold mb-4 text-center">Main Areas</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {mainAreas.map(area => (
                className="rounded-full px-4 py-2 bg-white/10 border border-white/20 backdrop-blur-sm hover:bg-white/15 hover:scale-105 transition-all text-sm font-medium"
              >
                {area}
              </span>
            ))}
          </div>
        </section>

        {/* Surrounding Communities */}
        <section className="mb-12 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 sm:p-6">
          <h2 className="text-white text-2xl font-bold mb-4 text-center">Surrounding Communities</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {otherAreas.map(area => (
              <span
                key={area}
                {area}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}