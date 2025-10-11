import React from "react";
import { Outlet } from "react-router-dom";
import GlobalBackgroundVideo from "../components/GlobalBackgroundVideo";
import RouteTransitionMask from "../components/RouteTransitionMask";

/**
 * MinimalShell keeps ONLY the background video and the tiny transition mask alive.
 * Navbar and Footer remain page-level (homepage only).
 */
export default function MinimalShell() {
  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      <GlobalBackgroundVideo />
      <RouteTransitionMask />

      <main id="main-content" className="relative z-10">
        <Outlet />
      </main>
    </div>
  );
}
