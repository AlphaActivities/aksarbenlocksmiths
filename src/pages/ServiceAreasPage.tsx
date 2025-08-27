import React from "react";
import { Helmet } from "react-helmet-async";

export default function ServiceAreasPage() {
  // Tier 1, Main Areas, as requested
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

  // Tier 2, Surrounding Communities, expanded research set
  const otherAreas = [
    // Nebraska, Douglas, Sarpy, Cass, Washington, Saunders
    "Valley",
    "Boys Town",
    "Chalco",
    "Fort Calhoun",
    "Arlington",
    "Yutan",
    "Mead",
    "Wahoo",
    "Louisville",
    "Weeping Water",
    "Cedar Creek",
    "Eagle",
    "Murray",
    "Union",
    "Greenwood",
    "South Bend",
    "Elmwood",
    "Nehawka",
    "Kennard",
    "Herman",
    "Cedar Bluffs",
    // Iowa, Pottawattamie, Mills, Harrison
    "Crescent",
    "Underwood",
    "Treynor",
    "Neola",
    "Avoca",
    "Walnut",
    "Carson",
    "Oakland",
    "Minden",
    "Macedonia",
    "Hancock",
    "Silver City",
    "Mineola",
    "Pacific Junction",
    "Glenwood",
    "Missouri Valley",
    "Woodbine"
  ];

  // Structured data, include both tiers in areaServed
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

  // Replace the outer wrappers below with your actual DynamicServicePage shell if diagnostics return a shared component
  return (
    <div className="relative min-h-screen overflow-hidden">
      <Helmet>
        <title>Locksmith Service Areas in the Omaha Metro | Aksarben Locksmiths</title>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <meta name="description" content="Aksarben Locksmiths provides professional mobile locksmith service throughout Omaha and the surrounding metro communities in Nebraska and Iowa." />
      </Helmet>

      {/* Black Top Bar */}
      <div className="fixed top-0 w-full z-50 bg-black backdrop-blur-md shadow-lg text-sm px-4 py-1 flex justify-between items-center">
        <span className="text-white animate-pulse">24/7 Emergency Service</span>
        <a
          href="tel:+14025566715"
          className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition animate-pulse"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          (402) 556-6715
        </a>
      </div>

      <video
        autoPlay
        muted
        loop
        playsInline
        className="fixed inset-0 w-full h-full object-cover opacity-45 z-0"
        src="/videos/wallpaper.mp4"
      />
      
      <div className="relative z-10 min-h-screen bg-gradient-to-br from-blue-900/80 via-indigo-800/80 to-purple-900/80 backdrop-blur-sm px-6 py-12 pt-16 text-white">
        <section id="service-areas" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex justify-center mb-8">
            <div className="inline-block px-6 py-3 rounded-xl bg-black/60 backdrop-blur-sm border border-white/10 shadow-lg flex items-center justify-center">
              <h1 className="text-white text-3xl sm:text-4xl font-extrabold tracking-wide text-center">
                Locksmith Service Areas in the Omaha Metro
              </h1>
            </div>
          </div>

          <p className="text-white/90 text-lg text-center mb-10">
            We provide professional mobile locksmith service across Omaha and nearby communities. Response times vary by distance and traffic.
          </p>

          {/* Main Areas */}
          <div className="mb-10">
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
        </section>
      </div>
    </div>
  );
}