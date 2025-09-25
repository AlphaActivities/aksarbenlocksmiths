import { describe, it, expect } from "vitest";
import { posts } from "../index";

describe("blog posts aggregator", () => {
  it("exports 12 posts", () => {
    expect(posts.length).toBe(12);
  });

  it("has unique slugs", () => {
    const slugs = posts.map(p => p.slug);
    const set = new Set(slugs);
    expect(set.size).toBe(slugs.length);
  });

  it("uses allowed categories only", () => {
    const allowed = new Set(["emergency", "keys", "residential", "commercial"]);
    for (const p of posts) {
      expect(allowed.has(p.category)).toBe(true);
    }
  });
});