import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { BLOG_POSTS } from "../data/blogPosts";
import servicesData from "../data/services.json";

function normalize(s: string) {
  return (s || "").toLowerCase().trim();
}

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = normalize(params.get("q") || "");

  const serviceResults =
    q.length < 2
      ? []
      : (servicesData?.services || []).filter((s: any) =>
          [s.title, s.slug].some((v: any) =>
            normalize(String(v)).includes(q)
          )
        );

  const blogResults =
    q.length < 2
      ? []
      : BLOG_POSTS.filter((p: any) =>
          [p.title, p.excerpt, p.slug].some((v: any) =>
            normalize(String(v)).includes(q)
          )
        );

  const resultsCount = serviceResults.length + blogResults.length;

  return (
    <>
      <Helmet>
        <title>{q ? `Search results for "${q}"` : "Search"} | Aksarben Locksmiths</title>
        {/* Prevent thin-content indexing of search pages */}
        <meta name="robots" content="noindex,follow" />
        <link rel="canonical" href={`https://aksarbenlocksmiths.com/search${q ? `?q=${encodeURIComponent(q)}` : ""}`} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`Search${q ? `: ${q}` : ""} | Aksarben Locksmiths`} />
        <meta property="og:url" content={`https://aksarbenlocksmiths.com/search${q ? `?q=${encodeURIComponent(q)}` : ""}`} />
      </Helmet>

      <main className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-4">Search</h1>

        {/* Simple search form that preserves q param */}
        <form action="/search" method="get" className="mb-6">
          <label className="sr-only" htmlFor="q">Search Aksarben Locksmiths</label>
          <input
            id="q"
            name="q"
            defaultValue={params.get("q") || ""}
            placeholder="Search services or blog posts…"
            className="w-full max-w-xl border rounded-xl px-4 py-3"
            aria-label="Search Aksarben Locksmiths"
          />
        </form>

        {q ? (
          <p className="mb-6 text-muted-foreground">
            Showing {resultsCount} result{resultsCount === 1 ? "" : "s"} for <strong>"{q}"</strong>
          </p>
        ) : (
          <p className="mb-6 text-muted-foreground">Type at least two letters to see results.</p>
        )}

        {serviceResults.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-3">Services</h2>
            <ul className="space-y-2">
              {serviceResults.map((s: any) => (
                <li key={s.slug}>
                  <Link className="underline" to={`/services/${s.slug}`}>{s.title}</Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {blogResults.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-3">Blog Posts</h2>
            <ul className="space-y-2">
              {blogResults.map((p: any) => (
                <li key={p.slug}>
                  <Link className="underline" to={`/blog/${p.slug}`}>{p.title}</Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </>
  );
}