import React, { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { posts as BLOG_POSTS, findPost } from "../data/posts";
import { BLOG_CATEGORIES } from "../data/blogCategories";
import { trackClick, buildEventName } from "../utils/analytics";
import { ArrowLeft, Phone } from "lucide-react";
import GlobalVideoSchema from "../components/seo/GlobalVideoSchema";

const BLOG_PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 675'><rect fill='#111827' width='1200' height='675'/><text x='50%' y='50%' fill='#9CA3AF' font-family='system-ui, -apple-system, Segoe UI, Roboto' font-size='48' text-anchor='middle' dominant-baseline='middle'>Aksarben Blog Image</text></svg>`
  );

export default function BlogPostPage() {
  const { slug } = useParams();
  const location = useLocation();
  const post = useMemo(() => (slug ? findPost(slug) : undefined), [slug]);
  const articleRef = useRef<HTMLElement | null>(null);
  const lastTrackedSlug = useRef<string | null>(null);

  const wantsBottomThenTop = (location.state as any)?.scrollFx === "bottomThenTop";

  // Schema and URL helpers - compute before any returns
  const origin = typeof window !== "undefined" ? window.location.origin : "https://aksarbenlocksmiths.com";
  const GLOBAL_OG = origin + "/images/og/home-1200x630.webp";
  const canonicalPath = `/blog/${post?.slug || slug}`;
  const canonicalAbs = origin + canonicalPath;
  const logoAbs = origin + "/images/shield-logo.webp";
  const categoryLabel = post ? (BLOG_CATEGORIES[post.category]?.h1 || "Blog") : "Blog";

  const description = post?.excerpt || "";
  const title = post ? `${post.title} | Aksarben Locksmiths Blog` : "Post not found | Aksarben Locksmiths Blog";
  const paragraphs = post ? post.body.split("\n\n") : [];

  // Compute word count for schema
  const wordCount = useMemo(() => {
    if (!post) return undefined;
    try {
      const text = Array.isArray(paragraphs) ? paragraphs.join(" ") : (post?.content ?? "");
      return text.trim().split(/\s+/).filter(Boolean).length || undefined;
    } catch {
      return undefined;
    }
  }, [paragraphs, post]);

  // PRE-PAINT SNAP to bottom (eliminates any top flash)
  useLayoutEffect(() => {
    console.log("[BlogPost] useLayoutEffect pre-paint → snapToBottom", slug, "wantsBottomThenTop:", wantsBottomThenTop, "scrollY:", window.scrollY);
    if (!wantsBottomThenTop) return;
    const html = document.documentElement;
    const prevInline = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "auto",
    });
    queueMicrotask(() => {
      html.style.scrollBehavior = prevInline;
    });
  }, [wantsBottomThenTop, slug]);

  // POST-PAINT LUXURY RISE to top (same feel as Services)
  useEffect(() => {
    console.log("[BlogPost] useEffect post-paint → smoothToTop", slug, "wantsBottomThenTop:", wantsBottomThenTop);
    if (wantsBottomThenTop) {
      const t = setTimeout(() => {
        console.log("[BlogPost] executing smoothToTop");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
      return () => clearTimeout(t);
    }
    // Fallback for direct loads (keep signature motion): top → bottom
    console.log("[BlogPost] fallback: top → bottom");
    const t = setTimeout(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
    return () => clearTimeout(t);
  }, [wantsBottomThenTop, slug]);

  useEffect(() => {
    if (!post) return;
    if (lastTrackedSlug.current === post.slug) return;
    lastTrackedSlug.current = post.slug;
    try {
      trackEngagement?.("blog_post_view", articleRef.current, {
        source_page: "blog_post",
        slug: post.slug,
        category: post.category,
        city: post.city,
      });
    } catch (_err) {
      // intentional no-op: analytics best-effort
    }
  }, [post]);

  if (!post) {
    return (
      <>
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

        <div className="min-h-screen w-full relative">
          <main className="min-h-screen w-full relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="animated-footer-bg" />
              <div className="footer-glass-effect absolute inset-0" />
            </div>
            <div className="absolute inset-0 z-[3] pointer-events-none bg-black/25 md:bg-black/10"></div>

            <div className="relative z-10 text-white pt-12 md:pt-14">
              <main className="min-h-screen w-full px-4 py-12 md:py-16">
                <section className="mx-auto max-w-5xl text-white">
                  <div className="mb-6 flex items-center justify-between">
                    <Link
                      to="/"
                      onClick={(e) => {
                        trackClick("back_to_home", e.currentTarget, {
                          source_page: "blog_post",
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
                    </Link>
                  </div>

                  <h1 className="text-2xl md:text-3xl font-bold">Post not found</h1>
                  <p className="mt-3 text-gray-300">
                    The article you are looking for is unavailable.{" "}
                    <Link to="/blog/emergency" className="text-purple-400 underline">Go back to the blog.</Link>
                  </p>

                  <div className="mt-4 flex gap-3">
                    <Link
                      to="/"
                      onClick={(e) => {
                        trackClick("not_found_back_home_click", e.currentTarget, {
                          source_page: "blog_post_404",
                          page_section: "not_found",
                        });
                      }}
                      className="inline-flex items-center rounded-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
                      aria-label="Back to Home"
                    >
                      Back to Home
                    </Link>

                    <Link
                      to="/blog/emergency"
                      aria-label="Back to the blog"
                      onClick={(e) =>
                        trackClick("not_found_back_blog_click", e.currentTarget, {
                          source_page: "blog_post_404",
                          page_section: "not_found",
                        })
                      }
                      className="inline-flex items-center rounded-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                    >
                      Go back to the blog
                    </Link>
                  </div>
                </section>
              </main>
            </div>
          </main>
        </div>
      </>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    image: post?.coverImage ? `${origin}${post.coverImage}` : GLOBAL_OG,
    datePublished: post.date,
    dateModified: post.updatedAt || post.date,
    url: canonicalAbs,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalAbs },
    author: { "@type": "Person", name: "Mike" },
    publisher: {
      "@type": "Organization",
      name: "Aksarben Locksmiths LLC",
      logo: { "@type": "ImageObject", url: logoAbs }
    },
    articleSection: categoryLabel,
    keywords: post.keywords && post.keywords.length > 0 ? post.keywords : [categoryLabel, post.city, "Aksarben Locksmiths"],
    description: post.excerpt,
    wordCount: wordCount,
  };

  const breadcrumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${origin}/` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${origin}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: canonicalAbs }
    ]
  };

  return (
    <>
      <div className="fixed top-0 w-full z-50 bg-black backdrop-blur-md shadow-lg text-sm px-4 py-1 flex justify-between items-center">
        <span className="text-white motion-safe:animate-pulse">24/7 Emergency Service</span>
        <a
          href="tel:+14025566715"
          onClick={(e) =>
            trackClick("top_bar_phone_click", e.currentTarget, {
              phone_number: "+14025566715",
              source: "top_emergency_bar",
              page_section: "emergency_top_bar",
            })
          }
          className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition motion-safe:animate-pulse"
        >
          <Phone className="h-4 w-4" />
          (402) 556-6715
        </a>
      </div>

      <div className="min-h-[100svh] w-full relative overflow-x-hidden touch-pan-y overscroll-x-none overscroll-y-contain">
        <main className="min-h-[100svh] w-full relative overflow-visible">
          <video
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
            poster="/images/services-thumbnails/Residential-Service-Photo.webp"
            className="fixed inset-0 w-full h-full object-cover opacity-45 z-0 pointer-events-none"
            src="/videos/wallpaper.mp4"
          />

          <div className="relative z-10 text-white pt-8 md:pt-10 pb-12 md:pb-16 lg:pb-20">
            <Helmet>
              <title>{title}</title>
              <meta name="description" content={description} />
              <link rel="canonical" href={canonicalAbs} />
              <meta name="robots" content="index, follow" />
              <meta property="og:type" content="article" />
              <meta property="og:site_name" content="Aksarben Locksmiths" />
              <meta property="article:section" content={categoryLabel} />
              <meta property="og:title" content={title} />
              <meta property="og:description" content={description} />
              <meta property="og:url" content={canonicalAbs} />
              <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
              <meta property="og:image" content={GLOBAL_OG} />
              <meta property="og:image:width" content="1200" />
              <meta property="og:image:height" content="630" />
              <meta name="twitter:card" content="summary_large_image" />
              <meta name="twitter:title" content={title} />
              <meta name="twitter:description" content={description} />
              <meta name="twitter:image" content={GLOBAL_OG} />
              <meta name="twitter:image:width" content="1200" />
              <meta name="twitter:image:height" content="630" />
              <script type="application/ld+json">{JSON.stringify(breadcrumbsLd)}</script>
            </Helmet>
            <GlobalVideoSchema />

            <div className="w-full px-6">
              <div className="mx-auto max-w-5xl pt-4 pb-6 md:pt-6 md:pb-8">
              {/* Back to Blog button */}
              <div className="mb-4 flex items-center justify-between min-h-[40px]">
                <Link
                  to={`/blog/${post.category}`}
                  onClick={(e) => {
                    console.log("[Link] back to blog click → NO STATE SET →", `/blog/${post.category}`);
                    trackClick("back_to_blog", e.currentTarget as unknown as HTMLElement, {
                      source_page: "blog_post",
                      page_section: "header",
                      destination: `/blog/${post.category}`,
                      from_post: post.slug,
                    });
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[linear-gradient(to_left,_#7f1d1d,_#991b1b,_#ef4444,_#b91c1c,_#991b1b,_#7f1d1d)] bg-[length:800%_100%] animate-[redHeatWave_3s_linear_infinite] text-white text-sm shadow-[0_0_24px_rgba(255,255,255,0.5)] hover:brightness-125 hover:scale-105 transition duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  aria-label="Back to Blog"
                  title="Back to Blog"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Blog
                </Link>
              </div>
              </div>
            </div>

            <div className="mx-auto max-w-5xl px-6">
              <nav className="mb-3 text-sm text-gray-300" aria-label="Breadcrumb">
                <ol className="flex flex-wrap items-center gap-2">
                  <li>
                    <Link to="/" className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black">
                      Home
                    </Link>
                  </li>
                  <li className="text-gray-500">›</li>
                  <li>
                    <Link to={`/blog/${post.category}`} className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black">
                      {categoryLabel}
                    </Link>
                  </li>
                  <li className="text-gray-500">›</li>
                  <li aria-current="page" className="text-gray-200">
                    {post.title}
                  </li>
                </ol>
              </nav>
            </div>

            <div className="mx-auto max-w-5xl px-6">
              <article ref={articleRef} className="text-white">
                <Helmet>
                  <link
                    rel="preload"
                    as="image"
                    href={post.coverImage}
                    imagesizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1024px"
                  />
                </Helmet>
                
                <div className="aspect-[16/9] w-full bg-neutral-800 rounded-2xl overflow-hidden">
                  <img
                    src={post.coverImage}
                    alt={post.altText || post.title}
                    loading="eager"
                    decoding="async"
                    width={1280}
                    height={720}
                    srcSet={`${post.coverImage} 1280w`}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1024px"
                    onError={(e) => {
                      const img = e.currentTarget;
                      img.onerror = null;
                      img.src = BLOG_PLACEHOLDER;
                    }}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Post content container with semi transparent white glow */}
                <div className="bg-white/10 backdrop-blur-2xl rounded-xl px-6 py-5 text-white/90 text-base leading-relaxed shadow-[0_0_24px_rgba(255,255,255,0.5)] max-w-4xl w-full mx-auto mt-6">
                  <div className="text-xs text-gray-400">
                    {post.city} · {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })}
                  </div>
                  <h1 className="mt-1 text-3xl md:text-4xl font-bold tracking-tight">{post.title}</h1>
                  {post.keywords?.length ? (
                    <span className="sr-only">{post.keywords.join(", ")}</span>
                  ) : null}

                  <div className="mt-4 space-y-4 text-gray-200 leading-relaxed">
                    {paragraphs.map((p, idx) => (
                      <p key={idx}>{p}</p>
                    ))}
                  </div>
                </div>
              </article>

              {/* Bottom CTA — matches DynamicServicePage style */}
              <div className="flex justify-center mt-8">
                <a
                  href="tel:+14025566715"
                  onClick={(e) =>
                    trackClick("blog_post_request_service", e.currentTarget, {
                      source_page: "blog_post",
                      page_section: "bottom_cta",
                      phone_number: "+14025566715",
                      from_post: post.slug,
                    })
                  }
                  className="bg-gradient-to-l from-red-900 via-red-600 to-red-800 text-white py-3 px-6 rounded-full shadow-[0_0_24px_rgba(255,255,255,0.5)] hover:brightness-125 hover:scale-105 transition duration-300 ease-in-out animate-[pulseRedGlow_3s_ease-in-out_infinite] inline-block"
                  aria-label="Call now to request service"
                  title="Call now to request service"
                  data-cta="bottom"
                >
                  Request Service
                </a>
              </div>
            </div>

            {/* Related posts — moved outside centered column to match service left lane */}
            <div className="px-6">
              <div className="text-sm mt-12 text-white">
                <strong>More in this category:</strong>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  {BLOG_POSTS
                    .filter((p) => p.category === post.category && p.slug !== post.slug)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 5)
                    .map((p) => (
                      <li key={p.slug}>
                        <Link
                          to={`/blog/${p.slug}`}
                          onClick={(e) =>
                            trackClick(
                              buildEventName({
                                base: "blog",
                                slug: p.slug,
                                action: "related_click",
                              }),
                              e.currentTarget as unknown as HTMLElement,
                              {
                                page_section: "related_posts",
                                page_type: "blog_post",
                                page_path: window.location.pathname,
                                blog_slug: p.slug,
                                blog_title: p.title,
                                blog_category: p.category,
                                from_post: post.slug,
                              }
                            )
                          }
                          className="hover:underline"
                        >
                          {p.title}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
            </div>

            {/* Footer-style animated background layers */}
            <div className="absolute inset-0 pointer-events-none min-h-full">
              <div className="animated-footer-bg" />
              <div className="footer-glass-effect absolute inset-0" />
            </div>

            {/* Contrast overlay, adjust opacity as needed */}
            <div className="absolute inset-0 z-[3] pointer-events-none bg-black/25 md:bg-black/10"></div>
        </main>
      </div>
    </>
  );
}