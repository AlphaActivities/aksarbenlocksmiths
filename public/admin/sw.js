/* Private data is never cached, including pages, API responses and contact details. */
const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const adminPath = (path) => path === "/admin" || path.startsWith("/admin/");
const target = (payload) =>
  uuid.test(payload?.lead_id || "")
    ? `/admin/leads/${payload.lead_id}`
    : "/admin/notifications";
self.addEventListener("install", (event) =>
  event.waitUntil(self.skipWaiting()),
);
self.addEventListener("activate", (event) =>
  event.waitUntil(self.clients.claim()),
);
async function badge(count) {
  try {
    if (Number.isSafeInteger(count) && count >= 0) {
      if (count === 0) await self.navigator.clearAppBadge?.();
      else await self.navigator.setAppBadge?.(count);
    }
  } catch {
    /* Badge support varies. */
  }
}
self.addEventListener("message", (event) => {
  if (event.data?.kind === "attention")
    event.waitUntil(badge(event.data.count));
});
self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data?.json() || {};
  } catch {
    /* Minimal fallback. */
  }
  event.waitUntil(
    (async () => {
      const tabs = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      const open = tabs.filter((tab) => {
        try {
          return (
            new URL(tab.url).origin === self.location.origin &&
            adminPath(new URL(tab.url).pathname)
          );
        } catch {
          return false;
        }
      });
      for (const tab of open) tab.postMessage({ kind: "refresh-queue" });
      if (!open.length) {
        try {
          const r = await fetch("/api/crm/attention", {
            credentials: "same-origin",
            cache: "no-store",
          });
          if (r.ok) await badge((await r.json()).attention);
          else if (r.status === 401 || r.status === 403) await badge(0);
        } catch {
          /* Offline badge waits for the next authoritative refresh. */
        }
      }
      await self.registration.showNotification(
        payload.kind === "test"
          ? "Aksarben notification test"
          : "Aksarben needs your attention",
        {
          body: "Open your private dashboard to review.",
          icon: "/admin/icon-192.png",
          badge: "/admin/icon-192.png",
          tag: `c1-${uuid.test(payload.id || "") ? payload.id : "attention"}`,
          renotify: false,
          data: { url: target(payload) },
        },
      );
    })(),
  );
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const path = event.notification.data?.url || "";
  const id = path.match(/^\/admin\/leads\/([^/]+)$/)?.[1];
  const url = target({ lead_id: id });
  event.waitUntil(
    (async () => {
      const tabs = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      const tab = tabs.find((t) => {
        try {
          return (
            new URL(t.url).origin === self.location.origin &&
            adminPath(new URL(t.url).pathname)
          );
        } catch {
          return false;
        }
      });
      if (tab) {
        try {
          const next = await tab.navigate(url);
          return (next || tab).focus();
        } catch {
          /* Open new window below. */
        }
      }
      return self.clients.openWindow(url);
    })(),
  );
});
