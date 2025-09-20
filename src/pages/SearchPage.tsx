import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { BLOG_POSTS } from "../data/blogPosts";
import servicesData from "../data/services.json";
import { trackClick, trackEvent, getAttributionParams } from "../utils/analytics";

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

  // Fire site_search when results are known
  React.useEffect(() => {
    if (q && q.length >= 2) {
      const attr = getAttributionParams?.() || {};
      trackEvent("site_search", {
        query: q,
        results_count: resultsCount,
        source: "onsite",
        page_section: pageSection,
        ...attr,
      });
    }
  }, [q, resultsCount]);

  // Form submit → site_search_submit
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const attr = getAttributionParams?.() || {};
    const form = e.currentTarget as HTMLFormElement;
    const val = (form.querySelector("#q") as HTMLInputElement)?.value || "";
    trackEvent("site_search_submit", {
      query: val,
      source: "onsite",
      page_section: pageSection,
      ...attr,
    });
  };
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

      <main className="container mx-auto px-4 py-10">
        <h1 className="sr-only">Site Search</h1>

        {/* Hidden form is optional; we keep the endpoint clean for SEO without adding visible UI */}
        <form action="/search" method="get" hidden onSubmit={onSubmit}>
          <input id="q" name="q" defaultValue={params.get("q") || ""} />
        </form>

        {/* Results only render when a query is present; nothing visible otherwise */}
        {q && (
          <>
            <p className="sr-only">
              Showing {resultsCount} result{resultsCount === 1 ? "" : "s"} for "{q}"
            </p>

            {serviceResults.length > 0 && (
              <section aria-label="Service results">
                <ul>
                  {serviceResults.map((s: any) => (
                    <li key={s.slug}>
                      <Link to={`/services/${s.slug}`}>{s.title}</Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {blogResults.length > 0 && (
              <section aria-label="Blog results">
                <ul>
                  {blogResults.map((p: any) => (
                    <li key={p.slug}>
                      <Link to={`/blog/${p.slug}`}>{p.title}</Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </main>
    </>
  );
}