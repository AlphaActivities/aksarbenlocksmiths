import React, { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Phone } from "lucide-react";
import { trackClick, trackEvent } from "../utils/analytics";

export default function ServiceAreasPage() {
  const didBlogFx = useRef(false);

  const location = useLocation();

  useLayoutEffect(() => {
    const state = (location?.state || {}) as any;
    if (state?.restorePosition) {
      // Coming back to Home soon, let App.tsx restore. Do nothing here.
    }
    // If returning to Home with restore, let App.tsx handle it
    if (state?.restorePosition) return;
    // Fresh entry to Service Areas, scroll to top. Do NOT clear lastScrollY here.
    // Special entry from Blog with effect requested
    if ((state?.fromBlog || state?.scrollFx === "midThenTop") && !didBlogFx.current) {
      didBlogFx.current = true;

      // Force an instant jump to mid before first paint, then restore smooth and scroll to top
      const root = document.documentElement;
      const prevScrollBehavior = root.style.scrollBehavior;

      // Disable global smooth just for this two step sequence
      root.style.scrollBehavior = "auto";
      try {
        const mid = Math.max(0, Math.round(window.innerHeight * 0.5));
        // Immediate jump to mid, no smooth, no top flash
        window.scrollTo({ top: mid });
      } catch {}

      // Restore any previous scroll behavior and perform the smooth top scroll on next frame
      requestAnimationFrame(() => {
        root.style.scrollBehavior = prevScrollBehavior || "";
        try {
          window.scrollTo({ top: 0, behavior: "smooth" });
        } catch {}
      });
    }
  }, [location]);

  useEffect(() => {
    // Page view for Service Areas dynamic page
    trackEvent("page_view", {
      source_page: "service_areas",
      page_section: "service_areas_page"
    });
  }, []);

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
      source_page: "service_areas",
      page_section: group === "core" ? "main_cities" : "surrounding_communities"
    });
  };


  const title = "Service Areas, Aksarben Locksmiths, Omaha and Nearby Cities";
  const description =
    "Aksarben Locksmiths serves Omaha, the core metro, and surrounding communities with fast, professional mobile locksmith service.";

  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full relative">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href="https://aksarbenlocksmiths.com/service-areas" />

        {/* LocalBusiness + Service JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "@id": "https://aksarbenlocksmiths.com/#localbusiness",
            "name": "Aksarben Locksmiths",
            "url": "https://aksarbenlocksmiths.com",
            "telephone": "+14025566715",
            "image": "https://aksarbenlocksmiths.com/images/services-thumbnails/map-service-area.png",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Omaha",
              "addressRegion": "NE",
              "addressCountry": "US"
            }
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "serviceType": "Locksmith Services",
            "provider": { "@id": "https://aksarbenlocksmiths.com/#localbusiness" },
            "areaServed": [
              { "@type": "City", "name": "Omaha, NE" },
              { "@type": "City", "name": "Bellevue, NE" },
              { "@type": "City", "name": "Papillion, NE" },
              { "@type": "City", "name": "La Vista, NE" },
              { "@type": "City", "name": "Ralston, NE" },
              { "@type": "City", "name": "Council Bluffs, IA" }
            ]
          })}
        </script>

        {/* FAQPage JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Which areas around Omaha do you service?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "We cover Omaha, Bellevue, Papillion, La Vista, Council Bluffs, Gretna, Elkhorn, Bennington, and many other surrounding communities. You can view the full list on this page."
                }
              },
              {
                "@type": "Question",
                "name": "Do you provide locksmith service in Council Bluffs and other Iowa cities?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, we also serve Council Bluffs, Carter Lake, Glenwood, and Crescent in Iowa, in addition to Nebraska cities in the metro area."
                }
              },
              {
                "@type": "Question",
                "name": "Is there an extra fee for service outside of Omaha?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No hidden fees. Pricing is transparent, but arrival times and availability may vary by distance and traffic conditions."
                }
              }
            ]
          })}
        </script>

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Locksmith",
            "name": "Aksarben Locksmiths",
            "url": "https://aksarbenlocksmiths.com/",
            "telephone": "+14025566715",
            "image": "https://aksarbenlocksmiths.com/images/services-thumbnails/map-service-area.png",
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

      <div className="fixed top-0 w-full z-50 bg-black backdrop-blur-md shadow-lg text-sm px-4 py-1 flex justify-between items-center">
        <span className="text-white motion-safe:animate-pulse">24/7 Emergency Service</span>
        <a
          href="tel:+14025566715"
          onClick={(e) =>
            trackClick("header_phone_click", e.currentTarget as HTMLElement, {
              phone_number: "+14025566715",
              source: "service_areas_top_bar",
              page_section: "service_areas",
            })
          }
          aria-label="Call Aksarben Locksmiths emergency line at 402 556 6715"
          className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition motion-safe:animate-pulse focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-black"
        >
          <Phone className="h-4 w-4" />
          (402) 556-6715
        </a>
      </div>

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
      <section id="service-areas" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-16 pb-12">
        <button
          onClick={(e) => {
            const fromBlog = (location?.state as any)?.fromBlog;

            if (fromBlog && typeof window !== "undefined" && window.history.length >= 3) {
              // Return through history to preserve the exact Home scroll naturally
              navigate(-2);
            } else {
              // Fallback, go Home and ask App.tsx to restore from sessionStorage if available
              navigate("/", { state: { restorePosition: true } });
            }

            trackClick("back_to_services", e.currentTarget, {
              source_page: "service_areas",
              page_section: "service_areas_page",
              destination: "/"
            });
          }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[linear-gradient(to_left,_#7f1d1d,_#991b1b,_#ef4444,_#b91c1c,_#991b1b,_#7f1d1d)] bg-[length:800%_100%] animate-[redHeatWave_3s_linear_infinite] text-white text-sm shadow-[0_0_24px_rgba(255,255,255,0.5)] hover:brightness-125 hover:scale-105 transition duration-300 ease-in-out mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Contact Us
        </button>

        {/* Hero card */}
        <div className="bg-gradient-to-br from-[#7b1414] via-[#4e0e2f] to-[#2c0727] bg-opacity-40 backdrop-blur-lg rounded-3xl p-8 border border-white/10 shadow-2xl ring-1 ring-white/20">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Service Areas
          </h1>
          <span className="sr-only">We provide mobile locksmith service across Omaha, Bellevue, Papillion, La Vista, and Council Bluffs.</span>
          <p className="mt-3 text-white/80">
            We come to you across the Omaha metro. Explore the main cities we cover and the surrounding communities we serve every day.
          </p>
        </div>

        {/* Bottom CTA, matches Dynamic Service styling */}
        <div className="flex justify-center mt-10">
          <a
            href="tel:+14025566715"
            onClick={(e) =>
              trackClick("cta_service_areas_call_click", e.currentTarget, {
                source_page: "service_areas",
                page_section: "bottom_cta",
                call_reason: "local_dispatch",
              })
            }
            className="inline-flex items-center gap-2 bg-gradient-to-l from-red-900 via-red-600 to-red-800 text-white py-3 px-6 rounded-full shadow-[0_0_24px_rgba(255,255,255,0.5)] hover:brightness-125 hover:scale-105 transition duration-300 ease-in-out animate-[pulseRedGlow_3s_ease-in-out_infinite] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            aria-label="Call Aksarben Locksmiths"
            title="Call Aksarben Locksmiths"
          >
            <Phone className="h-4 w-4" />
            <span>Call Now</span>
          </a>
        </div>
        {/* Main cities, blue gradient chips */}
        <div className="mt-8 rounded-3xl p-6 backdrop-blur-md border border-white/10 ring-1 ring-blue-400/25 shadow-[0_10px_40px_-10px_rgba(59,130,246,0.35)] bg-[radial-gradient(120%_120%_at_50%_0%,rgba(59,130,246,0.18),rgba(17,24,39,0.2)_70%)]">
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
        <div className="mt-8 rounded-3xl p-6 backdrop-blur-md border border-white/10 ring-1 ring-purple-400/25 shadow-[0_10px_40px_-10px_rgba(147,51,234,0.35)] bg-[radial-gradient(120%_120%_at_50%_0%,rgba(147,51,234,0.15),rgba(17,24,39,0.2)_70%)]">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4" style={{ textShadow: "0 1px 2px rgba(0,0,0,.5)" }}>Surrounding Communities</h2>
          <ul className="flex flex-wrap gap-3">
            {SURROUNDING.map((city) => (
              <li key={city}>
                <button
                  type="button"
                  onClick={onCityClick(city, "surrounding")}
                  className="inline-flex items-center px-4 py-2 rounded-full border border-white/15 bg-gradient-to-br from-purple-500 via-indigo-600 to-violet-700 text-white shadow-lg ring-1 ring-purple-400/30 transition-all hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black/20 [text-shadow:0_0_6px_rgba(255,255,255,0.4)]"
                  aria-label={`City chip, ${city}`}
                >
                  {city}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Crawlable copy block */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-xl px-6 py-5 text-white/90 text-base leading-relaxed shadow-[0_0_24px_rgba(255,255,255,0.5)] max-w-4xl w-full mx-auto mt-8 border border-white/10 ring-1 ring-white/10">
          <h3>Locksmith services available</h3>
          <div className="space-y-3 text-base leading-relaxed text-gray-200">
            <p>
              <strong className="text-white">Locksmith Services Available in Omaha and Nearby Cities</strong>
            </p>
            <p>
              Our team provides <span className="font-medium">residential rekeying, lock replacement, and home security upgrades</span> to keep your property secure.
            </p>
            <p>
              If you are locked out of your vehicle, we offer <span className="font-medium">automotive lockout service, key cutting, and ignition help</span> at your location.
            </p>
            <p>
              Businesses across Omaha rely on us for <span className="font-medium">commercial locksmith solutions</span>, including master key systems and lock repair.
            </p>
            <p>
              Wherever you are in the metro, our <span className="font-medium">mobile locksmith technicians</span> arrive with professional tools and clear pricing.
              <a href="tel:+14025566715" className="underline decoration-dotted hover:no-underline"> Call now</a> for dependable service.
            </p>
          </div>
        </div>

        {/* Hidden FAQ Section (schema remains in <Helmet>, but block invisible) */}
        <div className="hidden">
          <h2>Service Areas FAQ</h2>
          <details>
            <summary>Which areas around Omaha do you service?</summary>
            <p>We cover Omaha, Bellevue, Papillion, La Vista, Council Bluffs, Gretna, Elkhorn, Bennington, and more.</p>
          </details>
          <details>
            <summary>Do you provide locksmith service in Council Bluffs and other Iowa cities?</summary>
            <p>Yes, we also serve Council Bluffs, Carter Lake, Glenwood, and Crescent in Iowa, in addition to Nebraska cities.</p>
          </details>
          <details>
            <summary>Is there an extra fee for service outside of Omaha?</summary>
            <p>No hidden fees. Pricing is transparent, but arrival times and availability may vary by distance and traffic.</p>
          </details>
        </div>
      </section>
      </div>
    </main>
    </div>
  );
}