import React from "react";
import { Helmet } from "react-helmet-async";

export default function ServiceAreasPage() {
  const areas = [
    "Omaha",
    "Bellevue",
    "Papillion",
    "La Vista",
    "Gretna",
    "Elkhorn",
    "Bennington",
    "Ralston",
    "Springfield",
    "Valley",
    "Waterloo",
    "Council Bluffs",
    "Carter Lake"
  ];

  const title = "Service Areas, Aksarben Locksmiths, Omaha and Nearby Cities";
  const description =
    "Aksarben Locksmiths provides residential, automotive, and commercial locksmith services across Omaha and nearby cities, including Bellevue, Papillion, La Vista, Gretna, Elkhorn, and more. Call for fast, professional help.";

  // Build JSON LD objects
  const businessSchema = {
    "@context": "https://schema.org",
    "@type": "Locksmith",
    "name": "Aksarben Locksmiths",
    "url": "https://aksarbenlocksmiths.com/",
    "telephone": "+14025566715",
    "image": "https://aksarbenlocksmiths.com/images/Services%20Thumbnails/map-service-area.png",
    "areaServed": areas.map((city) => ({
      "@type": "City",
      "name": `${city}, NE`
    })),
    "servesCuisine": undefined // keeps JSON stringify clean in some bundlers
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://aksarbenlocksmiths.com/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Service Areas",
        "item": "https://aksarbenlocksmiths.com/service-areas"
      }
    ]
  };

  return (
    <main className="min-h-screen w-full">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href="https://aksarbenlocksmiths.com/service-areas" />
        <script type="application/ld+json">
          {JSON.stringify(businessSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Service Areas
          </h1>
          <p className="mt-3 text-white/80">
            We come to you in Omaha and surrounding communities. Explore our coverage below,
            and if your city is nearby, we probably serve you too.
          </p>
        </header>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">
              Omaha Metro Coverage
            </h2>

            <ul className="flex flex-wrap gap-3">
              {areas.map((city) => (
                <li key={city}>
                  <span
                    className="inline-flex items-center px-4 py-2 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all"
                  >
                    {city}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="prose prose-invert max-w-none">
            <h3>Locksmith services available</h3>
            <p>
              Residential rekey and lock replacement, automotive lockouts and key help,
              and commercial security support. Our mobile technicians bring professional
              tools directly to your location for fast, reliable service.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}