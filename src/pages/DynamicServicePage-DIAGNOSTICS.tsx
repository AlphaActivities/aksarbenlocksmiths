/**
 * PHASE 8 DIAGNOSTICS — Service Page Scroll Race Condition Analysis
 *
 * This is a diagnostic version of DynamicServicePage.tsx with extensive logging
 * to identify the runtime race causing opposite scroll behavior between:
 * - Desktop: slam to TOP
 * - Mobile: TOP→BOTTOM motion
 *
 * DO NOT DEPLOY THIS FILE — FOR DIAGNOSTICS ONLY
 *
 * To use:
 * 1. Temporarily rename DynamicServicePage.tsx → DynamicServicePage.tsx.backup
 * 2. Rename this file → DynamicServicePage.tsx
 * 3. Run dev server and navigate Search → Service
 * 4. Open browser console
 * 5. Copy all logs starting with [PHASE8]
 * 6. Restore original files
 */

import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import React, { useEffect, useState, useRef } from "react";
import { ArrowLeft, Phone, MapPin } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { trackVideoEvent, trackClick, buildEventName } from "../utils/analytics";
import { SERVICE_FAQS } from "../data/service-faqs";
import servicesData from "../data/services.json";

const allServices = servicesData.services;

// Diagnostic counter
let renderCount = 0;
let effectRunCount = 0;

const SERVICE_META: Record<string, { title: string; metaDescription: string; description: string; serviceType: string; }> = {
  residential: {
    title: "Residential Lockouts in Omaha, 24/7 | Aksarben Locksmiths",
    metaDescription: "Locked out of your house or need your home locks rekeyed? Fast, damage-free entry and professional rekeying trusted across Omaha.",
    serviceType: "Residential Lockouts",
    description: "Locked out of your house or need your home locks rekeyed? Our residential locksmith services keep your family safe and secure.\n\nWe handle fast, damage-free lockouts, rekeying for new homeowners or tenants, and upgrading your hardware to high-security locks.\n\nOne call gets you a mobile locksmith at your door ready to restore access, match multiple locks to one key, or advise on affordable security improvements.\n\nOur team is trusted across Omaha for clear pricing, dependable service, and professional workmanship."
  },
  automotive: {
    title: "Automotive Lockouts & Car Key Help | Aksarben Locksmiths Omaha",
    metaDescription: "Quick, non-destructive car entry plus key cutting and transponder/fob programming for most makes and models.",
    serviceType: "Automotive Lockouts",
    description: "Car lockouts and key problems can happen anytime, anywhere. Our automotive locksmiths provide quick, non-destructive vehicle entry so you can get back on the road.\n\nWe cut and program car keys, fobs, and transponders on-site for most makes and models, even if you've lost all keys.\n\nWhether you're locked out, have a broken key in the ignition, or need a spare remote, our mobile team arrives with the tools to solve the problem right away.\n\nDrivers across Omaha count on us for speed, skill, and fair prices."
  },
  extraction: {
    title: "Broken Key Extraction, Fast & Careful | Aksarben Locksmiths",
    metaDescription: "Professional broken key extraction for doors and ignitions, plus on-site key replacement to restore full function.",
    serviceType: "Broken Key Extraction",
    description: "Snapped a key inside your lock or ignition? Don't risk damage with DIY tricks. Our locksmiths specialize in careful broken key extraction using professional tools that protect your hardware.\n\nOnce the fragment is removed, we cut and test a replacement key on-site to restore full use of your lock or ignition.\n\nBroken keys are stressful, but we make the process fast and straightforward.\n\nFrom house doors to commercial locks and car ignitions, our extraction service saves time, money, and avoids costly repairs."
  },
  duplication: {
    title: "Key Duplication, High-Security & Transponder | Aksarben Locksmiths",
    metaDescription: "Precise key duplication for home, office, and vehicle keys, including high-security and modern transponders.",
    serviceType: "Key Duplication",
    description: "Need a spare key that works the first time? Our locksmiths provide accurate key duplication for homes, offices, and vehicles, including high-security keys and modern transponders.\n\nEvery duplicate is cut and tested to ensure smooth operation.\n\nWe also offer restricted key systems for businesses that require extra security and control.\n\nHaving a spare on hand saves stress during lockouts, and our mobile locksmiths can duplicate keys on-site when it's most convenient.\n\nTrust us for reliable key duplication done right."
  },
  rekeying: {
    title: "Lock Rekeying, Same-Day Service | Aksarben Locksmiths Omaha",
    metaDescription: "Change who has access without replacing hardware. Key-alike options and fast turnaround for homes and businesses.",
    serviceType: "Lock Rekeying",
    description: "Rekeying is the smart way to change access without replacing your entire lock. Whether you've moved into a new property, lost a key, or need to restrict former access, our locksmiths re-pin your cylinders to work with new keys.\n\nWe can also key-alike multiple locks so one key controls your whole home or office.\n\nThis service is quick, affordable, and boosts peace of mind.\n\nOmaha residents and businesses rely on our rekeying to keep their spaces secure while avoiding the cost of new hardware."
  },
  consultation: {
    title: "Security Consultation for Homes & Businesses | Aksarben Locksmiths",
    metaDescription: "Professional lock and door hardware assessment with clear, cost-effective upgrade recommendations.",
    serviceType: "Security Consultation",
    description: "Every property has unique security needs. Our consultation service gives you professional locksmith advice tailored to your home or business.\n\nWe assess your doors, locks, and entry points, then recommend upgrades such as high-security cylinders, master key systems, or keyless entry options.\n\nConsultations ensure you make smart, cost-effective improvements with a clear plan.\n\nFrom residential safety upgrades to commercial access control, our locksmith experts provide honest guidance backed by years of hands-on experience in Omaha."
  }
};

const SERVICE_CITIES = [
  { "@type": "City", "name": "Omaha" },
  { "@type": "City", "name": "Bellevue" },
  { "@type": "City", "name": "Papillion" },
  { "@type": "City", "name": "La Vista" },
  { "@type": "City", "name": "Ralston" },
  { "@type": "City", "name": "Council Bluffs" }
];

const serviceData = {
  residential: {
    title: "Residential Lockouts",
    description: "Locked out of your home? Our expert technicians are available 24/7 to help you regain access to your property quickly and safely. We use specialized tools and techniques to ensure no damage to your locks or doors. Our professional locksmiths are fully licensed, insured, and background-checked for your peace of mind.",
    video: "/videos/ResidentialLockoutVideo.mp4",
    thumbnail: "/images/services-thumbnails/Residential-Service-Photo.webp",
  },
  automotive: {
    title: "Automotive Lockouts",
    description: "Car key lost or locked inside? Our automotive locksmith specialists can help with any vehicle make and model. We provide quick, damage-free car unlocking services, key cutting, transponder key programming, and ignition repair. Available 24/7 for emergency roadside assistance throughout Omaha.",
    video: "/videos/AutomotiveLockoutsVideo.mp4",
    thumbnail: "/images/services-thumbnails/Automotive-Lockout.webp",
  },
  extraction: {
    title: "Broken Key Extraction",
    description: "Dealing with a broken key? Our skilled technicians can safely extract broken keys from any lock without causing damage. We'll remove the broken piece and can create a new key on the spot. We handle all types of locks including door locks, car locks, padlocks, and more.",
    video: "/videos/KeyExtractionVideo.mp4",
    thumbnail: "/images/services-thumbnails/Broken-Key-Extraction.webp",
  },
  duplication: {
    title: "Key Duplication",
    description: "Need spare keys? We offer fast and accurate key duplication services for all types of keys, including high-security and transponder keys. Our state-of-the-art key cutting equipment ensures precise duplicates every time. We can also create new keys from scratch if you've lost all copies.",
    video: "/videos/DuplicationVideo.mp4",
    thumbnail: "/images/services-thumbnails/Key-Duplication.webp",
  },
  rekeying: {
    title: "Lock Rekeying",
    description: "Want to keep your existing locks but need new keys? Our lock rekeying service is the perfect solution. We'll modify your current locks to work with new keys, effectively invalidating any old keys that might be floating around. This is a cost-effective way to secure your property.",
    video: "/videos/LockReKeying.mp4",
    thumbnail: "/images/services-thumbnails/Lock-ReKeying.webp",
  },
  consultation: {
    title: "Security Consultation",
    description: "Looking to upgrade your security? Our expert consultants will assess your property's current door locks and provide detailed recommendations for improvements. We'll help you choose the right locks, to keep your property safe.",
    video: "/videos/SecurityConsultation.mp4",
    thumbnail: "/images/services-thumbnails/Security-Consultation.webp",
  }
};

export default function DynamicServicePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [playing, setPlaying] = useState(false);
  const [forceTall, setForceTall] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const data = serviceData[slug] ?? serviceData[slug as keyof typeof serviceData];

  renderCount++;
  const currentRender = renderCount;

  console.log(`[PHASE8-A1] RENDER #${currentRender} — Component mount/update`);
  console.log(`[PHASE8-A1] - Timestamp: ${performance.now().toFixed(2)}ms`);
  console.log(`[PHASE8-A1] - Slug: ${slug}`);
  console.log(`[PHASE8-D4] - location.state:`, location.state);
  console.log(`[PHASE8-D4] - location.state?.scrollFx:`, (location.state as any)?.scrollFx);

  const enterFullscreen = async (v: HTMLVideoElement) => {
    const anyV = v as any;
    try {
      if (anyV.requestFullscreen) return await anyV.requestFullscreen();
      if (anyV.webkitEnterFullscreen) return anyV.webkitEnterFullscreen();
      if (anyV.webkitRequestFullscreen) return anyV.webkitRequestFullscreen();
      if (anyV.msRequestFullscreen) return anyV.msRequestFullscreen();
    } catch (_err) { /* best-effort */ }
  };

  const requestPlayWithFullscreen = async () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      v.muted = false;
      await v.play().catch(() => {});
      try { await (screen.orientation as any)?.lock?.("portrait"); } catch {}
      await enterFullscreen(v);
    } catch (_err) { /* best-effort */ }
  };

  const titleBackgroundMap = {
    residential: "bg-gradient-to-br from-[#334155] via-[#1e293b] to-[#0f172a]",
    automotive: "bg-gradient-to-br from-[#991b1b] via-[#7f1d1d] to-[#3b0d0d]",
    extraction: "bg-gradient-to-br from-[#ea580c] via-[#9a3412] to-[#4a1b06]",
    duplication: "bg-gradient-to-br from-[#1e40af] via-[#1e3a8a] to-[#111827]",
    rekeying: "bg-gradient-to-br from-[#7e22ce] via-[#581c87] to-[#2e1065]",
    consultation: "bg-gradient-to-br from-[#047857] via-[#064e3b] to-[#022c22]",
  };

  const gradientMap = {
    residential: "from-blue-900/80 via-indigo-800/80 to-purple-900/80",
    automotive: "from-red-900/80 via-pink-800/80 to-orange-800/80",
    extraction: "from-yellow-800/80 via-amber-700/80 to-orange-800/80",
    duplication: "from-teal-900/80 via-cyan-800/80 to-blue-900/80",
    rekeying: "from-purple-900/80 via-fuchsia-800/80 to-pink-700/80",
    consultation: "from-emerald-900/80 via-green-800/80 to-teal-900/80",
  };

  const didRunFx = React.useRef(false);
  const sawFxRef = React.useRef<boolean>(false);

  useEffect(() => {
    effectRunCount++;
    const currentEffect = effectRunCount;

    console.log(`[PHASE8-A1] EFFECT RUN #${currentEffect} (render #${currentRender})`);
    console.log(`[PHASE8-B2] - Effect start timestamp: ${performance.now().toFixed(2)}ms`);
    console.log(`[PHASE8-D5] - didRunFx.current: ${didRunFx.current}`);
    console.log(`[PHASE8-D5] - sawFxRef.current: ${sawFxRef.current}`);

    if (didRunFx.current) {
      console.log(`[PHASE8-A1] EARLY EXIT — didRunFx.current is true`);
      return;
    }

    const fx = (location.state as any)?.scrollFx;
    console.log(`[PHASE8-D4] - fx value: ${fx}`);

    if (fx) {
      sawFxRef.current = true;
      console.log(`[PHASE8-D5] - sawFxRef.current set to true`);
    }

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    console.log(`[PHASE8-E7] - prefers-reduced-motion: ${prefersReduced}`);
    console.log(`[PHASE8-C3] - Initial scrollHeight: ${document.documentElement.scrollHeight}px`);
    console.log(`[PHASE8-C3] - Initial innerHeight: ${window.innerHeight}px`);
    console.log(`[PHASE8-C3] - Initial scroll distance: ${document.documentElement.scrollHeight - window.innerHeight}px`);

    const waitForTallPage = (maxTries = 8, delayMs = 60) =>
      new Promise<void>((resolve) => {
        let tries = 0;
        const startWait = performance.now();
        console.log(`[PHASE8-B2] waitForTallPage START — timestamp: ${startWait.toFixed(2)}ms`);

        const check = () => {
          const doc = document.documentElement;
          const distance = doc.scrollHeight - window.innerHeight;
          const ready = distance > 8;

          console.log(`[PHASE8-B2] waitForTallPage check #${tries + 1}: scrollHeight=${doc.scrollHeight}, innerHeight=${window.innerHeight}, distance=${distance}, ready=${ready}`);

          if (ready || tries >= maxTries) {
            const endWait = performance.now();
            console.log(`[PHASE8-B2] waitForTallPage COMPLETE — timestamp: ${endWait.toFixed(2)}ms, duration: ${(endWait - startWait).toFixed(2)}ms, tries: ${tries}`);
            resolve();
          } else {
            tries++;
            setTimeout(check, delayMs);
          }
        };
        requestAnimationFrame(() => requestAnimationFrame(check));
      });

    const runBottomThenTop = async () => {
      console.log(`[PHASE8-B2] runBottomThenTop START — timestamp: ${performance.now().toFixed(2)}ms`);
      didRunFx.current = true;
      console.log(`[PHASE8-D5] - didRunFx.current set to true`);

      await waitForTallPage();

      const doc = document.documentElement;
      let toBottom = Math.max(doc.scrollHeight - window.innerHeight, 0);

      console.log(`[PHASE8-B2] BEFORE forceTall check:`);
      console.log(`[PHASE8-B2] - scrollHeight: ${doc.scrollHeight}px`);
      console.log(`[PHASE8-B2] - innerHeight: ${window.innerHeight}px`);
      console.log(`[PHASE8-B2] - toBottom: ${toBottom}px`);
      console.log(`[PHASE8-B2] - toBottom < 64: ${toBottom < 64}`);

      if (toBottom < 64) {
        console.log(`[PHASE8-B2] TRIGGERING forceTall — page too short`);
        setForceTall(true);
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        toBottom = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);

        console.log(`[PHASE8-B2] AFTER forceTall:`);
        console.log(`[PHASE8-B2] - scrollHeight: ${document.documentElement.scrollHeight}px`);
        console.log(`[PHASE8-B2] - innerHeight: ${window.innerHeight}px`);
        console.log(`[PHASE8-B2] - toBottom (recalculated): ${toBottom}px`);
      }

      console.log(`[PHASE8-B2] FIRST scrollTo (instant to bottom) — timestamp: ${performance.now().toFixed(2)}ms, toBottom: ${toBottom}px`);
      window.scrollTo({ top: toBottom, behavior: "auto" });
      console.log(`[PHASE8-B2] - Current scrollY after first scrollTo: ${window.scrollY}px`);

      if (!prefersReduced) {
        requestAnimationFrame(() => {
          console.log(`[PHASE8-B2] SECOND scrollTo (smooth to top) — timestamp: ${performance.now().toFixed(2)}ms`);
          console.log(`[PHASE8-B2] - Current scrollY before second scrollTo: ${window.scrollY}px`);
          window.scrollTo({ top: 0, behavior: "smooth" });

          requestAnimationFrame(() => {
            console.log(`[PHASE8-B2] After smooth scroll initiated — scrollY: ${window.scrollY}px at ${performance.now().toFixed(2)}ms`);
          });
        });
      } else {
        console.log(`[PHASE8-B2] SECOND scrollTo (instant to top, reduced motion) — timestamp: ${performance.now().toFixed(2)}ms`);
        window.scrollTo({ top: 0, behavior: "auto" });
        console.log(`[PHASE8-B2] - Current scrollY after second scrollTo: ${window.scrollY}px`);
      }

      window.setTimeout(() => {
        console.log(`[PHASE8-B2] Releasing forceTall — timestamp: ${performance.now().toFixed(2)}ms`);
        setForceTall(false);
      }, 600);
    };

    if (fx === "bottomThenTop") {
      console.log(`[PHASE8] EXECUTING bottomThenTop animation`);
      runBottomThenTop();
      return;
    }

    if (!fx && !sawFxRef.current && !didRunFx.current) {
      console.log(`[PHASE8] EXECUTING fallback scroll (smooth to bottom) after 100ms`);
      setTimeout(() => {
        console.log(`[PHASE8-B2] Fallback scroll executing — timestamp: ${performance.now().toFixed(2)}ms`);
        console.log(`[PHASE8-B2] - scrollHeight: ${document.documentElement.scrollHeight}px`);
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    } else {
      console.log(`[PHASE8] NO SCROLL — fx: ${fx}, sawFxRef: ${sawFxRef.current}, didRunFx: ${didRunFx.current}`);
    }
  }, [slug, location.state]);

  // Layout shift monitoring
  useEffect(() => {
    const measurements = [0, 100, 300];

    measurements.forEach(delay => {
      setTimeout(() => {
        console.log(`[PHASE8-C3] LAYOUT MEASUREMENT at ${delay}ms after mount:`);
        console.log(`[PHASE8-C3] - timestamp: ${performance.now().toFixed(2)}ms`);
        console.log(`[PHASE8-C3] - scrollHeight: ${document.documentElement.scrollHeight}px`);
        console.log(`[PHASE8-C3] - innerHeight: ${window.innerHeight}px`);
        console.log(`[PHASE8-C3] - scroll distance: ${document.documentElement.scrollHeight - window.innerHeight}px`);
        console.log(`[PHASE8-C3] - current scrollY: ${window.scrollY}px`);
        console.log(`[PHASE8-E7] - fonts loaded: ${(document as any).fonts?.status === 'loaded'}`);
        console.log(`[PHASE8-E7] - video readyState: ${videoRef.current?.readyState || 'N/A'}`);
      }, delay);
    });
  }, []);

  const handleVideoPlay = () => {
    const eventName = buildEventName({ base: slug || 'service', action: 'video_play' });
    trackVideoEvent(eventName, data?.title || 'Unknown Service', {
      video_url: data?.video,
      video_provider: 'self-hosted'
    });
  };

  const handlePlayButtonClick = async () => {
    setPlaying(true);
    setTimeout(() => { requestPlayWithFullscreen(); }, 0);
    const eventName = buildEventName({ base: slug || 'service', action: 'video_play_button_click' });
    trackVideoEvent(eventName, data?.title || 'Unknown Service', {
      video_url: data?.video,
      video_provider: 'self-hosted'
    });
  };

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Service Not Found</h1>
          <button onClick={() => navigate("/")} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const titleClass = titleBackgroundMap[slug as keyof typeof titleBackgroundMap] || titleBackgroundMap.residential;
  const gradientClasses = gradientMap[slug as keyof typeof gradientMap] || gradientMap.residential;
  const canonicalUrl = `https://aksarbenlocksmiths.com/services/${slug}`;
  const origin = typeof window !== "undefined" ? window.location.origin : "https://aksarbenlocksmiths.com";

  const faqs = SERVICE_FAQS[slug as keyof typeof SERVICE_FAQS] || [];
  const faqLd = faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": { "@type": "Answer", "text": item.a }
    }))
  } : null;

  const meta = SERVICE_META[slug as string];
  const ogImage = data?.thumbnail ? `${origin}${data.thumbnail}` : `${origin}/images/shield-logo.webp`;

  const videoUploadDate = "2025-09-25T12:00:00-05:00";
  const pageUrl = `https://aksarbenlocksmiths.com/services/${slug}`;

  const serviceLd = meta ? {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${canonicalUrl}#service`,
    "serviceType": meta.serviceType,
    "name": meta.serviceType,
    "description": meta.description,
    "provider": {
      "@type": "LocalBusiness",
      "@id": "https://aksarbenlocksmiths.com/#organization",
      "name": "Aksarben Locksmiths LLC"
    },
    "areaServed": SERVICE_CITIES,
    "offers": {
      "@type": "Offer",
      "url": canonicalUrl,
      "priceCurrency": "USD",
      "priceSpecification": { "@type": "PriceSpecification", "price": 0, "priceCurrency": "USD" },
      "availability": "https://schema.org/InStock"
    },
    "url": canonicalUrl
  } : null;

  return (
    <div className={`relative overflow-hidden ${forceTall ? 'min-h-[140vh]' : 'min-h-screen'}`}>
      <Helmet>
        {meta && <title>{meta.title}</title>}
        {meta && <meta name="description" content={meta.metaDescription || meta.description?.replace(/\s+/g, ' ').trim().slice(0, 155)} />}
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={meta?.title || data?.title} />
        <meta property="og:description" content={meta?.metaDescription || data?.description?.slice(0, 155)} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={meta?.title || data?.title} />
        <meta name="twitter:description" content={meta?.metaDescription || data?.description?.slice(0, 155)} />
        <meta name="twitter:image" content={ogImage} />

        {serviceLd && <script type="application/ld+json">{JSON.stringify(serviceLd)}</script>}
        {faqLd && <script type="application/ld+json">{JSON.stringify(faqLd)}</script>}
      </Helmet>

      <div className="fixed top-0 w-full z-50 bg-black backdrop-blur-md shadow-lg text-sm px-4 py-1 flex justify-between items-center">
        <span className="text-white animate-pulse">24/7 Emergency Service</span>
        <a
          href="tel:+14025566715"
          onClick={(e) => trackClick('top_bar_phone_click', e.currentTarget, {
            phone_number: '+14025566715',
            source: 'service_page',
            page_section: 'emergency_top_bar',
            service_slug: slug
          })}
          className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition animate-pulse"
        >
          <Phone className="h-4 w-4" />
          (402) 556-6715
        </a>
      </div>

      <video
        autoPlay
        muted
        loop
        playsInline
        ref={videoRef}
        className="fixed inset-0 w-full h-full object-cover opacity-45 z-0"
        src="/videos/wallpaper.mp4"
      />
      <div className={`relative z-10 min-h-screen bg-gradient-to-br ${gradientClasses} backdrop-blur-sm px-6 py-12 pt-16 text-white`}>
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => {
              const eventName = buildEventName({ base: 'service', slug: slug || 'unknown', action: 'back_click' });
              trackClick(eventName, document.activeElement as HTMLElement, {
                source_page: 'service',
                page_section: 'header',
                destination: '/'
              });
              navigate("/");
            }}
            className="flex items-center gap-2 text-sm hover:text-blue-300 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          <div className={`${titleClass} rounded-2xl shadow-2xl p-8`}>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{data.title}</h1>
            <p className="text-lg text-gray-200 leading-relaxed whitespace-pre-line">
              {meta?.description || data.description}
            </p>
          </div>

          {data.video && (
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black/40 backdrop-blur-sm">
              <video
                ref={videoRef}
                className="w-full aspect-video object-cover"
                src={data.video}
                poster={data.thumbnail}
                controls={playing}
                playsInline
                onPlay={handleVideoPlay}
              />
              {!playing && (
                <button
                  onClick={handlePlayButtonClick}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition group"
                  aria-label="Play video"
                >
                  <div className="w-20 h-20 rounded-full bg-white/90 group-hover:bg-white flex items-center justify-center shadow-lg transition">
                    <div className="w-0 h-0 border-l-[20px] border-l-black border-y-[12px] border-y-transparent ml-1"></div>
                  </div>
                </button>
              )}
            </div>
          )}

          {faqs.length > 0 && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-xl">
              <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
              <div className="space-y-6">
                {faqs.map((faq, i) => (
                  <div key={i} className="border-b border-white/20 pb-4 last:border-0">
                    <h3 className="text-xl font-semibold mb-2">{faq.q}</h3>
                    <p className="text-gray-200 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-red-900/80 to-orange-800/80 backdrop-blur-md rounded-2xl p-8 shadow-2xl text-center">
            <h2 className="text-3xl font-bold mb-4">Need This Service?</h2>
            <p className="text-lg mb-6">Available 24/7 for emergencies throughout Omaha</p>
            <a
              href="tel:+14025566715"
              onClick={(e) => trackClick('service_cta_call', e.currentTarget, {
                phone_number: '+14025566715',
                source: 'service_page',
                page_section: 'cta',
                service_slug: slug
              })}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-red-900 font-bold rounded-full hover:bg-gray-100 transition text-lg shadow-lg"
            >
              <Phone className="h-5 w-5" />
              (402) 556-6715
            </a>
          </div>

          <div className="text-center">
            <Link
              to="/"
              onClick={(e) => {
                const eventName = buildEventName({ base: 'service', slug: slug || 'unknown', action: 'view_all_services' });
                trackClick(eventName, e.currentTarget, {
                  source_page: 'service',
                  page_section: 'footer',
                  destination: '/'
                });
              }}
              className="inline-block px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition"
            >
              View All Services
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
