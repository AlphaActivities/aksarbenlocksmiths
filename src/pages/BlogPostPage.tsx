import React, { useEffect, useMemo, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { BLOG_POSTS, findPost } from "../data/blogPosts";
import { trackEngagement } from "../utils/analytics";

export default function BlogPostPage() {
  const { slug } = useParams();
  const post = useMemo(() => (slug ? findPost(slug) : undefined), [slug]);
  const articleRef = useRef<HTMLElement | null>(null);

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
      <main className="min-h-screen w-full px-4 py-12 md:py-16">
        <section className="mx-auto max-w-5xl text-white">
          <h1 className="text-2xl md:text-3xl font-bold">Post not found</h1>
          <p className="mt-3 text-gray-300">
            The article you are looking for is unavailable.{" "}
            <Link to="/blog" className="text-purple-400 underline">Go back to the blog.</Link>
          </p>
        </section>
      </main>
    );
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const imageAbs = origin + post.coverImage;

  const description = post.excerpt;
  const title = `${post.title} | Aksarben Locksmiths Blog`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    image: [imageAbs],
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Person",
      name: "Mike"
    },
    publisher: {
      "@type": "Organization",
      name: "Aksarben Locksmiths LLC"
    },
    mainEntityOfPage: origin + "/blog/" + post.slug,
    articleSection: post.category,
    description: description,
  };

  const paragraphs = post.body.split("\n\n");

  return (
    <main className="min-h-screen w-full px-4 py-12 md:py-16">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`/blog/${post.slug}`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <article ref={articleRef} className="mx-auto max-w-5xl text-white">
        <div className="aspect-[16/9] w-full bg-neutral-800 rounded-2xl overflow-hidden">
          <img
            src={post.coverImage}
            alt={post.title}
            className="h-full w-full object-cover"
            loading="eager"
          />
        </div>

        <div className="mt-6 text-xs text-gray-400">
          {post.city} · {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })}
        </div>
        <h1 className="mt-1 text-3xl md:text-4xl font-bold tracking-tight">{post.title}</h1>

        <div className="mt-4 space-y-4 text-gray-200 leading-relaxed">
          {paragraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>

        <div className="mt-10">
          <Link
            to="/blog"
            className="inline-flex items-center px-4 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            aria-label="Back to blog index"
          >
            ← Back to Blog
          </Link>
        </div>
      </article>
    </main>
  );
}