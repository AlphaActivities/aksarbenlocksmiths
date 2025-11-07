import React from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { trackClick, trackEvent } from "../utils/analytics";

export default function NotFound() {
  useEffect(() => {
    trackEvent("error_page_view", {
      page_path: window.location.pathname,
      referrer: document.referrer || "",
      attempted_url: window.location.href,
      page_type: "error_404",
    });
  }, []);

  return (
    <div className="min-h-screen w-full relative overflow-hidden text-white">
      <Helmet>
        <title>Page not found | Aksarben Locksmiths</title>
        <meta name="robots" content="noindex" />
        <link rel="canonical" href="https://aksarbenlocksmiths.com/404" />
      </Helmet>
      
      <div className="fixed inset-0 -z-10 opacity-40">
        <video
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          className="w-full h-full object-cover"
          src="/videos/wallpaper.mp4"
        />
      </div>

      <main id="main-content" className="mx-auto max-w-3xl px-6 pt-24 pb-16 text-center">
        <h1 className="text-3xl md:text-4xl font-semibold mb-3">Page not found</h1>
        <p className="text-gray-300 mb-8">The page you are looking for does not exist.</p>
        <div className="space-y-4">
          <Link
            to="/#services"
            onClick={(e) =>
              trackClick("cta_back_to_services", e.currentTarget as unknown as HTMLElement, {
                source_page: "404",
                page_section: "not_found",
                destination: "/#services",
              })
            }
            className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-blue-600 text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
            aria-label="Back to Services"
            title="Back to Services"
          >
            Back to Services
          </Link>
          <Link
            to="/"
            onClick={(e) =>
              trackClick("not_found_nav_home_click", e.currentTarget as unknown as HTMLElement, {
                source_page: "not_found",
                page_section: "body",
                destination: "/",
              })
            }
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[linear-gradient(to_left,_#7f1d1d,_#991b1b,_#ef4444,_#b91c1c,_#991b1b,_#7f1d1d)] bg-[length:800%_100%] motion-safe:animate-[redHeatWave_3s_linear_infinite] text-white text-sm shadow-[0_0_24px_rgba(255,255,255,0.5)] hover:brightness-125 hover:scale-105 transition duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black ml-4"
            aria-label="Go to Home"
            title="Go to Home"
          >
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}