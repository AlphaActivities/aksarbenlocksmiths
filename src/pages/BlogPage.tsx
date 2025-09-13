import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { BLOG_CATEGORIES, BLOG_POSTS, BlogCategory } from "../data/blogPosts";
import { trackEngagement, trackClick } from "../utils/analytics";
import { ArrowLeft, Phone, MapPin } from "lucide-react";

const BLOG_PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 675'><rect fill='#111827' width='1200' height='675'/><text x='50%' y='50%' fill='#9CA3AF' font-family='system-ui, -apple-system, Segoe UI, Roboto' font-size='48' text-anchor='middle' dominant-baseline='middle'>Aksarben Blog Image</text></svg>`
  );

export default function BlogPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const initialCat = (params.get("cat") as BlogCategory) || "emergency";
  const [activeCat, setActiveCat] = useState<BlogCategory>(initialCat);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Impression event for the list view
    try {
      trackEngagement?.(
        "blog_list_impression",
        listRef.current,
        { source_page: "blog_index", page_section: "list", item_count: BLOG_POSTS.length }
      );
    } catch {}
  }, []);

  useEffect(() => {
    setParams({ cat: activeCat }, { replace: true });
  }, [activeCat, setParams]);

  const filtered = useMemo(
    () => BLOG_POSTS.filter((p) => p.category === activeCat),
    [activeCat]
  );

  return (
    <>
      {/* Fixed black emergency bar */}
      <div className="fixed top-0 w-full z-50 bg-black backdrop-blur-md shadow-lg text-sm px-4 py-1 flex justify-between items-center">
        <span className="text-white animate-pulse">24/7 Emergency Service</span>
        <a
          href="tel:+14025566715"
          onClick={(e) =>
            trackClick("top_bar_phone_click", e.currentTarget, {
              phone_number: "+14025566715",
              source: "top_emergency_bar",
              page_section: "emergency_top_bar",
            })
          }
          className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition animate-pulse"
        >
          <Phone className="h-4 w-4" />
          (402) 556-6715
        </a>
      </div>

      {/* Service Areas style wallpaper and overlays */}
      <div className="min-h-screen w-full relative">
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
          <div className="absolute inset-0 pointer-events-none">
            <div className="animated-footer-bg" />
            <div className="footer-glass-effect absolute inset-0" />
          </div>
          <div className="absolute inset-0 z-[3] pointer-events-none bg-black/25 md:bg-black/10"></div>

          {/* Content */}
          <div className="relative z-10 text-white pt-8 md:pt-10">
            <main id="blog" className="min-h-screen w-full px-6 pt-4 pb-12 md:pt-6 md:pb-16">
              <Helmet>
                <title>Our Blog, Omaha Locksmith Tips and Guides</title>
                <meta
                  name="description"
                  content="Emergency lockouts, keys and duplication, residential and commercial security for Omaha and surrounding cities."
                />
                <link rel="canonical" href="/blog" />
              </Helmet>

              <section className="mx-auto max-w-5xl">
                {/* Back to Home button, matches Dynamic Service styles */}
                <div className="mb-4 flex items-center justify-between">
                  <button
                    onClick={(e) => {
                      navigate(-1);
                      trackClick("back_to_home", e.currentTarget, {
                        source_page: "blog_index",
                        page_section: "header",
                        destination: "/",
                      });
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[linear-gradient(to_left,_#7f1d1d,_#991b1b,_#ef4444,_#b91c1c,_#991b1b,_#7f1d1d)] bg-[length:800%_100%] animate-[redHeatWave_3s_linear_infinite] text-white text-sm shadow-[0_0_24px_rgba(255,255,255,0.5)] hover:brightness-125 hover:scale-105 transition duration-300 ease-in-out"
                    aria-label="Back to Home"
                    title="Back to Home"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                  </button>

                  <Link
                    to="/service-areas"
                    state={{ fromBlog: true, scrollFx: "midThenTop" }}
                    onClick={(e) => {
                      try { sessionStorage.setItem("lastScrollY", String(window.scrollY)); } catch {}
                      trackClick("blog_service_areas_pill_click", e.currentTarget, {
                        source_page: "blog_index",
                        page_section: "header",
                        destination: "/service-areas",
                      });
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[linear-gradient(90deg,_#ef4444_0%,_#dc2626_15%,_#b91c1c_45%,_#b91c1c_55%,_#dc2626_85%,_#ef4444_100%)] text-white text-sm shadow-[0_0_24px_rgba(255,255,255,0.5)] hover:brightness-125 hover:scale-105 transition duration-300 ease-in-out"
                    aria-label="View Service Areas"
                    title="View Service Areas"
                  >
                    <MapPin className="w-4 h-4" />
                    Service Areas
                  </Link>
                </div>

                <div className="bg-gradient-to-br from-red-800 via-purple-900 to-purple-950 backdrop-blur-lg rounded-2xl px-6 py-4 mt-8 mb-2 border border-white/10 shadow-xl ring-1 ring-white/20 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
                  <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
                    AksarbenLocksmiths Blog
                  </h1>
                  <p className="mt-3 text-base md:text-lg text-gray-200">
                    Helpful tips and locksmith insights for:<br />
                    Omaha, Bellevue, Council Bluffs, Papillion, La Vista, Gretna, and nearby communities.
                  </p>
                </div>

                {/* Category filter */}
                <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-2">
                  {BLOG_CATEGORIES.map((cat) => {
                    const isActive = cat.slug === activeCat;
                    return (
                      <button
                        key={cat.slug}
                        type="button"
                        onClick={(e) => {
                          setActiveCat(cat.slug);
                          try {
                            trackClick?.("blog_category_click", e.currentTarget, {
                              source_page: "blog_index",
                              page_section: "category_filter",
                              category: cat.slug,
                            });
                          } catch {}
                        }}
                        className={[
                          "px-4 py-2 rounded-full text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black w-full justify-center text-center",
                          isActive
                            ? "bg-purple-600 border border-purple-600 shadow-[0_0_24px_rgba(255,255,255,0.5)] hover:shadow-[0_0_28px_rgba(255,255,255,0.6)]"
                            : "bg-[#2a1645] hover:bg-[#4a2974] border border-[#3a1f5c] shadow-[0_0_24px_rgba(255,255,255,0.5)] hover:shadow-[0_0_28px_rgba(255,255,255,0.6)]"
                        ].join(" ")}
                        aria-pressed={isActive}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>

                {/* Cards */}
                <div ref={listRef} className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {filtered.map((post) => (
                    <article
                      key={post.slug}
                      className="rounded-2xl overflow-hidden bg-[#0f0a1f] border border-neutral-800 hover:border-neutral-700 transition-colors"
                    >
                      <Link
                        to={`/blog/${post.slug}`}
                        aria-label={`Read post: ${post.title}`}
                        onClick={(e) => {
                          try {
                            trackClick?.("blog_card_click", e.currentTarget, {
                              source_page: "blog_index",
                              page_section: "card_grid",
                              slug: post.slug,
                              category: post.category,
                              city: post.city,
                            });
                          } catch {}
                        }}
                        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                      >
                        <div className="aspect-[16/9] w-full bg-[#1a1030]">
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            loading="lazy"
                            decoding="async"
                            width={1280}
                            height={720}
                            srcSet={`${post.coverImage} 1280w`}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            onError={(e) => {
                              const img = e.currentTarget;
                              img.onerror = null;
                              img.src = BLOG_PLACEHOLDER;
                            }}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <div className="text-xs text-gray-400">
                            {post.city} · {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })}
                          </div>
                          <h2 className="mt-1 text-lg font-semibold">{post.title}</h2>
                          <p className="mt-2 text-sm text-gray-300 line-clamp-3">{post.excerpt}</p>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
                {/* Bottom CTA, matches Dynamic Service styling */}
                <div className="flex justify-center mt-10">
                  <a
                    href="tel:+14025566715"
                    onClick={(e) =>
                      trackClick("cta_blog_call_click", e.currentTarget, {
                        source_page: "blog_index",
                        page_section: "bottom_cta",
                        call_reason: "call_now",
                      })
                    }
                    className="inline-flex items-center gap-2 bg-gradient-to-l from-red-900 via-red-600 to-red-800 text-white py-3 px-6 rounded-full shadow-[0_0_24px_rgba(255,255,255,0.5)] hover:brightness-125 hover:scale-105 transition duration-300 ease-in-out animate-[pulseRedGlow_3s_ease-in-out_infinite] whitespace-nowrap leading-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                    aria-label="Call Aksarben Locksmiths"
                    title="Call Aksarben Locksmiths"
                  >
                    <Phone className="h-4 w-4 shrink-0" />
                    <span className="leading-none">Call Now</span>
                  </a>
                </div>
              </section>
            </main>
          </div>
        </main>
      </div>
    </>
  );
}