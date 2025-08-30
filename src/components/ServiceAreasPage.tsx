import React from "react";
import { Helmet } from "react-helmet-async";

export default function ServiceAreasPage() {
  // Source of truth mirrored from AreasSection.tsx
  const ALL_CITIES = [
    "Omaha", "Bellevue", "Papillion", "La Vista", "Ralston", "Elkhorn",
    "Bennington", "Millard", "Gretna", "Springfield", "Ashland", "Wahoo",
    "Blair", "Fremont", "Valley", "Waterloo", "Carter Lake", "Council Bluffs",
    "Fort Calhoun", "Louisville"
  ];

  // Main cities highlighted in AreasSection.tsx
  const CORE_CITIES = [
    "Omaha", "Ralston", "Papillion", "La Vista", "Council Bluffs", "Bellevue"
  ];

  const SURROUNDING = ALL_CITIES.filter(c => !CORE_CITIES.includes(c));

  const title = "Service Areas, Aksarben Locksmiths, Omaha and Nearby Cities";
  const description =
    "Aksarben Locksmiths serves Omaha, the core metro, and surrounding communities with fast, professional mobile locksmith service.";

  return (
    <main className="min-h-screen w-full">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href="https://aksarbenlocksmiths.com/service-areas" />
      </Helmet>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero card */}
        <div className="bg-gradient-to-br from-[#7b1414] via-[#4e0e2f] to-[#2c0727] bg-opacity-40 backdrop-blur-lg rounded-3xl p-8 border border-white/10 shadow-2xl ring-1 ring-white/20 transition-all duration-500 hover:scale-[1.01] hover:shadow-3xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Service Areas
          </h1>
          <p className="mt-3 text-white/80">
            We come to you across the Omaha metro. Explore the main cities we cover and the surrounding communities we serve every day.
          </p>
        </div>

        {/* Main cities section */}
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

        {/* Surrounding communities section */}
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

        {/* Service summary copy, crawlable */}
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