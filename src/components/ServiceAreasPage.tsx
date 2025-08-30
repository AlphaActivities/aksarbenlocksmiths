import React from "react";
import { Helmet } from "react-helmet-async";
import { AreasSection } from "./AreasSection";

export default function ServiceAreasPage() {
  // dummy anchor to satisfy AreasSection prop, we do not scroll on this page
  const stubRef = React.useRef<HTMLDivElement>(null);

  const title = "Service Areas, Aksarben Locksmiths, Omaha and Nearby Cities";
  const description =
    "Aksarben Locksmiths serves Omaha and nearby communities. Explore our full coverage across the metro and call for fast, professional service.";

  return (
    <main className="min-h-screen w-full bg-black">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href="https://aksarbenlocksmiths.com/service-areas" />
      </Helmet>

      {/* Reuse the exact styled section you already have */}
      <AreasSection pricesRef={stubRef} />
      <div ref={stubRef} />
    </main>
  );
}