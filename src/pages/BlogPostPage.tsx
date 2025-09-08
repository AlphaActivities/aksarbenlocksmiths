import React, { useEffect, useMemo, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { BLOG_POSTS, findPost } from "../data/blogPosts";
import { trackEngagement, trackClick } from "../utils/analytics";
import { ArrowLeft, Phone } from "lucide-react";

const BLOG_PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 675'><rect fill='#111827' width='1200' height='675'/><text x='50%' y='50%' fill='#9CA3AF' font-family='system-ui, -apple-system, Segoe UI, Roboto' font-size='48' text-anchor='middle' dominant-baseline='middle'>Aksarben Blog Image</text></svg>`
  );

export default function BlogPostPage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const post = useMemo(() => (slug ? findPost(slug) : undefined), [slug]);
  const articleRef = useRef<HTMLElement | null>(null);

  // Schema and URL helpers
  const origin = typeof window !== "undefined" ? window.location.origin : "https://aksarbenlocksmiths.com";
  const imageUrl = `${origin}${post?.coverImage || ""}`;
  const canonicalPath = `/blog/${post?.slug || slug}`;
  const canonicalAbs = origin + canonicalPath;
  const logoAbs = origin + "/images/shield-logo.png";
  const categoryLabel = post ? 
    ({ emergency: "Emergency and Lockouts",
       keys: "Keys and Duplication", 
       residential: "Residential Locksmith",
       commercial: "Commercial Locksmith" } as const)[post.category] || post.category
    : "";

  useEffect(() => {
    if (post) {
      try {
        trackEngagement?.("blog_post_view", articleRef.current, {
          source_page: "blog_post",
          slug: post.slug,
          category: post.category,
          city: post.city,
        });
      } catch {}
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

            <div className="relative z-10 text-white pt-12 md:pt-14">
              <main className="min-h-screen w-full px-4 py-12 md:py-16">
                <section className="mx-auto max-w-5xl text-white">
                  <div className="mb-6 flex items-center justify-between">
                    <button
                      onClick={(e) => {
                        navigate(-1);
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
                    </button>
                  </div>

                  <h1 className="text-2xl md:text-3xl font-bold">Post not found</h1>
                  <p className="mt-3 text-gray-300">
                    The article you are looking for is unavailable.{" "}
                    <Link to="/blog" className="text-purple-400 underline">Go back to the blog.</Link>
                  </p>
                </section>
              </main>
            </div>
          </main>
        </div>
      </>
    );
  }

  const description = post.excerpt;
  const title = `${post.title} | Aksarben Locksmiths Blog`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    image: imageUrl,
    datePublished: post.date,
    dateModified: post.date,
    url: canonicalAbs,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalAbs },
    author: { "@type": "Person", name: "Mike" },
    publisher: {
      "@type": "Organization",
      name: "Aksarben Locksmiths LLC",
      logo: { "@type": "ImageObject", url: logoAbs }
    },
    articleSection: categoryLabel,
    keywords: [categoryLabel, post.city, "Omaha locksmith", "Aksarben Locksmiths"],
    description: post.excerpt
  };

  const breadcrumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: origin + "/" },
      { "@type": "ListItem", position: 2, name: "Blog", item: origin + "/blog" },
      { "@type": "ListItem", position: 3, name: post.title, item: canonicalAbs }
    ]
  };

  const paragraphs = post.body.split("\n\n");

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

          <div className="relative z-10 text-white pt-8 md:pt-10">
            <Helmet>
              <title>{title}</title>
              <meta name="description" content={description} />
              <link rel="canonical" href={canonicalPath} />
              <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
              <script type="application/ld+json">{JSON.stringify(breadcrumbsLd)}</script>
            </Helmet>

            <div className="w-full px-6">
              <div className="mx-auto max-w-5xl pt-4 pb-12 md:pt-6 md:pb-16">
              {/* Back to Home button */}
              <div className="mb-4 flex items-center justify-between">
                <button
                  onClick={(e) => {
                    navigate(-1);
                    trackClick("back_to_home", e.currentTarget, {
                      source_page: "blog_post",
                      page_section: "header",
                      destination: "/",
                      from_post: post.slug,
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
                    <Link to="/blog" className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black">
                      Blog
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
                <div className="aspect-[16/9] w-full bg-neutral-800 rounded-2xl overflow-hidden">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    loading="eager"
                    decoding="async"
                    width={1280}
                    height={720}
                    srcSet={`${post.coverImage} 1280w`}
                    sizes="(min-width: 1280px) 1024px, calc(100vw - 48px)"
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

                  <div className="mt-4 space-y-4 text-gray-200 leading-relaxed">
                    {paragraphs.map((p, idx) => (
                      <p key={idx}>{p}</p>
                    ))}
                  </div>
                </div>
              </article>
            </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}