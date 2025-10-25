import React from "react";
import { Helmet } from "react-helmet-async";

const ORIGIN = typeof window !== "undefined" ? window.location.origin : "https://aksarbenlocksmiths.com";
const VIDEO_URL = `${ORIGIN}/videos/wallpaper.mp4`;
const THUMB_URL = `${ORIGIN}/images/og/home-1200x630.webp`;
const EMBED_URL = `${ORIGIN}/`;

export default function GlobalVideoSchema() {
  const json = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": "Aksarben Locksmiths — On-Site Locksmith Service",
    "description": "Fast, mobile locksmith service for Omaha and nearby areas. Rekeys, extractions, duplication and more — we come to you.",
    "thumbnailUrl": THUMB_URL,
    "uploadDate": "2025-04-03",
    "contentUrl": VIDEO_URL,
    "embedUrl": EMBED_URL,
    "publisher": {
      "@type": "Organization",
      "name": "Aksarben Locksmiths LLC",
      "logo": {
        "@type": "ImageObject",
        "url": `${ORIGIN}/images/logo.png`
      }
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(json)}</script>
    </Helmet>
  );
}
