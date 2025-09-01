import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { BLOG_CATEGORIES, BLOG_POSTS, BlogCategory } from "../data/blogPosts";
import { trackEngagement, trackClick } from "../utils/analytics";

export default function BlogPage() {
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
                  {/* Image placeholder, real assets can replace these paths */}
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
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
  );
}