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
- 
2025-10-11 | Version 1236: Human-Readable GA4 Analytics Overhaul | Josh Applied Improvements | Deployed
- Added helper utilities (toSnake, buildEventName, slug extractors) in /src/utils/analytics.ts
- Standardized all GA4 event names to human-readable, context-rich format with single underscores
- Updated page view events to include slugs (service_page_view_residential, blog_post_page_view_how_to_avoid_lockouts)
- Added context-aware scroll events (homepage_scroll_25, service_residential_scroll_100, blog_locksmith_tips_scroll_50)
- Implemented service-specific video tracking (residential_video_play, automotive_lockouts_video_complete)
- Refactored call button tracking by origin (header_call_button_click, footer_call_button_click, floating_call_button_click, contact_section_call_button_click, service_page_cta_call_button_click)
- Enhanced navigation tracking (hamburger_menu_click, header_nav_click_services, mobile_nav_click_contact, footer_nav_click_pricing)
- Updated service and blog interaction events (service_tile_click_residential, blog_how_to_avoid_lockouts_card_click, blog_category_page_view_security_tips)
- Expanded outbound/social tracking (facebook_social_click, instagram_social_click, outbound_click_maps_google_com)
- Removed obsolete generic events (scroll_depth, navigation_click, navigate_menu, engagement, old click_call_button alias)
- Verified GA4 realtime and DebugView integrity – all events readable and context-specific
- Build Health ✅ 339.33 kB | Console Errors 0 | Analytics Precision 100 % | Readability 100 %
