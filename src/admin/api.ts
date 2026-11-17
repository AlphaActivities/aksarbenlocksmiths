export type Role = "josh_admin" | "staff" | "client";
export type Session = { role: Role; email: string; user_id: string };
export type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  area: string;
  urgency: string;
  source: string;
  created_at: string;
  historical: boolean;
  status: string;
  follow_up_at: string | null;
  message: string;
  version: number;
  conversation_state: string;
  assigned_to: string | null;
  conversation: { role: string; text: string }[];
};
export type Activity = {
  id: string;
  kind: string;
  note: string;
  happened_at: string;
};
export type Snapshot = {
  attention: number;
  leads: Lead[];
  metrics: Record<string, number>;
};
export type Settings = {
  preferences: { inquiries: boolean; handoffs: boolean; follow_ups: boolean };
  devices: { id: string; label: string; refreshed_at: string }[];
  receipts: {
    outbox_id: string;
    device_id: string;
    state: string;
    confirmed_at: string | null;
  }[];
  vapid_public_key: string | null;
  push_enabled: boolean;
};
export async function api<T>(
  path: string,
  body?: unknown,
  method = body === undefined ? "GET" : "POST",
): Promise<T> {
  const r = await fetch(`/api/crm/${path}`, {
    method,
    credentials: "same-origin",
    cache: "no-store",
    headers: body === undefined ? {} : { "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (!r.headers.get("content-type")?.includes("application/json")) {
    throw new Error(
      "The private service is not configured or is temporarily unavailable.",
    );
  }
  const result = await r.json().catch(() => ({ error: "server_unavailable" }));
  if (!r.ok) {
    if (r.status === 401) window.dispatchEvent(new Event("c1-signed-out"));
    throw new Error(
      r.status === 409
        ? "This record changed. Refresh before trying again."
        : r.status === 403
          ? "Your account does not have access to this action."
          : r.status === 401
            ? "Please sign in again."
            : r.status === 503
              ? "The private service is not configured or is temporarily unavailable."
              : "The request failed. Your changes have not been confirmed. Please retry.",
    );
  }
  return result;
}
export function updateBadge(count: number) {
  navigator.serviceWorker?.controller?.postMessage({
    kind: "attention",
    count,
  });
  const n = navigator as Navigator & {
    setAppBadge?: (count: number) => Promise<void>;
    clearAppBadge?: () => Promise<void>;
  };
  void (count ? n.setAppBadge?.(count) : n.clearAppBadge?.())?.catch(
    () => undefined,
  );
}
export const date = (value: string) => new Date(value).toLocaleString();
export function age(value: string) {
  const minutes = Math.max(
    0,
    Math.floor((Date.now() - Date.parse(value)) / 60000),
  );
  return minutes < 60
    ? `${minutes}m ago`
    : minutes < 1440
      ? `${Math.floor(minutes / 60)}h ago`
      : `${Math.floor(minutes / 1440)}d ago`;
}
export function dial(phone: string) {
  const cleaned = phone.replace(/[^\d+]/g, "");
  return /^\+?\d{7,15}$/.test(cleaned) ? `tel:${cleaned}` : null;
}
