import React from "react";
import { Link } from "react-router-dom";
import { trackClick } from "../utils/analytics";

type State = { hasError: boolean; message?: string };

export default class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, message: error instanceof Error ? error.message : String(error) };
  }

  componentDidCatch(error: unknown, info: unknown) {
    // optional: console.warn or add tracking here if desired
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="relative min-h-screen w-full grid place-items-center text-white px-6 overflow-hidden">
        {/* Background layers, non-interactive */}
        <div className="animated-footer-bg absolute inset-0 pointer-events-none" />
        <div className="footer-glass-effect absolute inset-0 pointer-events-none" />

        {/* Foreground content */}
        <div className="relative max-w-xl text-center">
          <h1 className="text-2xl md:text-3xl font-semibold mb-2">Something went wrong</h1>
          <p className="text-gray-300 mb-6">{this.state.message || "An unexpected error occurred."}</p>
          <div className="flex items-center justify-center gap-3">

            {/* Refresh button, label update */}
            <button
              onClick={(e) => {
                trackClick("error_boundary_refresh_click", e.currentTarget as unknown as HTMLElement, {
                  source_page: "error_boundary",
                  page_section: "body",
                });
                window.location.reload();
              }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[linear-gradient(to_left,_#7f1d1d,_#991b1b,_#ef4444,_#b91c1c,_#991b1b,_#7f1d1d)] bg-[length:800%_100%] animate-[redHeatWave_3s_linear_infinite] text-white text-sm shadow-[0_0_24px_rgba(255,255,255,0.5)] hover:brightness-125 hover:scale-105 transition duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              aria-label="Refresh"
              title="Refresh"
            >
              Refresh
            </button>

            {/* Home button, make it guaranteed-navigate */}
            <Link
              to="/"
              onClick={(e) => {
                trackClick("error_boundary_home_click", e.currentTarget as unknown as HTMLElement, {
                  source_page: "error_boundary",
                  page_section: "body",
                  destination: "/",
                });
                // Hard fallback to ensure we always leave the boundary
                setTimeout(() => { window.location.href = "/"; }, 0);
              }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#2a1645] hover:bg-[#4a2974] border border-[#3a1f5c] text-white text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              aria-label="Go to Home"
              title="Go to Home"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    );
  }
}