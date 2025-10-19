import React, { useEffect, useRef } from "react";
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
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try { (document.body as HTMLElement)?.focus?.(); } catch {}
  }, []);

  function handleInlineSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const term = (new FormData(form).get("q") as string) ?? "";
    try {
      trackClick?.("search_page_search_submit", form as unknown as HTMLElement, {
        source_page: "search",
        page_section: "inline_search",
        q: term,
      });
    } catch {}
    navigate(`/search?q=${encodeURIComponent(term)}`, {
      replace: true,
      state: (location.state as any) || undefined,
    });
  }

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

  React.useEffect(() => {
    if ((location.state as any)?.fromFooter) {
      try { sessionStorage.setItem("cameFromFooter", "1"); } catch {}
    }
  }, [location.state]);

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
                try {
                  trackClick?.("search_back_to_home", e.currentTarget as unknown as HTMLElement, {
                    source_page: "search",
                    page_section: "header",
                    destination: "/",
                  });
                } catch {}
                const cameFromFooter =
                  ((location.state as any)?.fromFooter === true) ||
                  (typeof window !== "undefined" &&
                   sessionStorage.getItem("cameFromFooter") === "1");

                navigate("/", {
                  replace: true,
                  state: cameFromFooter
                    ? { scrollTo: "footer", fromSearch: true }
                    : { restorePosition: true, fromSearch: true },
                });

                if (cameFromFooter) {
                  try { sessionStorage.removeItem("cameFromFooter"); } catch {}
                }
              }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[linear-gradient(to_left,_#7f1d1d,_#991b1b,_#ef4444,_#b91c1c,_#991b1b,_#7f1d1d)] bg-[length:800%_100%] animate-[redHeatWave_3s_linear_infinite] text-white text-sm shadow-[0_0_24px_rgba(255,255,255,0.5)] hover:brightness-110 transition duration-300 ease-in-out"
              aria-label="Back to Home"
              title="Back to Home"
            >
              <span className="inline-block w-0 h-0 border-t-4 border-b-4 border-r-8 border-t-transparent border-b-transparent border-r-white"></span>
              Back to Home
            </button>
          </div>

          <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-10">
            <div className="search-hero-gradient max-w-3xl mx-auto rounded-3xl px-6 py-5 text-center text-white border border-white/10 shadow-2xl">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Search</h1>
              <p className="sr-only">Find services and blog posts on Aksarben Locksmiths.</p>
            </div>
          </section>

          <form
            onSubmit={handleInlineSubmit}
            className="max-w-lg w-full mx-auto px-6 md:px-0 mt-4 flex items-center gap-2"
            aria-label="Refine your search"
          >
            <label htmlFor="search-inline" className="sr-only">Search</label>
            <input
              id="search-inline"
              name="q"
              ref={inputRef}
              defaultValue={q || ""}
              placeholder="Search services & blog…"
              className="w-full rounded-xl bg-white/10 text-white placeholder-white/60 border border-white/20 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/40"
              autoComplete="off"
            />
            <button
              type="submit"
              className="rounded-xl px-4 py-2 text-sm font-medium text-white bg-[linear-gradient(to_left,_#7f1d1d,_#991b1b,_#ef4444,_#b91c1c,_#991b1b,_#7f1d1d)] bg-[length:800%_100%] animate-[redHeatWaveReverse_3s_linear_infinite] hover:brightness-110 transition border border-white/10 shrink-0"
            >
              Search
            </button>
          </form>

          <main className="max-w-4xl mx-auto px-4 py-8">
            {!q || q.length < 2 ? (
              <div className="mt-6 bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                <p className="text-white/90">
                  Start typing to search services &amp; blog posts. Enter at least <span className="font-semibold">2 characters</span>.
                </p>
              </div>
            ) : (
              <>
                <div className="max-w-3xl mx-auto px-6 md:px-0 mt-4">
                  <p className="text-white/80">
                    Showing results for (
                    <span className="underline underline-offset-2 decoration-white/70">
                      {q || ''}
                    </span>
                    ). {serviceResults.length + blogResults.length} result{serviceResults.length + blogResults.length === 1 ? '' : 's'} found.
                  </p>
                </div>

                <div className="relative mx-auto max-w-3xl mt-6">
                  <div className="relative search-glass search-noise rounded-2xl border border-white/10 overflow-hidden">
                    <div className="aurora-sheen results-aurora-static results-aurora-boost"></div>

                    <div className="relative z-[1] p-4 sm:p-6">
                      {serviceResults.length > 0 && (
                        <section aria-label="Service results" className="mb-5">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full pill-services text-white/90 text-sm mb-3">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-300/90"></span>
                            <span className="font-semibold tracking-wide">Services</span>
                          </div>

                          <ul className="space-y-2">
                            {serviceResults.map((s: any) => (
                              <li key={s.slug}>
                                <Link
                                  to={`/services/${s.slug}`}
                                  state={{ scrollFx: "bottomThenTop" }}
                                  onClick={(e) => {
                                    try {
                                      const ev = buildEventName({ base: "search_service", slug: s.slug, action: "result_click" });
                                      trackClick?.(ev, e.currentTarget, { source_page: "search", page_section: "services", slug: s.slug });
                                    } catch {}
                                  }}
                                  className="group block w-full rounded-xl border border-white/10 bg-white/5 hover:bg-white/[.08] active:bg-white/[.12] transition px-4 py-3 text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,.07)]"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">{s.title}</span>
                                    <span className="opacity-60 text-xs">View</span>
                                  </div>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </section>
                      )}

                      {blogResults.length > 0 && (
                        <section aria-label="Blog results">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full pill-blog text-white/90 text-sm mb-3">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-fuchsia-300/90"></span>
                            <span className="font-semibold tracking-wide">Blog</span>
                          </div>

                          <ul className="space-y-2">
                            {blogResults.map((p: any) => (
                              <li key={p.slug}>
                                <Link
                                  to={`/blog/${p.slug}`}
                                  onClick={(e) => {
                                    try {
                                      const ev = buildEventName({ base: "search_blog", slug: p.slug, action: "result_click" });
                                      trackClick?.(ev, e.currentTarget, { source_page: "search", page_section: "blog", slug: p.slug });
                                    } catch {}
                                  }}
                                  className="group block w-full rounded-xl border border-white/10 bg-white/5 hover:bg-white/[.08] active:bg-white/[.12] transition px-4 py-3 text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,.07)]"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">{p.title}</span>
                                    <span className="opacity-60 text-xs">Read</span>
                                  </div>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </section>
                      )}

                      {q && serviceResults.length === 0 && blogResults.length === 0 && (
                        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-6 text-white/80">
                          No results for <span className="underline">({q})</span>. Try a different term.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}