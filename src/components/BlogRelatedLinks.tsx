import React from "react";
import { Link, useLocation } from "react-router-dom";
import { posts as BLOG_POSTS } from "../data/posts";
import { buildEventName, trackEvent } from "../utils/analytics";

type Props = {
  currentSlug: string;
  category: "emergency" | "keys" | "residential" | "commercial";
  max?: number;
  title?: string;
};

/**
 * Related posts for the SAME category, excludes current post.
 * Styled EXACTLY like the DynamicServicePage left link block.
 * Emits: blog_{target_slug}_related_click
 */
export default function BlogRelatedLinks({
  currentSlug,
  category,
  max = 3,
  title = "More in this category",
}: Props) {
  const location = useLocation();

  const items = BLOG_POSTS
    .filter((p) => p.category === category && p.slug !== currentSlug)
    .slice(0, max);

  if (!items.length) return null;

  return (
    <aside className="text-sm mt-12 text-white">
      <strong>{title}</strong>
      <ul className="list-disc list-inside space-y-1 mt-2">
        {items.map((p) => (
          <li key={p.slug}>
            <Link
              to={`/blog/${p.slug}`}
              className="hover:underline"
              onClick={() => {
                const name = buildEventName({
                  base: "blog",
                  slug: p.slug,
                  action: "related_click",
                });
                trackEvent(name, {
                  page_section: "related_posts",
                  page_type: "blog_post",
                  page_path: location.pathname,
                  blog_slug: p.slug,
                  blog_title: p.title,
                  blog_category: p.category,
                });
              }}
            >
              {p.title}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
