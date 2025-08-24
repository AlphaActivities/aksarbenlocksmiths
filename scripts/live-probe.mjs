import fs from "node:fs";
const SITE = "https://aksarbenlocksmiths.com/";
const IMG  = "https://aksarbenlocksmiths.com/images/services-thumbnails/home-locksmith-preview.webp";

function pickMeta(html, prop) {
  const re = new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["']`, "i");
  const m = html.match(re);
  return m ? m[1] : null;
}

async function get(url) {
  try {
    const res = await fetch(url, { redirect: "follow" });
    const text = await res.text();
    return { ok: res.ok, status: res.status, text };
  } catch (e) {
    return { ok: false, status: 0, error: String(e) };
  }
}

function firstLines(str, n = 40) {
  return str.split("\n").slice(0, n).join("\n");
}

const out = { site: SITE, checks: {} };

const run = async () => {
  const home = await get(SITE);
  if (!home.ok) {
    out.checks.network = "ENVIRONMENT NETWORK BLOCKED";
    console.log(JSON.stringify(out, null, 2));
    return;
  }

  out.checks.meta = {
    ogUrl:       pickMeta(home.text, "og:url"),
    ogImage:     pickMeta(home.text, "og:image"),
    twitterUrl:  pickMeta(home.text, "twitter:url"),
    twitterImage:pickMeta(home.text, "twitter:image"),
    ga4Present:  /G-R5H0MX6FR2/.test(home.text)
  };

  const robots = await get(SITE + "robots.txt");
  out.checks.robotsTop = robots.ok ? firstLines(robots.text) : `robots fetch failed, status ${robots.status}`;

  const sm = await get(SITE + "sitemap.xml");
  out.checks.sitemapTop = sm.ok ? firstLines(sm.text) : `sitemap fetch failed, status ${sm.status}`;

  const m = sm.ok ? sm.text.match(/<url>\s*<loc>https:\/\/aksarbenlocksmiths\.com\/<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/i) : null;
  out.checks.homeLastmod = m ? m[1] : null;

  out.checks.pass = Boolean(
    out.checks.meta &&
    out.checks.meta.ogUrl === SITE &&
    out.checks.meta.twitterUrl === SITE &&
    out.checks.meta.ogImage === IMG &&
    out.checks.meta.twitterImage === IMG &&
    out.checks.meta.ga4Present === true
  );

  console.log(JSON.stringify(out, null, 2));
};

run();