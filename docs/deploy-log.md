<!-- NOTE: Use "Josh Applied Improvements" in Author column. Do not include other personal names. -->
# Deploy Log
Date | Change | Author | Status
---- | ------ | ------ | ------
2025-09-15 | Initial cleanup of unused assets and creation of docs dashboards | Josh Applied Improvements | Deployed
- Removed deprecated public assets and refreshed docs dashboards
- Synced project inventory and anchor references

2025-09-20 | SEO hardening recap + hidden site search + anchors refresh | Josh Applied Improvements | Deployed
- Updated Canonicals, Meta, and JSON-LD (LocalBusiness, WebSite+SearchAction, Organization)
- Added /search route (noindex, follow) with hidden UI
- Improved video preload/poster, breadcrumb, ISO dates, and HTTPS redirects
- Synced anchors, inventory, schema map, GA4 events, and orphans

2025-09-20 | Analytics: search events only + hero-video tracking removed | Josh Applied Improvements | Deployed
- Wired GA4 site_search & site_search_submit (hidden search)
- Removed hero-video tracking to prevent visual interference

2025-09-20 | GA4 SPA page_view + outbound link tracking + privacy hardening | Josh Applied Improvements | Deployed
- Added SPA page_view tracker (no UI)
- Added outbound link tracking for external anchors
- Enabled anonymize_ip and disabled Google Signals
- Synced ga4-events.json and events.json

2025-09-20 | Anchors parity sync for "check anchors" | Josh Applied Improvements | Deployed
- Refreshed timestamps across anchors, inventory, schema map, and GA4 docs
- Added BlogPage & BlogCategoryPage to key_files_present
- Documented /blog/:category route in schema-map
- Added missing GA4 mappings (navigation_click, floating_call_button, back_to_services, service_page_request_service, testimonial_dot_click)

2025-09-28 | Phase 3 SEO Hardening | Josh Applied Improvements | Deployed
- Sitemap now uses updatedAt/date for lastmod
- Blog category/index dates reflect newest post
- Added Blog + CollectionPage/ItemList JSON-LD
- Added FAQPage JSON-LD on service pages
- Added SEO guard scripts (check:seo, sitemap assert)
- Fixed duplicate className and cleaned build warnings

2025-09-29 | Hero Poster Flicker Fix + Viewport Lock | Josh Applied Improvements | Deployed
- Unified hero poster to /images/poster.png with preload
- Eliminated mid-video flicker and locked hero video/poster to viewport with CSS positioning

2025-10-05 | Version 1211: Explicit Robots Meta Tags – SEO Score 100/100 | Josh Applied Improvements | Deployed
- Added explicit `<meta name="robots" content="index, follow" />` to all indexable pages
- Verified sitemap (25 URLs, correct priorities)
- Confirmed canonical URLs and schema types (VideoObject, LocalBusiness, Service, FAQPage, BreadcrumbList, BlogPosting, CollectionPage)
- Build Health ✅ 100 | SEO Score ✅ 100/100 | Schema Integrity ✅ 100
- GA4 async implementation unaffected

2025-10-07 | Version 1235: Premium App-First Social Deep Linking Suite | Josh Applied Improvements | Deployed
- Added device-aware deep linking for all footer social icons (Facebook, Twitter/X, Google Maps, Yelp)
- Created `/src/utils/openWithAppFallback.ts` with 600 ms timeout and visibilitychange listener
- Facebook → fb://facewebmodal → m.facebook.com fallback
- Twitter/X → twitter://user?screen_name=aksarbenlocks → x.com fallback (corrected handle)
- Google Maps → comgooglemaps:// coordinate scheme → maps.app.goo.gl fallback
- Yelp → yelp:///biz/aksarben-locksmiths-omaha-15 → yelp.com fallback (triple-slash standard)
- Unified analytics: `footer_social_click` with intent:'app_fallback' across all four
- Unified accessibility: aria-labels, focus rings, hover states, keyboard nav parity
- Updated LocalBusiness + Organization JSON-LD sameAs arrays to include Facebook, Twitter/X, Yelp
- Build verification: ✅ Passed | Console Errors 0 | Bundle +1 KB | UX Significant (native app experience)
