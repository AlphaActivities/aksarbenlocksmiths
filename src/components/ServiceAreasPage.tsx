import React from "react";
import { Helmet } from "react-helmet-async";

export default function ServiceAreasPage() {
  // Omaha metro, Nebraska and nearby Iowa
  const areas = [
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

  const title = "Service Areas, Aksarben Locksmiths, Omaha and Nearby Cities";
  const description =
    "Aksarben Locksmiths serves Omaha and the surrounding metro, including Bellevue, Papillion, La Vista, Gretna, Elkhorn, Council Bluffs, and more. Residential, automotive, and commercial service that comes to you.";

  return (
    <main className="min-h-screen w-full">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href="https://aksarbenlocksmiths.com/service-areas" />
      </Helmet>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero card, branded look */}
        <div className="bg-gradient-to-br from-[#7b1414] via-[#4e0e2f] to-[#2c0727] bg-opacity-40 backdrop-blur-lg rounded-3xl p-8 border border-white/10 shadow-2xl ring-1 ring-white/20 transition-all duration-500 hover:scale-[1.01] hover:shadow-3xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Service Areas
          </h1>
          <p className="mt-3 text-white/80">
            We come to you across the Omaha metro. If your city is nearby, we probably serve you too.
          </p>
        </div>

        {/* Chips card */}
        <div className="mt-8 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 shadow-2xl ring-1 ring-white/10">
          <h2 className="text-xl font-semibold mb-4">Omaha Metro Coverage</h2>
          <ul className="flex flex-wrap gap-3">
            {areas.map((city) => (
              <li key={city}>
                <span className="inline-flex items-center px-4 py-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 transition-all">
                  {city}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Copy block, same vibe as other sections */}
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