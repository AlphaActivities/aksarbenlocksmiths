// Never send visitor contact details, free text or private dashboard URLs to GA4.
export function scrubAnalytics(
  parameters: Record<string, unknown>,
): Record<string, string | number | boolean> {
  const result: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(parameters)) {
    if (
      /name|phone|email|message|chat|conversation|query|^q$|referrer|link_text|element_text|target_url|error_message|user_id/i.test(
        key,
      )
    )
      continue;
    if (!["string", "number", "boolean"].includes(typeof value)) continue;
    if (typeof value === "string") {
      if (/@|\+?\d[\d ().-]{7,}\d/.test(value)) continue;
      if (/url|path|location/i.test(key)) {
        try {
          const url = new URL(value, window.location.origin);
          if (/^\/admin(?:\/|$)/.test(url.pathname)) continue;
          result[key] = url.pathname;
        } catch {
          /* Invalid URLs are omitted. */
        }
        continue;
      }
    }
    result[key] = value as string | number | boolean;
  }
  return result;
}
