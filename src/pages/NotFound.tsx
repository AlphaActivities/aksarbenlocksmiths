import React from "react";
import { Link } from "react-router-dom";
import { trackClick } from "../utils/analytics";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full relative overflow-hidden text-white">
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

      <div className="mx-auto max-w-3xl px-6 pt-24 pb-16 text-center">
        <h1 className="text-3xl md:text-4xl font-semibold mb-3">Page not found</h1>
        <p className="text-gray-300 mb-8">The page you are looking for does not exist.</p>
        <Link
          to="/"
          onClick={(e) =>
            trackClick("not_found_nav_home_click", e.currentTarget as unknown as HTMLElement, {
              source_page: "not_found",
              page_section: "body",
              destination: "/",
            })
          }
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[linear-gradient(to_left,_#7f1d1d,_#991b1b,_#ef4444,_#b91c1c,_#991b1b,_#7f1d1d)] bg-[length:800%_100%] animate-[redHeatWave_3s_linear_infinite] text-white text-sm shadow-[0_0_24px_rgba(255,255,255,0.5)] hover:brightness-125 hover:scale-105 transition duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          aria-label="Go to Home"
          title="Go to Home"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}