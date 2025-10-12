// Google Analytics 4 utility functions

const GA_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID || 'G-R5H0MX6FR2';

export const DEBUG_ANALYTICS = import.meta.env.DEV && !!localStorage.getItem('DEBUG_ANALYTICS');
const dbg = (...args: any[]) => { if (DEBUG_ANALYTICS) console.log('[ANALYTICS]', ...args); };

// --- Attribution keys and storage ---
const ATTR_LS_KEY = "attr_first_touch";
const ATTR_SS_KEY = "attr_last_touch";
const ATTR_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "wbraid",
  "gbraid",
  "msclkid",
  "fbclid",
];

type AttrBag = Record<string, string | undefined>;

// Parse query string into a simple map
const parseQuery = (search: string): Record<string, string> => {
  const out: Record<string, string> = {};
  const qs = new URLSearchParams(search);
  qs.forEach((v, k) => { out[k] = v; });
  return out;
};

// Read and write storage safely
const readJSON = (key: string): any => {
  try { return JSON.parse(window.localStorage.getItem(key) || window.sessionStorage.getItem(key) || "null"); } catch { return null; }
};
const writeFirst = (data: any) => { try { window.localStorage.setItem(ATTR_LS_KEY, JSON.stringify(data)); } catch {} };
const writeLast  = (data: any) => { try { window.sessionStorage.setItem(ATTR_SS_KEY, JSON.stringify(data)); } catch {} };

function toSnake(s?: string | null): string | undefined {
  if (!s) return undefined;
  return s
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');
}

export function buildEventName(ctx: {
  base: string;
  slug?: string;
  category?: string;
  action?: string;
  percent?: number;
}) {
  const parts = [
    toSnake(ctx.base),
    toSnake(ctx.slug),
    toSnake(ctx.category),
    toSnake(ctx.action),
    ctx.percent ? `scroll_${ctx.percent}` : undefined,
  ].filter(Boolean) as string[];
  return parts.join('_');
}

function getServiceSlugFromPath(pathname: string): string | undefined {
  const m = pathname.match(/^\/services\/([^\/?#]+)/i);
  return m ? toSnake(decodeURIComponent(m[1])) : undefined;
}

function getBlogSlugFromPath(pathname: string): string | undefined {
  const m = pathname.match(/^\/blog\/([^\/?#]+)/i);
  return m ? toSnake(decodeURIComponent(m[1])) : undefined;
}

function getBlogCategoryFromPath(pathname: string): string | undefined {
  const m = pathname.match(/^\/blog\/([^\/\?#]+)\/([^\/?#]+)/i);
  return m ? toSnake(decodeURIComponent(m[1])) : undefined;
}

// Build an attribution object from the current URL and referrer
export const captureAttributionFromURL = (href?: string, referrer?: string) => {
  if (typeof window === "undefined") return;

  const url = href || window.location.href;
  const ref = referrer ?? (document.referrer || undefined);

  const u = new URL(url, window.location.origin);
  const q = parseQuery(u.search);

  // collect any known keys present
  const found: AttrBag = {};
  let hasAny = false;
  for (const k of ATTR_KEYS) {
    if (q[k]) { found[k] = q[k]; hasAny = true; }
  }

  const now = new Date().toISOString();
  const page = u.pathname + u.search + u.hash;

  // Seed first touch once
  const first = readJSON(ATTR_LS_KEY);
  if (!first) {
    const firstTouch = {
      ts: now,
      landing_page: page,
      referrer: ref,
      ...found,
    };
    writeFirst(firstTouch);
  }

  // Always update last touch if we have any campaign params or a ref change
  const last = readJSON(ATTR_SS_KEY) || {};
  const shouldUpdate = hasAny || (ref && ref !== last?.referrer) || !last.ts;
  if (shouldUpdate) {
    const lastTouch = {
      ts: now,
      page,
      referrer: ref,
      ...found,
    };
    writeLast(lastTouch);
  }
};

// Merge first and last into a single payload for events
export const getAttributionParams = (): Record<string, any> => {
  if (typeof window === "undefined") return {};
  const first = readJSON(ATTR_LS_KEY) || {};
  const last  = readJSON(ATTR_SS_KEY) || {};
  const out: Record<string, any> = {};

  // expose first_ and last_ prefixes, plus landing_page and current_page
  for (const [k, v] of Object.entries(first)) out[`first_${k}`] = v;
  for (const [k, v] of Object.entries(last))  out[`last_${k}`]  = v;

  out.landing_page = first.landing_page;
  out.current_page = window.location.pathname + window.location.search + window.location.hash;

  return out;
};

export function getPageType(pathname: string = window.location.pathname):
  'homepage' | 'service_page' | 'service_areas' | 'blog_index' | 'blog_post' | 'blog_category' | 'other' {
  if (pathname === '/') return 'homepage';
  if (pathname === '/service-areas') return 'service_areas';
  if (pathname.startsWith('/services')) return 'service_page';
  if (pathname === '/blog') return 'blog_index';
  if (pathname.startsWith('/blog/')) {
    const segs = pathname.split('/').filter(Boolean);
    return segs.length >= 3 ? 'blog_post' : 'blog_category';
  }
  return 'other';
}

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Load GA4 script and initialize (called once)
let __gaLoaded = false;
export function ensureGA4Loaded() {
  if (typeof window === 'undefined' || __gaLoaded) return;
  if (!GA_ID) {
    console.warn('GA4 ID missing, set VITE_GA4_MEASUREMENT_ID in .env');
    return;
  }

  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments as any); };

  window.gtag('js', new Date());
  window.gtag('config', GA_ID, {
    send_page_view: false,
    anonymize_ip: true,
    allow_google_signals: false
  });

  __gaLoaded = true;
  dbg('GA4 loaded programmatically', GA_ID);
}

// Configure GA4 with debug user ID in development
export const configureGA4 = () => {
  ensureGA4Loaded();

  if (typeof window === 'undefined' || !window.gtag) return;

  const userProps: Record<string, any> = {
    user_type: 'general_visitor',
    visit_intent: 'locksmith_service',
    platform: navigator.platform || 'unknown',
  };

  if (import.meta.env.DEV) {
    userProps.user_id = 'debug-user-josh';
  }

  dbg('user_properties', userProps);
    
  try { captureAttributionFromURL(); } catch {}

  window.gtag('set', 'user_properties', userProps);
    
  const urlParams = new URLSearchParams(window.location.search);
  const utmSource = urlParams.get('utm_source');
  const utmMedium = urlParams.get('utm_medium');
  const utmCampaign = urlParams.get('utm_campaign');

  if (utmSource || utmMedium || utmCampaign) {
    window.gtag('event', 'utm_tracking', {
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
    });

    window.gtag('set', 'user_properties', {
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
    });
  }
};

// ---- Page Views (for SPA route changes) ----
export const trackPageView = (extra: Record<string, any> = {}) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  const page_location = window.location.href;
  const page_path = window.location.pathname + window.location.search + window.location.hash;
  const page_title = document.title;
  const page_type = getPageType(window.location.pathname);

  const baseParams: Record<string, any> = {
    page_location,
    page_path,
    page_title,
    page_type,
    ...getAttributionParams(),
    ...extra,
  };

  const enhanced = { ...baseParams };
  const serviceSlug = page_type === 'service_page' ? getServiceSlugFromPath(window.location.pathname) : undefined;
  const blogSlug = page_type === 'blog_post' ? getBlogSlugFromPath(window.location.pathname) : undefined;
  const categorySlug = page_type === 'blog_category' ? getBlogCategoryFromPath(window.location.pathname) : undefined;

  if (serviceSlug) enhanced.service_slug = serviceSlug;
  if (blogSlug) enhanced.blog_slug = blogSlug;
  if (categorySlug) enhanced.category_slug = categorySlug;

  const pvBaseMap: Record<string, string> = {
    homepage: 'homepage_page_view',
    service_page: 'service_page_view',
    blog_index: 'blog_index_page_view',
    blog_post: 'blog_post_page_view',
    blog_category: 'blog_category_page_view',
    service_areas: 'service_areas_page_view',
    pricing: 'pricing_page_view',
    contact: 'contact_page_view',
    search: 'search_page_view',
  };

  const baseName = pvBaseMap[page_type] || 'page_view';
  const finalName = buildEventName({
    base: baseName,
    slug: serviceSlug || blogSlug || categorySlug,
  });

  window.gtag('event', finalName, enhanced);

  dbg('events_fired', { events: [finalName], params: enhanced });
};

// ---- Outbound link tracking (one-time document listener) ----
let __outboundHooked = false;
export const initOutboundLinkTracking = () => {
  if (typeof window === 'undefined' || __outboundHooked) return;
  __outboundHooked = true;

  document.addEventListener('click', (e) => {
    const el = (e.target as HTMLElement)?.closest?.('a[href]');
    if (!el) return;

    const href = el.getAttribute('href') || '';

    // Ignore phone, email, and in-page anchors
    if (href.startsWith('tel:') || href.startsWith('mailto:') || href.startsWith('#')) return;

    let url: URL;
    try {
      url = new URL(href, window.location.origin);
    } catch {
      return;
    }

    const isExternal = url.origin !== window.location.origin;
    if (!isExternal) return;

    dbg('outbound_click', url.href, el.textContent || '');

    if (window.gtag) {
      const attr = (typeof getAttributionParams === 'function' ? getAttributionParams() : {}) || {};
      const domain = toSnake(url.hostname.replace(/^www\./, ''));
      const eventName = buildEventName({ base: 'outbound_click', slug: domain });
      window.gtag('event', eventName, {
        event_category: 'navigation',
        target_url: url.href,
        target_domain: url.hostname,
        link_text: el.textContent || '',
        ...attr,
      });
    }
  }, { capture: true });
};

export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

export const trackClick = (eventName: string, element?: HTMLElement, additionalParams: Record<string, any> = {}) => {
  if (typeof window.gtag !== 'function') return;

  const elementData = element ? {
    element_text: element.innerText || element.textContent || '',
    target_url: element.getAttribute('href') || undefined,
    page_section: element.closest('section')?.id || element.closest('[id]')?.id || 'unknown'
  } : {};

  const attribution = getAttributionParams();

  window.gtag('event', eventName, {
    event_category: 'click',
    page_type: getPageType(window.location.pathname),
    ...elementData,
    ...attribution,
    ...additionalParams,
  });

  // Fire alias events for specific tracking needs (removed generic click_call_button aliasing)
  const emailEvents = ['footer_email_click', 'contact_email_click'];
  const pricingEvents = ['pricing_cta_click'];
  const serviceViewEvents = ['service_tile_click'];
  const testimonialEvents = ['testimonial_view', 'testimonial_arrow_click', 'testimonial_dot_click'];
  const socialEvents = ['footer_social_click'];
  const logoEvents = ['logo_click'];

  if (emailEvents.includes(eventName)) {
    window.gtag('event', 'click_email_button', {
      event_category: 'click',
      service_type: additionalParams.service_type || additionalParams.service_name || 'unknown',
      phone_number: additionalParams.phone_number || undefined,
      page_section: additionalParams.page_section || elementData.page_section || 'unknown',
      ...elementData,
      ...additionalParams,
    });
  }

  if (pricingEvents.includes(eventName)) {
    window.gtag('event', 'click_pricing_button', {
      event_category: 'click',
      service_type: additionalParams.service_type || additionalParams.service_name || 'unknown',
      phone_number: additionalParams.phone_number || undefined,
      page_section: additionalParams.page_section || elementData.page_section || 'unknown',
      ...elementData,
      ...additionalParams,
    });
  }

  if (serviceViewEvents.includes(eventName)) {
    window.gtag('event', 'view_service', {
      event_category: 'engagement',
      service_type: additionalParams.service_type || additionalParams.service_name || 'unknown',
      page_section: additionalParams.page_section || elementData.page_section || 'unknown',
      ...elementData,
      ...additionalParams,
    });
  }

  if (testimonialEvents.includes(eventName)) {
    window.gtag('event', 'engage_testimonial', {
      event_category: 'engagement',
      page_section: additionalParams.page_section || elementData.page_section || 'unknown',
      ...elementData,
      ...additionalParams,
    });
  }


  if (videoEngagementEvents.includes(eventName)) {
    window.gtag('event', 'engage_video', {
      event_category: 'engagement',
      service_type: additionalParams.service_type || additionalParams.service_name || 'unknown',
      page_section: additionalParams.page_section || elementData.page_section || 'unknown',
      ...elementData,
      ...additionalParams,
    });
  }

  if (scrollEvents.includes(eventName)) {
    window.gtag('event', 'scroll_milestone', {
      event_category: 'engagement',
      page_section: additionalParams.page_section || elementData.page_section || 'unknown',
      ...elementData,
      ...additionalParams,
    });
  }

  if (dwellEvents.includes(eventName)) {
    window.gtag('event', 'dwell_section', {
      event_category: 'engagement',
      page_section: additionalParams.page_section || elementData.page_section || 'unknown',
      ...elementData,
      ...additionalParams,
    });
  }

  if (socialEvents.includes(eventName)) {
    window.gtag('event', 'click_social', {
      event_category: 'click',
      page_section: additionalParams.page_section || elementData.page_section || 'unknown',
      ...elementData,
      ...additionalParams,
    });
  }

  if (logoEvents.includes(eventName)) {
    window.gtag('event', 'click_logo', {
      event_category: 'click',
      page_section: additionalParams.page_section || elementData.page_section || 'unknown',
      ...elementData,
      ...additionalParams,
    });
  }
};

export const trackVideoEvent = (eventName: string, videoTitle: string, videoData?: { video_url?: string, video_thumbnail?: string }, additionalParams: Record<string, any> = {}) => {
  if (typeof window.gtag !== 'function') return;

  window.gtag('event', eventName, {
    event_category: 'video',
    event_label: videoTitle,
    video_url: videoData?.video_url,
    video_thumbnail: videoData?.video_thumbnail,
    page_type: getPageType(window.location.pathname),
    page_path: window.location.pathname + window.location.search + window.location.hash,
    page_title: document.title,
    ...additionalParams,
  });
};

export const trackFormEvent = (action: string, formName: string, additionalParams?: Record<string, any>) => {
  trackEvent(action, {
    form_name: formName,
    ...additionalParams
  });
};


// Scroll depth tracking
let scrollDepthTracked = new Set<number>();

export const resetScrollTracking = () => {
  scrollDepthTracked.clear();
};

export const initializeScrollDepthTracking = () => {
  if (typeof window === 'undefined') return;

  let __lastScrollTs = 0;
  const trackScrollDepth = () => {
    const now = Date.now();
    if (now - __lastScrollTs < 150) return;
    __lastScrollTs = now;

    const scrollTop = window.scrollY;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercentage = Math.round((scrollTop / documentHeight) * 100);
    
    // Track at 25%, 50%, 75%, and 100% milestones
    const milestones = [25, 50, 75, 100];
    
    milestones.forEach(milestone => {
      if (scrollPercentage >= milestone && !scrollDepthTracked.has(milestone)) {
        scrollDepthTracked.add(milestone);

        const page_location = window.location.href;
        const page_path = window.location.pathname + window.location.search + window.location.hash;
        const page_title = document.title;
        const page_type = getPageType(window.location.pathname);

        const serviceSlug = page_type === 'service_page' ? getServiceSlugFromPath(window.location.pathname) : undefined;
        const blogSlug = page_type === 'blog_post' ? getBlogSlugFromPath(window.location.pathname) : undefined;
        const categorySlug = page_type === 'blog_category' ? getBlogCategoryFromPath(window.location.pathname) : undefined;

        const payload: any = {
          depth_percentage: milestone,
          page_type,
          page_path,
          page_title,
          page_location
        };
        if (serviceSlug) payload.service_slug = serviceSlug;
        if (blogSlug) payload.blog_slug = blogSlug;
        if (categorySlug) payload.category_slug = categorySlug;

        const pageContext =
          page_type === 'homepage' ? 'homepage' :
          page_type === 'service_page' ? `service_${serviceSlug || 'page'}` :
          page_type === 'blog_post' ? `blog_${blogSlug || 'post'}` :
          page_type === 'blog_index' ? 'blog_index' :
          page_type === 'blog_category' ? `blog_category_${categorySlug || 'page'}` :
          page_type === 'service_areas' ? 'service_areas' :
          page_type === 'pricing' ? 'pricing' :
          page_type === 'contact' ? 'contact' :
          page_type;

        const scrollName = buildEventName({
          base: pageContext,
          percent: milestone,
        });

        trackEvent(scrollName, payload);

        dbg('events_fired', { events: [scrollName], params: payload });
      }
    });
  };
  
  window.addEventListener('scroll', trackScrollDepth, { passive: true });
};

// Section dwell time tracking
const sectionDwellTimers = new Map<string, NodeJS.Timeout>();
const sectionDwellTracked = new Set<string>();

export const initializeSectionDwellTracking = () => {
  if (typeof window === 'undefined') return;
  
  const sections = ['home', 'services', 'about', 'testimonials', 'pricing', 'contact'];
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const sectionId = entry.target.id;
        
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          // Start timer when section becomes 50% visible
          const timer = setTimeout(() => {
            if (!sectionDwellTracked.has(sectionId)) {
              sectionDwellTracked.add(sectionId);

              trackEvent('section_dwell_time', {
                section_name: sectionId,
                dwell_seconds: 3,
                page_type: getPageType(window.location.pathname),
                page_path: window.location.pathname + window.location.search + window.location.hash,
                page_title: document.title
              });
            }
          }, 3000); // 3 seconds
          
          sectionDwellTimers.set(sectionId, timer);
        } else {
          // Clear timer when section is no longer visible
          const timer = sectionDwellTimers.get(sectionId);
          if (timer) {
            clearTimeout(timer);
            sectionDwellTimers.delete(sectionId);
          }
        }
      });
    },
    { threshold: [0.5] }
  );
  
  // Observe all sections
  sections.forEach(sectionId => {
    const element = document.getElementById(sectionId);
    if (element) {
      observer.observe(element);
    }
  });
};

// non-breaking alias for future imports
export { getAttributionParams as __getAttr };