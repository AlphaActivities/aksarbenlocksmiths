import React from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { trackClick } from "../utils/analytics";

export default function ServiceAreasPage() {
  // Full list mirrored from your original AreasSection.tsx
  const ALL_CITIES = [
    "Omaha", "Bellevue", "Papillion", "La Vista", "Ralston", "Elkhorn",
    "Bennington", "Millard", "Gretna", "Springfield", "Ashland", "Wahoo",
    "Blair", "Fremont", "Valley", "Waterloo", "Carter Lake", "Council Bluffs",
    "Fort Calhoun", "Louisville"
  ];

  // Six core cities highlighted in the original build
  const CORE_CITIES = [
    "Omaha", "Ralston", "Papillion", "La Vista", "Council Bluffs", "Bellevue"
  ];


    // Nebraska
    "Omaha",
    "Bellevue",
    "Papillion",
    "La Vista",
    "Ralston",
    "Gretna",
    "Elkhorn",
    "Bennington",
    "Boys Town",
    "Springfield",
    "Valley",
    "Waterloo",
    "Fort Calhoun",
    "Blair",
    "Fremont",
    "Ashland",
    "Plattsmouth",
    "Offutt AFB",
    "Chalco",
    // Iowa
    "Council Bluffs",
    "Carter Lake",
    "Crescent",
    "Glenwood"

  const title = "Service Areas, Aksarben Locksmiths, Omaha and Nearby Cities";
  const description =
    "Aksarben Locksmiths serves Omaha, the core metro, and surrounding communities with fast, professional mobile locksmith service.";

  const navigate = useNavigate();

  return (
    <main className="min-h-screen w-full relative bg-black">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href="https://aksarbenlocksmiths.com/service-areas" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Locksmith",
            "name": "Aksarben Locksmiths",
            "url": "https://aksarbenlocksmiths.com/",
            "telephone": "+14025566715",
            "image": "https://aksarbenlocksmiths.com/images/Services%20Thumbnails/map-service-area.png",
            "areaServed": ALL_CITIES.map((city) => ({
              "@type": "City",
              "name": `${city}, ${CITY_STATE[city] ?? "NE"}`
            }))
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://aksarbenlocksmiths.com/" },
              { "@type": "ListItem", "position": 2, "name": "Service Areas", "item": "https://aksarbenlocksmiths.com/service-areas" }
            ]
          })}
        </script>
      </Helmet>

      {/* Animated wallpaper, same vibe as AreasSection */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-black opacity-80" />
        <div className="absolute inset-0 animate-diagonal-stripes opacity-75 mix-blend-lighten" />
      </div>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={(e) => {
            navigate("/", { state: { scrollTo: "services", restorePosition: true } });
            trackClick("back_to_services", e.currentTarget, {
              source_page: "service_areas",
              page_section: "service_areas_page"
            });
          }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[linear-gradient(to_left,_#7f1d1d,_#991b1b,_#ef4444,_#b91c1c,_#991b1b,_#7f1d1d)] bg-[length:800%_100%] animate-[redHeatWave_3s_linear_infinite] text-white text-sm shadow-[0_0_24px_rgba(255,255,255,0.5)] hover:brightness-125 hover:scale-105 transition duration-300 ease-in-out mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Services
        </button>

        {/* Hero card */}
        <div className="bg-gradient-to-br from-[#7b1414] via-[#4e0e2f] to-[#2c0727] bg-opacity-40 backdrop-blur-lg rounded-3xl p-8 border border-white/10 shadow-2xl ring-1 ring-white/20">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Service Areas
          </h1>
          <p className="mt-3 text-white/80">
            We come to you across the Omaha metro. Explore the main cities we cover and the surrounding communities we serve every day.
          </p>
        </div>

        {/* Main cities, blue gradient chips */}
        <div className="mt-8 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 shadow-2xl ring-1 ring-white/10">
          <h2 className="text-xl font-semibold mb-4">Main Cities We Cover</h2>
          <ul className="flex flex-wrap gap-3">
            {CORE_CITIES.map((city) => (
              <li key={city}>
                <span className="inline-flex items-center px-4 py-2 rounded-full border border-white/15 bg-gradient-to-br from-blue-500 via-blue-600 to-teal-500 text-white drop-shadow-glow ring-1 ring-blue-400/30 transition-all hover:scale-105">
                  {city}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Surrounding communities, subtle chips */}
        <div className="mt-8 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 shadow-2xl ring-1 ring-white/10">
          <h2 className="text-xl font-semibold mb-4">Surrounding Communities</h2>
          <ul className="flex flex-wrap gap-3">
            {SURROUNDING.map((city) => (
              <li key={city}>
                <span className="inline-flex items-center px-4 py-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 transition-all">
                  {city}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Crawlable copy block */}
        <div className="mt-8 prose prose-invert max-w-none">
          <h3>Locksmith services available</h3>
          <p>
            Residential rekey and lock replacement, automotive lockouts and key help,
            and commercial security support. Our mobile technicians bring professional
            tools directly to your location for fast, reliable service.
          </p>
        </div>
      </section>
    </main>
  );
}