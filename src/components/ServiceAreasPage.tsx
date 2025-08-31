import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { trackClick } from "../utils/analytics";

export default function ServiceAreasPage() {

  const location = useLocation();

  useEffect(() => {
    const state = location?.state as any;
    if (state?.restorePosition) {
      // Coming back to Home soon, let App.tsx restore. Do nothing here.
      return;
    }
    // Fresh entry to Service Areas, scroll to top. Do NOT clear lastScrollY here.
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location]);

  const CORE_CITIES = [
    "Omaha", "Ralston", "Papillion", "La Vista", "Council Bluffs", "Bellevue"
  ];

  const ALL_CITIES = [
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
  ];

  const SURROUNDING = ALL_CITIES.filter((c) => !CORE_CITIES.includes(c));

  const CITY_STATE: Record<string, "NE" | "IA"> = {
    "Council Bluffs": "IA",
    "Carter Lake": "IA",
    "Glenwood": "IA",
    "Crescent": "IA"
  };

  const onCityClick = (city: string, group: "core" | "surrounding") => (e: React.MouseEvent) => {
    trackClick("city_chip_click", e.currentTarget, {
      city,
      group,
      source_page: "service_areas"
    });
  };


  const title = "Service Areas, Aksarben Locksmiths, Omaha and Nearby Cities";
  const description =
    "Aksarben Locksmiths serves Omaha, the core metro, and surrounding communities with fast, professional mobile locksmith service.";

  const navigate = useNavigate();

  return (
    <main className="min-h-screen w-full relative">
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

      <main className="min-h-screen w-full relative overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        poster="/images/Services Thumbnails/Residential-Service-Photo.webp"
        className="fixed inset-0 w-full h-full object-cover opacity-45 z-0"
        src="/videos/wallpaper.mp4"
      />

      {/* Footer-style animated background layers */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="animated-footer-bg" />
        <div className="footer-glass-effect absolute inset-0" />
      </div>

      {/* Contrast overlay, adjust opacity as needed */}
      <div className="absolute inset-0 z-[3] pointer-events-none bg-black/25 md:bg-black/10"></div>

      <div className="relative z-10 text-white">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={(e) => {
            navigate("/", { state: { restorePosition: true } });
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
          <h2 className="text-xl sm:text-2xl font-semibold mb-4" style={{ textShadow: "0 1px 2px rgba(0,0,0,.5)" }}>Main Cities We Cover</h2>
          <ul className="flex flex-wrap gap-3">
            {CORE_CITIES.map((city) => (
              <li key={city}>
                <button
                  type="button"
                  onClick={onCityClick(city, "core")}
                  className="inline-flex items-center px-4 py-2 rounded-full border border-white/15 bg-gradient-to-br from-blue-500 via-blue-600 to-teal-500 text-white drop-shadow-glow ring-1 ring-blue-400/30 transition-all hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black/20 [text-shadow:0_0_6px_rgba(255,255,255,0.4)]"
                  aria-label={`City chip, ${city}`}
                >
                  {city}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Surrounding communities, subtle chips */}
        <div className="mt-8 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 shadow-2xl ring-1 ring-white/10">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4" style={{ textShadow: "0 1px 2px rgba(0,0,0,.5)" }}>Surrounding Communities</h2>
          <ul className="flex flex-wrap gap-3">
            {SURROUNDING.map((city) => (
              <li key={city}>
                <button
                  type="button"
                  onClick={onCityClick(city, "surrounding")}
                  className="inline-flex items-center px-4 py-2 rounded-full border border-blue-300/30 text-white bg-blue-500/10 sm:bg-blue-500/5 hover:bg-blue-500/10 transition-all hover:scale-105 drop-shadow ring-1 ring-blue-400/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black/20 [text-shadow:0_0_6px_rgba(255,255,255,0.4)]"
                  aria-label={`City chip, ${city}`}
                >
                  {city}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Crawlable copy block */}
        <div className="mt-8 prose prose-invert max-w-none prose-headings:text-white prose-p:text-white/90">
          <h3>Locksmith services available</h3>
          <p>
            Residential rekey and lock replacement, automotive lockouts and key help,
            and commercial security support. Our mobile technicians bring professional
            tools directly to your location for fast, reliable service.
          </p>
        </div>
      </section>
      </div>
    </main>
    </main>
  );
}