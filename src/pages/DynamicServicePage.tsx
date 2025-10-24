import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { useEffect, useLayoutEffect, useState, useRef } from "react";
import { ArrowLeft, Phone, MapPin } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { trackVideoEvent, trackClick, buildEventName } from "../utils/analytics";
import { SERVICE_FAQS } from "../data/service-faqs";
import servicesData from "../data/services.json";

const allServices = servicesData.services;

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
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const data = serviceData[slug] ?? serviceData[slug as keyof typeof serviceData];

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

  // Define animated backgrounds for each service
  const titleBackgroundMap = {
    residential: "bg-gradient-to-br from-[#334155] via-[#1e293b] to-[#0f172a]",
    automotive: "bg-gradient-to-br from-[#991b1b] via-[#7f1d1d] to-[#3b0d0d]",
    extraction: "bg-gradient-to-br from-[#ea580c] via-[#9a3412] to-[#4a1b06]",
    duplication: "bg-gradient-to-br from-[#1e40af] via-[#1e3a8a] to-[#111827]",
    rekeying: "bg-gradient-to-br from-[#7e22ce] via-[#581c87] to-[#2e1065]",
    consultation: "bg-gradient-to-br from-[#047857] via-[#064e3b] to-[#022c22]",
  };

  // Define gradient colors matching homepage tiles exactly
  const gradientMap = {
    residential: "from-blue-900/80 via-indigo-800/80 to-purple-900/80",
    automotive: "from-red-900/80 via-pink-800/80 to-orange-800/80",
    extraction: "from-yellow-800/80 via-amber-700/80 to-orange-800/80",
    duplication: "from-teal-900/80 via-cyan-800/80 to-blue-900/80",
    rekeying: "from-purple-900/80 via-fuchsia-800/80 to-pink-700/80",
    consultation: "from-emerald-900/80 via-green-800/80 to-teal-900/80",
  };

  const wantsBottomThenTop = (location.state as any)?.scrollFx === "bottomThenTop";

  // 2a) PRE-PAINT SNAP, run before first paint so the first visible frame is already at the bottom
  useLayoutEffect(() => {
    if (!wantsBottomThenTop) return;

    // Director's note, hush Brenda for one frame, we need an instant snap, not smoothing
    const html = document.documentElement;
    const prevInline = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";

    // Snap to bottom immediately, before paint
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "auto",
    });

    // Restore previous inline value, let global CSS resume control
    queueMicrotask(() => {
      html.style.scrollBehavior = prevInline;
    });
  }, [slug, wantsBottomThenTop]);

  // 2b) POST-PAINT LUXURY RISE, keep the elegant smooth scroll up, timing unchanged
  useEffect(() => {
    if (wantsBottomThenTop) {
      // Director's note, camera is already at the bottom, now perform the graceful rise
      const t = setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
      return () => clearTimeout(t);
    }

    // Fallback for routes without the special flag, your existing default stays the same
    const t = setTimeout(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
    return () => clearTimeout(t);
  }, [slug, wantsBottomThenTop]);


  // Video event handlers
  const handleVideoPlay = () => {
    const eventName = buildEventName({ base: slug || 'service', action: 'video_play' });
    trackVideoEvent(eventName, data?.title || 'Unknown Service', {
      video_url: data?.video,
      video_thumbnail: data?.thumbnail
    }, {
      service_name: data?.title,
      service_slug: slug,
      page_section: 'service_page'
    });
  };

  const handleVideoPause = () => {
    const eventName = buildEventName({ base: slug || 'service', action: 'video_pause' });
    trackVideoEvent(eventName, data?.title || 'Unknown Service', {
      video_url: data?.video,
      video_thumbnail: data?.thumbnail
    }, {
      service_name: data?.title,
      service_slug: slug,
      page_section: 'service_page'
    });
  };

  const handleVideoEnded = () => {
    const eventName = buildEventName({ base: slug || 'service', action: 'video_complete' });
    trackVideoEvent(eventName, data?.title || 'Unknown Service', {
      video_url: data?.video,
      video_thumbnail: data?.thumbnail
    }, {
      service_name: data?.title,
      service_slug: slug,
      page_section: 'service_page'
    });
  };

  const handlePlayButtonClick = async () => {
    setPlaying(true);
    setTimeout(() => { requestPlayWithFullscreen(); }, 0);
    const eventName = buildEventName({ base: slug || 'service', action: 'video_play_button_click' });
    trackVideoEvent(eventName, data?.title || 'Unknown Service', {
      video_url: data?.video,
      video_thumbnail: data?.thumbnail
    }, {
      service_name: data?.title,
      service_slug: slug,
      page_section: 'service_page'
    });
  };

  if (!data) return <div className="text-center text-white mt-10">Service not found.</div>;

  const gradientClasses = gradientMap[slug as keyof typeof gradientMap] || "from-gray-900 to-black";
  const titleBackground = titleBackgroundMap[slug as keyof typeof titleBackgroundMap] || "bg-black/60";

  // Build FAQ JSON-LD if available for this service
  const faqs = SERVICE_FAQS[slug as string] || [];
  const canonicalPath = `/services/${slug}`;
  const origin = typeof window !== "undefined" ? window.location.origin : "https://aksarbenlocksmiths.com";
  const canonicalUrl = `${origin}${canonicalPath}`;

  const faqLd = faqs.length ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${canonicalUrl}#faq`,
    "url": canonicalUrl,
    "mainEntity": faqs.map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": { "@type": "Answer", "text": item.a }
    }))
  } : null;

  const meta = SERVICE_META[slug as string];
  const GLOBAL_OG = origin + "/images/og/home-1200x630.webp";

  // ISO-8601 with Omaha timezone
  const videoUploadDate = "2025-09-25T12:00:00-05:00";
  // Canonical page URL for this service, used as embedUrl
  const pageUrl = `https://aksarbenlocksmiths.com/services/${slug}`;

  const serviceLd = meta ? {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${canonicalUrl}#service`,
    "serviceType": meta.serviceType,
    "name": meta.serviceType,
    "areaServed": SERVICE_CITIES,
    "provider": {
      "@type": "LocalBusiness",
      "name": "Aksarben Locksmiths",
      "image": `${origin}/images/shield-logo.webp`,
      "telephone": "+14025566715",
      "url": origin
    },
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
    <div className="relative min-h-screen overflow-hidden">
      <Helmet>
        {meta && <title>{meta.title}</title>}
        {meta && <meta name="description" content={meta.metaDescription || meta.description?.replace(/\s+/g, ' ').trim().slice(0, 155)} />}
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="index, follow" />

        {meta && <meta property="og:title" content={meta.title} />}
        {meta && <meta property="og:description" content={meta.metaDescription || meta.description?.replace(/\s+/g, ' ').trim().slice(0, 155)} />}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={GLOBAL_OG} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        <meta name="twitter:card" content="summary_large_image" />
        {meta && <meta name="twitter:title" content={meta.title} />}
        {meta && <meta name="twitter:description" content={meta.metaDescription || meta.description?.replace(/\s+/g, ' ').trim().slice(0, 155)} />}
        <meta name="twitter:image" content={GLOBAL_OG} />

        {serviceLd && (
          <script type="application/ld+json">
            {JSON.stringify(serviceLd)}
          </script>
        )}

        {faqLd && (
          <script type="application/ld+json">
            {JSON.stringify(faqLd)}
          </script>
        )}

        {data && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "VideoObject",
              "name": `${data.title} Locksmith Service in Omaha`,
              "description": `Watch how our professionals perform ${data.title.toLowerCase()} efficiently and securely across Omaha.`,
              "thumbnailUrl": `https://aksarbenlocksmiths.com${data.thumbnail}`,
              "contentUrl": `https://aksarbenlocksmiths.com${data.video}`,
              "embedUrl": pageUrl,
              "uploadDate": videoUploadDate,
              "duration": "PT2M30S"
            })}
          </script>
        )}
      </Helmet>
      
      {/* Black Top Bar */}
      <div className="fixed top-0 w-full z-50 bg-black backdrop-blur-md shadow-lg text-sm px-4 py-1 flex justify-between items-center">
        <span className="text-white motion-safe:animate-pulse">24/7 Emergency Service</span>
        <a
          href="tel:+14025566715"
          className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition motion-safe:animate-pulse"
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
        className="fixed inset-0 w-full h-full object-cover opacity-45 z-0"
        src="/videos/wallpaper.mp4"
      />
      <div className={`relative z-10 min-h-screen bg-gradient-to-br ${gradientClasses} backdrop-blur-sm px-6 py-12 pt-16 text-white`}>
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={(e) => {
              navigate("/", { state: { scrollTo: "services", restorePosition: true } });
              trackClick('back_to_services', e.currentTarget, { 
                from_service: data.title,
                service_name: data.title,
                page_section: 'service_page'
              });
            }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[linear-gradient(to_left,_#7f1d1d,_#991b1b,_#ef4444,_#b91c1c,_#991b1b,_#7f1d1d)] bg-[length:800%_100%] animate-[redHeatWave_3s_linear_infinite] text-white text-sm shadow-[0_0_24px_rgba(255,255,255,0.5)] hover:brightness-125 hover:scale-105 transition duration-300 ease-in-out"
            aria-label="Back to Services"
            title="Back to Services"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Services
          </button>

          <Link
            to="/service-areas"
            onClick={(e) => {
              trackClick('service_areas_pill_click', e.currentTarget as unknown as HTMLElement, {
                destination: '/service-areas',
                from_service: data.title,
                service_name: data.title,
                page_section: 'service_page'
              });
            }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[linear-gradient(90deg,_#ef4444_0%,_#dc2626_15%,_#b91c1c_45%,_#b91c1c_55%,_#dc2626_85%,_#ef4444_100%)] text-white text-sm shadow-[0_0_24px_rgba(255,255,255,0.5)] hover:brightness-125 hover:scale-105 transition duration-300 ease-in-out"
            title="View Service Areas"
          >
            <MapPin className="w-4 h-4" />
            Service Areas
          </Link>
        </div>
        
        <div className="flex justify-center mb-8">
          <div className={`inline-block px-6 py-3 rounded-xl ${titleBackground} backdrop-blur-sm border border-white/10 shadow-lg flex items-center justify-center`}>
            <h1 className="text-white text-3xl sm:text-4xl font-extrabold tracking-wide text-center">
              {data.title}
            </h1>
          </div>
        </div>
        
        <div className="relative w-full max-w-4xl mx-auto overflow-hidden rounded-2xl shadow-xl aspect-video group bg-black/80">
          {!playing && (
            <button
              onClick={handlePlayButtonClick}
              aria-label={`Play ${data.title} service video`}
              className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm hover:bg-black/40 transition-all"
            >
              <img
                src={data.thumbnail}
                alt={`Image representing ${data.title.toLowerCase()} service`}
                className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-white/30 blur-md animate-pulse" />
                  <div className="w-16 h-16 rounded-full border-4 border-black bg-black/70 flex items-center justify-center z-10 group-hover:scale-105 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              <span
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-[2.8rem] text-white/90 text-sm md:text-base font-medium opacity-80 md:opacity-0 md:group-hover:opacity-80 transition-opacity duration-200 select-none drop-shadow"
                aria-hidden="true"
              >
                Watch video
              </span>
            </button>
          )}

          {playing && (
            <video
              ref={videoRef}
              title={`${data.title} service demonstration video`}
              className="w-full h-full object-contain bg-black"
              src={data.video}
              controls
              playsInline
              onPlay={handleVideoPlay}
              onPause={handleVideoPause}
              onEnded={handleVideoEnded}
            />
          )}
        </div>
        <div className="bg-white/10 backdrop-blur-2xl rounded-xl px-6 py-5 text-white/90 text-base leading-relaxed shadow-[0_0_24px_rgba(255,255,255,0.5)] max-w-3xl w-full mx-auto mt-6">
          {(meta?.description || "").split(/\n{2,}/).map((para, i) => (
            <p key={i} className="leading-relaxed mb-4 last:mb-0">{para}</p>
          ))}
        </div>
        
        <div className="text-center mt-4 max-w-3xl mx-auto">
          <p className="text-white/80 text-sm italic">
            {slug === 'residential' ? 'Watch our technician demonstrate safe home entry techniques without damage.' :
             slug === 'automotive' ? 'See how we unlock vehicles quickly while protecting your car\'s interior.' :
             slug === 'extraction' ? 'Learn our professional method for removing broken keys from any lock.' :
             slug === 'duplication' ? 'Observe the precision key cutting process for perfect duplicates.' :
             slug === 'rekeying' ? 'View the lock rekeying process that gives you new keys instantly.' :
             'Discover how we assess and upgrade your property\'s security systems.'}
          </p>
        </div>
        
        <div className="flex justify-center mt-8">
          <a 
            href="tel:+14025566715" 
            onClick={(e) => {
              const eventName = buildEventName({ base: 'service_page_cta', action: 'call_button_click' });
              trackClick(eventName, e.currentTarget, {
                service: data.title,
                service_name: data.title,
                service_slug: slug,
                phone_number: '+14025566715',
                page_section: 'service_page',
                origin: 'service_page_cta'
              });
            }}
            className="bg-gradient-to-l from-red-900 via-red-600 to-red-800 text-white py-3 px-6 rounded-full shadow-[0_0_24px_rgba(255,255,255,0.5)] hover:brightness-125 hover:scale-105 transition duration-300 ease-in-out animate-[pulseRedGlow_3s_ease-in-out_infinite] inline-block"
          >
            Request Service
          </a>
        </div>
        
        <script type="application/ld+json">
          {JSON.stringify({
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
                "name": "Services",
                "item": "https://aksarbenlocksmiths.com/#services"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": data.title,
                "item": `https://aksarbenlocksmiths.com/services/${slug}`
              }
            ]
          })}
        </script>
        
        <div className="text-sm mt-12 text-white">
          <strong>More Locksmith Services:</strong>
          <ul className="list-disc list-inside space-y-1 mt-2">
            {allServices
              .filter(service => service.slug !== slug)
              .map(service => (
                <li key={service.slug}>
                  <Link
                    to={`/services/${service.slug}`}
                    state={{ scrollFx: "bottomThenTop" }}
                    onClick={(e) => trackClick('internal_service_link', e.currentTarget as unknown as HTMLElement, {
                      from_service: data.title,
                      to_service: service.title,
                      page_section: 'more_services'
                    })}
                    className="hover:underline"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
        
        <div className="sr-only">
          {slug === 'residential' ? 'residential locksmith omaha, emergency locksmith omaha, 24 hour locksmith omaha, locksmith near me omaha, omaha locksmith residential services, mobile locksmith omaha' :
           slug === 'automotive' ? 'car locksmith omaha, auto locksmith omaha, emergency locksmith omaha, 24 hour locksmith omaha, locksmith near me omaha, mobile locksmith omaha' :
           slug === 'extraction' ? 'emergency locksmith omaha, mobile locksmith omaha, 24 hour locksmith omaha, locksmith near me omaha, omaha locksmith emergency services' :
           slug === 'duplication' ? 'key duplication omaha, mobile locksmith omaha, omaha locksmith, locksmith near me omaha, 24 hour locksmith omaha' :
           slug === 'rekeying' ? 'rekeying locks omaha, omaha locksmith, mobile locksmith omaha, locksmith near me omaha, 24 hour locksmith omaha' :
           'security consultation omaha, locksmith consultation, omaha locksmith, locksmith near me omaha, mobile locksmith omaha'}
        </div>
      </div>
    </div>
  );
}