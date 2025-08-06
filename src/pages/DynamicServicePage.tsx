import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Phone } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { trackVideoEvent, trackClick } from "../utils/analytics";

const allServices = [
  { slug: 'residential', title: 'Residential Lockouts' },
  { slug: 'automotive', title: 'Automotive Lockouts' },
  { slug: 'extraction', title: 'Broken Key Extraction' },
  { slug: 'duplication', title: 'Key Duplication' },
  { slug: 'rekeying', title: 'Lock Rekeying' },
  { slug: 'consultation', title: 'Security Consultation' }
];

const serviceData = {
  residential: {
    title: "Residential Lockouts",
    description: "Locked out of your home? Our expert technicians are available 24/7 to help you regain access to your property quickly and safely. We use specialized tools and techniques to ensure no damage to your locks or doors. Our professional locksmiths are fully licensed, insured, and background-checked for your peace of mind.",
    video: "/videos/ResidentialLockoutVideo.mp4",
    thumbnail: "/images/Services Thumbnails/Residential-Service-Photo.webp",
  },
  automotive: {
    title: "Automotive Lockouts",
    description: "Car key lost or locked inside? Our automotive locksmith specialists can help with any vehicle make and model. We provide quick, damage-free car unlocking services, key cutting, transponder key programming, and ignition repair. Available 24/7 for emergency roadside assistance throughout Omaha.",
    video: "/videos/AutomotiveLockoutsVideo.mp4",
    thumbnail: "/images/Services Thumbnails/Automotive-Lockout.webp",
  },
  extraction: {
    title: "Broken Key Extraction",
    description: "Dealing with a broken key? Our skilled technicians can safely extract broken keys from any lock without causing damage. We'll remove the broken piece and can create a new key on the spot. We handle all types of locks including door locks, car locks, padlocks, and more.",
    video: "/videos/KeyExtractionVideo.mp4",
    thumbnail: "/images/Services Thumbnails/Broken-Key-Extraction.webp",
  },
  duplication: {
    title: "Key Duplication",
    description: "Need spare keys? We offer fast and accurate key duplication services for all types of keys, including high-security and transponder keys. Our state-of-the-art key cutting equipment ensures precise duplicates every time. We can also create new keys from scratch if you've lost all copies.",
    video: "/videos/DuplicationVideo.mp4",
    thumbnail: "/images/Services Thumbnails/Key-Duplication.webp",
  },
  rekeying: {
    title: "Lock Rekeying",
    description: "Want to keep your existing locks but need new keys? Our lock rekeying service is the perfect solution. We'll modify your current locks to work with new keys, effectively invalidating any old keys that might be floating around. This is a cost-effective way to secure your property.",
    video: "/videos/LockReKeying.mp4",
    thumbnail: "/images/Services Thumbnails/Lock-ReKeying.webp",
  },
  consultation: {
    title: "Security Consultation",
    description: "Looking to upgrade your security? Our expert consultants will assess your property's current door locks and provide detailed recommendations for improvements. We'll help you choose the right locks, to keep your property safe.",
    video: "/videos/SecurityConsultation.mp4",
    thumbnail: "/images/Services Thumbnails/Security-Consultation.webp",
  },
  emergency: {
    title: "Emergency Locksmith Services",
    description: "24/7 emergency locksmith services for urgent lockouts and security situations. Our rapid response team is available around the clock to help you regain access to your property safely and quickly.",
    video: "/videos/EmergencyLocksmithVideo.mp4",
    thumbnail: "/images/Services Thumbnails/Emergency-Service-Photo.webp",
  },
  "lock-repair": {
    title: "Lock Repair Services", 
    description: "Professional lock repair services for damaged, worn, or malfunctioning locks. We repair all types of locks including deadbolts, door handles, and high-security systems to restore your property's security.",
    video: "/videos/LockRepairVideo.mp4",
    thumbnail: "/images/Services Thumbnails/Lock-Repair-Photo.webp",
  }
};

export default function DynamicServicePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [playing, setPlaying] = useState(false);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const data = serviceData[slug] ?? serviceData[slug as keyof typeof serviceData];

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

  useEffect(() => {
    // Scroll to bottom after slight delay to allow full rendering
    setTimeout(() => {
      window.scrollTo({ 
        top: document.documentElement.scrollHeight, 
        behavior: "smooth" 
      });
    }, 100);
  }, []);

  // Video event handlers
  const handleVideoPlay = () => {
    trackVideoEvent('video_play', data?.title || 'Unknown Service', {
      video_url: data?.video,
      video_thumbnail: data?.thumbnail
    }, {
      service_name: data?.title,
      page_section: 'service_page'
    });
  };

  const handleVideoPause = () => {
    trackVideoEvent('video_pause', data?.title || 'Unknown Service', {
      video_url: data?.video,
      video_thumbnail: data?.thumbnail
    }, {
      service_name: data?.title,
      page_section: 'service_page'
    });
  };

  const handleVideoEnded = () => {
    trackVideoEvent('video_complete', data?.title || 'Unknown Service', {
      video_url: data?.video,
      video_thumbnail: data?.thumbnail
    }, {
      service_name: data?.title,
      page_section: 'service_page'
    });
  };

  const handlePlayButtonClick = () => {
    setPlaying(true);
    trackVideoEvent('video_play_button_click', data?.title || 'Unknown Service', {
      video_url: data?.video,
      video_thumbnail: data?.thumbnail
    }, {
      service_name: data?.title,
      page_section: 'service_page'
    });
  };

  if (!data) return <div className="text-center text-white mt-10">Service not found.</div>;

  const gradientClasses = gradientMap[slug as keyof typeof gradientMap] || "from-gray-900 to-black";
  const titleBackground = titleBackgroundMap[slug as keyof typeof titleBackgroundMap] || "bg-black/60";

  // Generate JSON-LD schema for the service
  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `https://aksarbenlocksmiths.com/services/${slug}#service`,
    "name": `${data.title} - ${slug === 'residential' ? 'Residential Locksmith Omaha' : slug === 'automotive' ? 'Car Locksmith Omaha - Auto Locksmith Omaha' : slug === 'extraction' ? 'Emergency Locksmith Omaha - Mobile Locksmith Omaha' : slug === 'duplication' ? 'Key Duplication Omaha' : slug === 'rekeying' ? 'Rekeying Locks Omaha' : 'Commercial Locksmith Omaha'}`,
    "description": `${data.description} Professional ${slug === 'residential' ? 'residential locksmith omaha' : slug === 'automotive' ? 'car locksmith omaha and auto locksmith omaha' : slug === 'extraction' ? 'emergency locksmith omaha and mobile locksmith omaha' : slug === 'duplication' ? 'key duplication omaha' : slug === 'rekeying' ? 'rekeying locks omaha' : 'commercial locksmith omaha'} services available 24/7. Trusted omaha locksmith for all your security needs.`,
    "serviceType": slug === 'residential' ? 'Residential Locksmith Omaha Services' : slug === 'automotive' ? 'Car Locksmith Omaha - Auto Locksmith Services' : slug === 'extraction' ? 'Emergency Locksmith Omaha - 24 Hour Locksmith Omaha' : slug === 'duplication' ? 'Key Duplication Omaha Services' : slug === 'rekeying' ? 'Rekeying Locks Omaha Services' : 'Commercial Locksmith Omaha Services',
    "provider": {
      "@type": "LocalBusiness",
      "name": "Aksarben Locksmiths",
      "image": "https://aksarbenlocksmiths.com/images/shield-logo.png",
      "url": "https://aksarbenlocksmiths.com",
      "telephone": "+14025566715",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Mobile Locksmith Service – No Walk-Ins",
        "addressLocality": "Omaha",
        "addressRegion": "NE",
        "postalCode": "68144",
        "addressCountry": "US"
      }
    },
    "areaServed": {
      "@type": "Place",
      "name": "Omaha, NE"
    },
    "availableChannel": {
      "@type": "ServiceChannel",
      "serviceUrl": `https://aksarbenlocksmiths.com/services/${slug}`
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Helmet>
        <title>{slug === 'residential' ? 'Residential Locksmith Omaha - 24 Hour Emergency Home Lockout Services' : slug === 'automotive' ? 'Car Locksmith Omaha - 24 Hour Auto Locksmith Services | Emergency Vehicle Lockouts' : slug === 'extraction' ? 'Emergency Locksmith Omaha - 24 Hour Mobile Locksmith | Broken Key Extraction' : slug === 'duplication' ? 'Key Duplication Omaha - Mobile Locksmith Services | 24 Hour Key Cutting' : slug === 'rekeying' ? 'Rekeying Locks Omaha - 24 Hour Locksmith Services | Lock Rekeying' : 'Commercial Locksmith Omaha - 24 Hour Business Locksmith Services'}</title>
        <meta name="description" content={`${slug === 'residential' ? 'Residential locksmith omaha providing 24 hour emergency home lockout services. Trusted omaha locksmith' : slug === 'automotive' ? 'Car locksmith omaha and auto locksmith omaha services. 24 hour locksmith omaha for vehicle lockouts' : slug === 'extraction' ? 'Emergency locksmith omaha and mobile locksmith omaha for broken key extraction. 24 hour locksmith omaha' : slug === 'duplication' ? 'Key duplication omaha services by mobile locksmith omaha. Professional omaha locksmith' : slug === 'rekeying' ? 'Rekeying locks omaha services. 24 hour locksmith omaha for lock rekeying' : 'Commercial locksmith omaha for business security. Professional omaha locksmith'}. Call (402) 556-6715 for fast, professional locksmith near me omaha services.`} />
        <meta property="og:type" content="service" />
        <meta property="og:title" content={`${data.title} - Aksarben Locksmiths`} />
        <meta property="og:description" content={data.description} />
        <meta property="og:image" content={`https://aksarbenlocksmiths.com${data.thumbnail}`} />
        <meta property="og:url" content={`https://aksarbenlocksmiths.com/services/${slug}`} />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:image" content={`https://aksarbenlocksmiths.com${data.thumbnail}`} />
        <link rel="canonical" href={`https://aksarbenlocksmiths.com/services/${slug}`} />
        <script type="application/ld+json">
          {JSON.stringify(jsonLdSchema)}
        </script>
        
        {slug === 'residential' && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "How fast can a residential locksmith arrive in Omaha?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Available 24/7 for residential lockouts across Omaha with reliable emergency response."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can you rekey my home locks after a move?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, we offer fast home lock rekeying services to ensure your security after moving."
                  }
                }
              ]
            })}
          </script>
        )}

        {slug === 'automotive' && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "Can you unlock any car make or model?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, we handle all car brands, makes, and models for lockouts and key extractions."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What if my keys are locked in the trunk?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Our locksmiths are trained to safely access locked trunks without damaging the vehicle."
                  }
                }
              ]
            })}
          </script>
        )}

        {slug === 'extraction' && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "What should I do if my key breaks off in the lock?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Do not try to extract it yourself. Call us immediately for professional broken key extraction."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is it safe to remove a key from a jammed ignition?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, our experts use specialized tools to extract keys without damaging your ignition."
                  }
                }
              ]
            })}
          </script>
        )}

        {slug === 'duplication' && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "Do you offer car key duplication with chips?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, we duplicate all types of keys, including transponder and chipped keys."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How long does it take to duplicate a house key?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "House key duplication usually takes under 5 minutes per key."
                  }
                }
              ]
            })}
          </script>
        )}

        {slug === 'rekeying' && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "Why should I rekey instead of replacing locks?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Rekeying is faster and more cost-effective, especially when your existing locks are in good condition."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can I rekey all my doors to one key?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, we can rekey all compatible locks so they work with a single key for convenience."
                  }
                }
              ]
            })}
          </script>
        )}

        {slug === 'consultation' && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "What does a locksmith consultation include?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "We assess your home or business security and recommend lock upgrades or smart systems."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is the consultation really free?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, we offer free consultations so you can understand your security risks before committing."
                  }
                }
              ]
            })}
          </script>
        )}

        {slug === "emergency" && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "What qualifies as a locksmith emergency?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Situations like home lockouts, broken keys, or urgent security breaches qualify as emergencies. We respond 24/7."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How fast can an emergency locksmith arrive?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Our team typically arrives within 20 to 30 minutes anywhere in the Omaha area."
                  }
                }
              ]
            })}
          </script>
        )}

        {slug === "lock-repair" && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "Can you repair all types of locks?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, we repair deadbolts, door knobs, high-security locks, and more."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Do I need to replace my lock or can it be fixed?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Many locks can be repaired without replacement. We assess the damage and recommend the best option."
                  }
                }
              ]
            })}
          </script>
        )}
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": `${data.title}`,
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "reviewCount": "225"
            }
          })}
        </script>
      </Helmet>
      
      {/* Black Top Bar */}
      <div className="fixed top-0 w-full z-50 bg-black backdrop-blur-md shadow-lg text-sm px-4 py-1 flex justify-between items-center">
        <span className="text-white animate-pulse">24/7 Emergency Service</span>
        <a
          href="tel:+14025566715"
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
        className="fixed inset-0 w-full h-full object-cover opacity-45 z-0"
        src="/videos/wallpaper.mp4"
      />
      <div className={`relative z-10 min-h-screen bg-gradient-to-br ${gradientClasses} backdrop-blur-sm px-6 py-12 pt-16 text-white`}>
        <button
          onClick={(e) => {
            navigate("/", { state: { scrollTo: "services", restorePosition: true } });
            trackClick('back_to_services', e.currentTarget, { 
              from_service: data.title,
              service_name: data.title,
              page_section: 'service_page'
            });
          }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[linear-gradient(to_left,_#7f1d1d,_#991b1b,_#ef4444,_#b91c1c,_#991b1b,_#7f1d1d)] bg-[length:800%_100%] animate-[redHeatWave_3s_linear_infinite] text-white text-sm shadow-[0_0_24px_rgba(255,255,255,0.5)] hover:brightness-125 hover:scale-105 transition duration-300 ease-in-out mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Services
        </button>
        
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
            </button>
          )}

          {playing && (
            <video
              ref={setVideoRef}
              title={`${data.title} service demonstration video`}
              className="w-full h-full object-cover"
              src={data.video}
              controls
              autoPlay
              onPlay={handleVideoPlay}
              onPause={handleVideoPause}
              onEnded={handleVideoEnded}
            />
          )}
        </div>
        <div className="bg-white/10 backdrop-blur-2xl rounded-xl px-6 py-5 text-white/90 text-base leading-relaxed shadow-[0_0_24px_rgba(255,255,255,0.5)] max-w-3xl w-full mx-auto mt-6">
          <p className="font-semibold">
            {data.description}
          </p>
        </div>
        
        <div className="flex justify-center mt-8">
          <a 
            href="tel:+14025566715" 
            onClick={(e) => trackClick('service_page_request_service', e.currentTarget, { 
              service: data.title,
              service_name: data.title,
              phone_number: '+14025566715',
              page_section: 'service_page'
            })}
            className="bg-gradient-to-l from-red-900 via-red-600 to-red-800 text-white py-3 px-6 rounded-full shadow-[0_0_24px_rgba(255,255,255,0.5)] hover:brightness-125 hover:scale-105 transition duration-300 ease-in-out animate-[pulseRedGlow_3s_ease-in-out_infinite] inline-block"
          >
            Request Service
          </a>
        </div>
        
        <div className="text-sm mt-12 text-white">
          <strong>More Locksmith Services:</strong>
          <ul className="list-disc list-inside space-y-1 mt-2">
            {allServices
              .filter(service => service.slug !== slug)
              .map(service => (
                <li key={service.slug}>
                  <a 
                    href={`/services/${service.slug}`} 
                    onClick={(e) => trackClick('internal_service_link', e.currentTarget, {
                      from_service: data.title,
                      to_service: service.title,
                      page_section: 'more_services'
                    })}
                    className="hover:underline"
                  >
                    {service.title}
                  </a>
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
           'commercial locksmith omaha, emergency locksmith omaha, 24 hour locksmith omaha, locksmith near me omaha, omaha locksmith commercial services, mobile locksmith omaha'}
        </div>
      </div>
    </div>
  );
}