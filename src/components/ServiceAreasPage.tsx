import React from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { trackClick } from "../utils/analytics";

export default function ServiceAreasPage() {
  const navigate = useNavigate();

  const mainAreas = [
    "Omaha",
    "Bellevue",
    "Papillion",
    "La Vista",
    "Gretna",
    "Elkhorn",
    "Bennington",
    "Ralston",
    "Waterloo",
    "Springfield",
    "Ashland",
    "Blair",
    "Plattsmouth",
    "Council Bluffs",
    "Carter Lake",
    "Offutt AFB"
  ];

  const otherAreas = [
    "Valley","Boys Town","Chalco","Fort Calhoun","Arlington","Yutan","Mead","Wahoo",
    "Louisville","Weeping Water","Cedar Creek","Eagle","Murray","Union","Greenwood",
    "South Bend","Elmwood","Nehawka","Kennard","Herman","Cedar Bluffs",
    "Crescent","Underwood","Treynor","Neola","Avoca","Walnut","Carson","Oakland",
    "Minden","Macedonia","Hancock","Silver City","Mineola","Pacific Junction",
    "Glenwood","Missouri Valley","Woodbine"
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Aksarben Locksmiths",
    "url": "https://aksarbenlocksmiths.com/service-areas",
    "image": "https://aksarbenlocksmiths.com/images/logo.png",
    "telephone": "+1-402-556-6715",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Omaha",
      "addressRegion": "NE",
      "addressCountry": "US"
    },
    "areaServed": [...mainAreas, ...otherAreas].map(name => ({ "@type": "City", name }))
  };

  return (
    <div className="relative min-h-screen text-white">
      <Helmet>
        <title>Locksmith Service Areas in the Omaha Metro | Aksarben Locksmiths</title>
        <meta
          name="description"
          content="Aksarben Locksmiths provides professional mobile locksmith service throughout Omaha and the surrounding metro communities in Nebraska and Iowa."
        />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* looping video background to match DynamicServicePage */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="fixed inset-0 w-full h-full object-cover opacity-45 z-0"
        src="/videos/wallpaper.mp4"
      />

      {/* page shell, mirror DynamicServicePage tokens */}
      <div className="relative z-10 min-h-screen bg-gradient-to-br backdrop-blur-sm px-6 py-12 pt-16">
        <button
          onClick={(e) => {
            navigate("/", { state: { restorePosition: true } });
            trackClick("back_to_home", e.currentTarget, {
              from_page: "service_areas",
              page_section: "service_areas_page"
            });
          }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[linear-gradient(to_left,_#7f1d1d,_#991b1b,_#ef4444,_#b91c1c,_#991b1b,_#7f1d1d)] bg-[length:800%_100%] animate-[redHeatWave_3s_linear_infinite] text-white text-sm shadow-[0_0_24px_rgba(255,255,255,0.5)] hover:brightness-125 hover:scale-105 transition duration-300 ease-in-out mb-6"
          aria-label="Back to Home"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <div className="flex justify-center mb-8">
          <div className="inline-block px-6 py-3 rounded-xl backdrop-blur-sm border border-white/10 shadow-lg">
            <h1 className="text-white text-3xl sm:text-4xl font-extrabold tracking-wide text-center">
              Locksmith Service Areas in the Omaha Metro
            </h1>
          </div>
        </div>

        <p className="text-white/90 text-lg text-center mb-10">
          We provide professional mobile locksmith service across Omaha and nearby communities. Response times vary by distance and traffic.
        </p>

        {/* Main Areas */}
        <div className="mb-12">
          <h2 className="text-white text-2xl font-bold mb-4 text-center">Main Areas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mainAreas.map(area => (
              <a
                key={area}
                id={area.toLowerCase().replace(/\s+/g, "-")}
                href={"#"+area.toLowerCase().replace(/\s+/g, "-")}
                className="block rounded-lg border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition"
              >
                <span className="font-semibold">{area}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Surrounding Communities */}
        <div>
          <h2 className="text-white text-2xl font-bold mb-4 text-center">Surrounding Communities</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {otherAreas.map(area => (
              <a
                key={area}
                id={area.toLowerCase().replace(/\s+/g, "-")}
                href={"#"+area.toLowerCase().replace(/\s+/g, "-")}
                className="block rounded-lg border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition"
              >
                <span className="font-semibold">{area}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}