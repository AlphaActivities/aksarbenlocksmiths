import React from "react";
import { useSearchParams, Link, useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { posts as BLOG_POSTS } from "../data/posts";
import servicesData from "../data/services.json";
import { trackEvent, trackClick, getAttributionParams, buildEventName } from "../utils/analytics";

function norm(x: any) {
  return String(x ?? "").toLowerCase().trim();
}

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = norm(params.get("q"));
  const pageSection = "search_results";
  const navigate = useNavigate();
  const location = useLocation();

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

      <div className="relative min-h-screen">
        <div className="absolute inset-0 pointer-events-none">
          <div className="animated-footer-bg" />
          <div className="footer-glass-effect absolute inset-0" />
        </div>
        <div className="absolute inset-0 z-[3] pointer-events-none bg-black/25 md:bg-black/10"></div>

        <div className="relative z-10 text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <button
              onClick={(e) => {
                if (typeof window !== "undefined" && window.history.length >= 2) {
                  navigate(-1);
                } else {
                  navigate("/", { state: { restorePosition: true } });
                }
                trackClick?.("search_back_to_home_click", e.currentTarget as unknown as HTMLElement, {
                  source_page: "search",
                  page_section: "header",
                  destination: "/",
                  from_path: location?.pathname + location?.search,
                });
              }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[linear-gradient(to_left,_#7f1d1d,_#991b1b,_#ef4444,_#b91c1c,_#991b1b,_#7f1d1d)] bg-[length:800%_100%] animate-[redHeatWave_3s_linear_infinite] text-white text-sm shadow-[0_0_24px_rgba(255,255,255,0.5)] hover:brightness-125 hover:scale-105 transition duration-300 ease-in-out"
              aria-label="Back to Home"
              title="Back to Home"
            >
              <span className="inline-block w-0 h-0 border-t-4 border-b-4 border-r-8 border-t-transparent border-b-transparent border-r-white"></span>
              Back to Home
            </button>
          </div>

          <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-10">
            <div className="purple-heat bg-opacity-60 backdrop-blur-lg rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 max-w-3xl mx-auto px-6 md:px-8 py-5 md:py-7">
              <h1 className="text-center text-2xl md:text-4xl font-extrabold tracking-tight">
                Search
              </h1>
              <p className="sr-only">Find services and blog posts on Aksarben Locksmiths.</p>
            </div>
          </section>

          <main className="max-w-4xl mx-auto px-4 py-8">
            {!q || q.length < 2 ? (
              <div className="mt-6 bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                <p className="text-white/90">
                  Start typing to search services &amp; blog posts. Enter at least <span className="font-semibold">2 characters</span>.
                </p>
              </div>
            ) : (
              <>
                <p className="text-white/80 mb-4">
                  Showing results for <span className="font-semibold">{q}</span>.{" "}
                  {serviceResults.length + blogResults.length} results found.
                </p>

                <div className="bg-black/40 border border-white/10 rounded-2xl p-2 md:p-4 backdrop-blur-md max-w-3xl mx-auto">
                  {serviceResults.length > 0 && (
                    <section aria-label="Service results" className="mb-4">
                      <h2 className="text-white/90 font-semibold px-2 md:px-3 mb-2">Services</h2>
                      <ul className="space-y-2">
                        {serviceResults.map((s: any) => (
                          <li key={s.slug}>
                            <Link
                              to={`/services/${s.slug}`}
                              className="block rounded-xl px-3 py-3 bg-white/5 hover:bg-white/10 transition"
                              onClick={(e) => {
                                trackClick?.(
                                  buildEventName({ base: "search_service", slug: s.slug, action: "result_click" }),
                                  e.currentTarget as unknown as HTMLElement,
                                  { source_page: "search", q, destination: `/services/${s.slug}` }
                                );
                              }}
                            >
                              {s.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {blogResults.length > 0 && (
                    <section aria-label="Blog results" className="mt-4">
                      <h2 className="text-white/90 font-semibold px-2 md:px-3 mb-2">Blog</h2>
                      <ul className="space-y-2">
                        {blogResults.map((p: any) => (
                          <li key={p.slug}>
                            <Link
                              to={`/blog/${p.slug}`}
                              className="block rounded-xl px-3 py-3 bg-white/5 hover:bg-white/10 transition"
                              onClick={(e) => {
                                trackClick?.(
                                  buildEventName({ base: "search_blog", slug: p.slug, action: "result_click" }),
                                  e.currentTarget as unknown as HTMLElement,
                                  { source_page: "search", q, destination: `/blog/${p.slug}`, category: p.category }
                                );
                              }}
                            >
                              {p.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {serviceResults.length + blogResults.length === 0 && (
                    <div className="px-3 py-6">
                      <p className="text-white/80">No results for "{q}". Try another term.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}