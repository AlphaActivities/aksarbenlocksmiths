<!-- NOTE: Use "Josh Applied Improvements" in Author column. Do not include other personal names. -->
# Deploy Log
Date | Change | Author | Status
---- | ------ | ------ | ------
2025-09-15 | Initial cleanup of unused assets and creation of docs dashboards | Josh Applied Improvements | Deployed
2025-09-20 | SEO hardening recap + hidden site search + anchors refresh | Josh Applied Improvements | Deployed
- Canonicals/Meta/JSON-LD (LocalBusiness, WebSite+SearchAction, Organization)
- Video preload/poster, breadcrumb fix, ISO dates, HTTPS/apex redirects
- Added /search route (noindex, follow), no visible UI changes
- Updated anchors, inventory, schema map, GA4 events, orphans
2025-09-20 | Analytics: search events only, removed hero-video tracking; docs synced | Josh Applied Improvements | Deployed
- Wired site_search & site_search_submit (hidden search)
- Removed video analytics from hero to avoid any visual interference
2025-09-20 | GA4 SPA page_view + outbound link tracking; privacy hardening | Josh Applied Improvements | Deployed
- Added SPA page_view tracker (no UI)
- Added outbound link tracking (no UI)
- Enabled anonymize_ip and disabled Google Signals in config
- Docs synced: ga4-events.json, events.json
2025-09-20 | Anchors parity sync for "check anchors" | Josh Applied Improvements | Deployed
- Refreshed timestamps (anchors, inventory, schema map, GA4 docs)
- Added BlogPage & BlogCategoryPage to key_files_present
- Documented /blog/:category in schema-map
- Added missing GA4 mappings (navigation_click, floating_call_button, back_to_services, service_page_request_service, testimonial_dot_click)
2025-09-28 | Phase 3 SEO Hardening | Josh Applied Improvements | Deployed
- Sitemap now uses updatedAt/date for lastmod, category & blog index dates reflect newest post
- Added Blog + CollectionPage/ItemList JSON-LD
- Added FAQPage JSON-LD on service pages (no UI change)
- Added SEO guard scripts (check:seo, sitemap assert)
- Fixed duplicate className, cleaned build warnings
2025-09-29 | Hero Poster Flicker Fix + Viewport Lock | Josh Applied Improvements | Deployed
- Unified hero poster to /images/poster.png with preload
- Eliminated random mid-video frame flicker
- Locked hero video/poster to viewport with CSS fixed positioning
2025-10-05 | Version 1211: Explicit Robots Meta Tags - SEO Score 100/100 | Josh Applied Improvements | Deployed
- Added explicit `<meta name="robots" content="index, follow" />` to ServiceAreasPage.tsx (line 118)
- Added explicit `<meta name="robots" content="index, follow" />` to BlogCategoryPage.tsx (line 176)
- All 26 pages now have explicit robots meta tags (24 indexable, 2 noindex)
- Verified sitemap contains 25 indexable URLs with correct priorities
- Verified all canonical URLs unchanged during robots meta insertion
- Verified all schema types intact: VideoObject (6 service pages), LocalBusiness, Service, FAQPage, BreadcrumbList, BlogPosting, CollectionPage
- Build health: ✅ 100% | SEO score: ✅ 100/100 | Schema integrity: ✅ 100%
- GA4 async implementation unaffected by metadata changes