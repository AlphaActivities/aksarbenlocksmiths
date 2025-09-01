import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { BLOG_CATEGORIES, BLOG_POSTS, BlogCategory } from "../data/blogPosts";
import { trackEngagement, trackClick } from "../utils/analytics";
import { ArrowLeft, Phone } from "lucide-react";

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
          <div className="relative z-10 text-white pt-12 md:pt-14">
            <main id="blog" className="min-h-screen w-full px-4 py-12 md:py-16">
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
                <div className="mb-6 flex items-center justify-between">
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
                </div>

                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Aksarben Locksmiths Blog
                </h1>
                <p className="mt-3 text-base md:text-lg text-gray-200">
                  Helpful tips and locksmith insights for Omaha, Bellevue, Council Bluffs, Papillion, La Vista, Gretna, and nearby communities.
                </p>

                {/* Category filter */}
                <div className="mt-6 flex flex-wrap items-center gap-2">
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
                          "px-4 py-2 rounded-full text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black",
                          isActive
                            ? "bg-purple-600"
                            : "bg-neutral-800 hover:bg-neutral-700"
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
                      className="rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-colors"
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
                        <div className="aspect-[16/9] w-full bg-neutral-800">
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            loading="lazy"
                            decoding="async"
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
              </section>
            </main>
          </div>
        </main>
      </div>
    </>
  );
}