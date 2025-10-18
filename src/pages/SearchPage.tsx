import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { posts as BLOG_POSTS } from "../data/posts";
import servicesData from "../data/services.json";
import { trackEvent, getAttributionParams } from "../utils/analytics";

function norm(x: any) {
  return String(x ?? "").toLowerCase().trim();
}

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = norm(params.get("q"));
  const pageSection = "search_results";

  const serviceResults =
    q.length < 2
      ? []
      : (servicesData?.services || []).filter((s: any) =>
          [s.title, s.slug].some((v: any) =>
            norm(v).includes(q)
          )
        );

  const blogResults =
    q.length < 2
      ? []
      : (BLOG_POSTS || []).filter((p: any) =>
          [p.title, p.excerpt, p.slug].some((v: any) =>
            norm(v).includes(q)
          )
        );

  const resultsCount = serviceResults.length + blogResults.length;

  React.useEffect(() => {
    if (!q || q.length < 2) return;
    const t = window.setTimeout(() => {
      const attr = (typeof getAttributionParams === "function" ? getAttributionParams() : {}) || {};
      try {
        trackEvent("search_results_view", {
          ...attr,
          source_page: "search",
          page_section: pageSection,
          q,
          results_count: resultsCount
        });
      } catch {}
    }, 250);
    return () => window.clearTimeout(t);
  }, [q, resultsCount]);

  const showEmptyPrompt = !q || q.length < 2;
  const showNoResults = q && q.length >= 2 && resultsCount === 0;

  return (
    <>
      <Helmet>
        <title>{q ? `Search results for "${q}"` : "Search"} | Aksarben Locksmiths</title>
        {/* Keep search pages out of the index, but let crawlers follow links */}
        <meta name="robots" content="noindex,follow" />
        <link
          rel="canonical"
          href={`https://aksarbenlocksmiths.com/search${q ? `?q=${encodeURIComponent(q)}` : ""}`}
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content={`Search${q ? `: ${q}` : ""} | Aksarben Locksmiths`}
        />
        <meta
          property="og:url"
          content={`https://aksarbenlocksmiths.com/search${q ? `?q=${encodeURIComponent(q)}` : ""}`}
        />
      </Helmet>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">Search</h1>

        <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md text-white">
          {showEmptyPrompt && (
            <div className="text-white/80">
              <p className="mb-2">Type at least <strong>2 characters</strong> to search services and blog posts.</p>
              <p className="text-sm opacity-80">Examples: <em>lockouts</em>, <em>rekey</em>, <em>keys</em>, <em>programming</em></p>
            </div>
          )}

          {!showEmptyPrompt && (
            <>
              <p className="mb-4 text-white/80">
                Showing results for <span className="font-semibold">{q}</span>.{" "}
                {resultsCount} result{resultsCount === 1 ? "" : "s"} found.
              </p>

              {serviceResults.length > 0 && (
                <section aria-label="Service results" className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">Services</h2>
                  <ul className="grid gap-2">
                    {serviceResults.map((s: any) => (
                      <li key={s.slug} className="bg-white/5 hover:bg-white/10 rounded-lg px-4 py-3 transition">
                        <Link to={`/services/${s.slug}`} className="text-white">
                          {s.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {blogResults.length > 0 && (
                <section aria-label="Blog results">
                  <h2 className="text-lg font-semibold mb-2">Blog</h2>
                  <ul className="grid gap-2">
                    {blogResults.map((p: any) => (
                      <li key={p.slug} className="bg-white/5 hover:bg-white/10 rounded-lg px-4 py-3 transition">
                        <Link to={`/blog/${p.slug}`} className="text-white">
                          {p.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {showNoResults && (
                <div className="text-white/80">
                  <p>No results found. Try a different term.</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}