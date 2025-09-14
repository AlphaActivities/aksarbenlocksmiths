// Google Analytics 4 utility functions

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

// Build an attribution object from the current URL and referrer
export const captureAttributionFromURL = (href?: string, referrer?: string) => {
  if (typeof window === "undefined") return;

  const url = href || window.location.href;
  const ref = referrer ?? document.referrer || undefined;

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

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

// Configure GA4 with debug user ID in development
export const configureGA4 = () => {
  if (typeof window !== 'undefined' && window.gtag) {
    const config: Record<string, any> = {};
    
    // Add debug user ID only in development
    if (import.meta.env.DEV) {
      config.user_id = 'debug-user-josh';
    }
    
    window.gtag('config', 'G-R5H0MX6FR2', config);
    
    // capture first route load
    try { captureAttributionFromURL(); } catch {}
    
    // Set user properties
    window.gtag('set', 'user_properties', {
      user_type: 'general_visitor',  // You can customize this dynamically in future
      visit_intent: 'locksmith_service',
      platform: navigator.platform || 'unknown',
    });
    
    // Track UTM parameters (runs only once on load)
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
  }
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
    ...elementData,
    ...attribution,
    ...additionalParams,
  });

  // Fire alias events for specific tracking needs
  const callEvents = ['header_call_now', 'footer_phone_click', 'contact_phone_click', 'floating_call_button', 'service_page_request_service'];
  const emailEvents = ['footer_email_click', 'contact_email_click'];
  const pricingEvents = ['pricing_cta_click'];
  const serviceViewEvents = ['service_tile_click'];
  const testimonialEvents = ['testimonial_view', 'testimonial_arrow_click', 'testimonial_dot_click'];
  const menuNavigationEvents = ['mobile_nav_click', 'footer_nav_click', 'hamburger_menu_toggle'];
  const videoEngagementEvents = ['video_play', 'video_pause', 'video_complete', 'video_play_button_click'];
  const scrollEvents = ['scroll_depth'];
  const dwellEvents = ['section_dwell_time'];
  const socialEvents = ['footer_social_click'];
  const logoEvents = ['logo_click'];

  if (callEvents.includes(eventName)) {
    window.gtag('event', 'click_call_button', {
      event_category: 'click',
      service_type: additionalParams.service_type || additionalParams.service_name || 'unknown',
      phone_number: additionalParams.phone_number || undefined,
      page_section: additionalParams.page_section || elementData.page_section || 'unknown',
      ...elementData,
      ...additionalParams,
    });
  }

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

  if (menuNavigationEvents.includes(eventName)) {
    window.gtag('event', 'navigate_menu', {
      event_category: 'navigation',
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
    ...additionalParams,
  });
};

export const trackFormEvent = (action: string, formName: string, additionalParams?: Record<string, any>) => {
  trackEvent(action, {
    form_name: formName,
    ...additionalParams
  });
};

export const trackNavigation = (section: string, source: string = 'header') => {
  trackEvent('navigation_click', {
    section,
    source
  });
};

export const trackEngagement = (action: string, element: string, additionalParams?: Record<string, any>) => {
  const attribution = getAttributionParams();

  trackEvent('engagement', {
    action,
    element,
    ...attribution,
    ...additionalParams
  });
};

// Scroll depth tracking
let scrollDepthTracked = new Set<number>();

export const initializeScrollDepthTracking = () => {
  if (typeof window === 'undefined') return;
  
  const trackScrollDepth = () => {
    const scrollTop = window.scrollY;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercentage = Math.round((scrollTop / documentHeight) * 100);
    
    // Track at 25%, 50%, 75%, and 100% milestones
    const milestones = [25, 50, 75, 100];
    
    milestones.forEach(milestone => {
      if (scrollPercentage >= milestone && !scrollDepthTracked.has(milestone)) {
        scrollDepthTracked.add(milestone);
        trackEvent('scroll_depth', {
          depth_percentage: milestone,
          page_type: window.location.pathname === '/' ? 'homepage' : 'service_page'
        });
      }
    });
  };
  
  window.addEventListener('scroll', trackScrollDepth, { passive: true });
  
  // Reset tracking when navigating to new page
  const resetScrollTracking = () => {
    scrollDepthTracked.clear();
  };
  
  window.addEventListener('beforeunload', resetScrollTracking);
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
                dwell_seconds: 3
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