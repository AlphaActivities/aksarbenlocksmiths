import { test, expect, type Page } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  // Local QA must never emit events to the live site's analytics property.
  await page.route('**/*google-analytics.com/**', route => route.abort());
  await page.route('**/*googletagmanager.com/**', route => route.abort());
});
test("password recovery entry, generic confirmation, invalid link and voluntary update", async ({page})=>{
  await page.route("**/api/crm/**",async route=>{
    const path=new URL(route.request().url()).pathname;
    const data=path.endsWith("/request")?{message:"If this address has an eligible account, a password reset email will arrive shortly."}:path.endsWith("/verify")?{verified:true}:path.endsWith("/update")?{updated:true}:{error:"sign_in_required"};
    await route.fulfill({status:path.endsWith("/session")?401:200,contentType:"application/json",body:JSON.stringify(data)});
  });
  await page.goto('/admin');
  await page.getByRole('link',{name:'Forgot password?'}).click();
  await expect(page.getByRole('heading',{name:'Reset your password'})).toBeVisible();
  await page.getByLabel('Email',{exact:true}).fill('qa@example.invalid');
  await page.getByRole('button',{name:'Email password reset link'}).click();
  await expect(page.getByRole('status')).toContainText('If this address has an eligible account');
  await page.goto('/admin/reset-password#error=access_denied&error_code=otp_expired');
  // A provider redirect is a fresh document; a same-document hash change alone is not.
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('invalid or has expired');
  await expect(page).toHaveURL(/\/admin\/reset-password$/);
  await page.goto('/admin/reset-password?code='+ 'a'.repeat(64));
  await expect(page).toHaveURL(/\/admin\/reset-password$/);
  await page.getByRole('button',{name:'Continue with recovery link'}).click();
  await page.getByLabel('New password',{exact:true}).fill('Synthetic recovery only');
  await page.getByLabel('Confirm new password',{exact:true}).fill('Different synthetic value');
  await page.getByRole('button',{name:'Save new password'}).click();
  await expect(page.getByRole('alert')).toHaveText('Passwords do not match.');
  await page.getByLabel('Confirm new password',{exact:true}).fill('Synthetic recovery only');
  await page.getByRole('button',{name:'Save new password'}).click();
  await expect(page.getByRole('heading',{name:'Password updated'})).toBeVisible();
});
const liveId = "10000000-0000-4000-8000-000000000001",
  historyId = "10000000-0000-4000-8000-000000000002",
  chatId = "10000000-0000-4000-8000-000000000003";
async function mockService(page: Page, role = "staff", startSignedIn = false) {
  let signedIn = startSignedIn;
  const leads = [
    {
      id: liveId,
      name: "Synthetic Callback",
      phone: "+14025550101",
      email: "qa@example.invalid",
      service: "Residential",
      area: "68102",
      urgency: "urgent",
      source: "netlify",
      created_at: "2026-11-17T10:00:00Z",
      historical: false,
      status: "new",
      follow_up_at: null,
      message: "Synthetic browser test",
      version: 1,
      conversation: [],
      conversation_state: "bot",
    },
    {
      id: historyId,
      name: "Synthetic Historical",
      phone: "+14025550102",
      email: "qa@example.invalid",
      service: "Automotive",
      area: "68103",
      urgency: "quote",
      source: "netlify",
      created_at: "2025-02-03T16:00:00Z",
      historical: true,
      status: "history",
      follow_up_at: null,
      message: "Imported synthetic fixture",
      version: 1,
      conversation: [],
      conversation_state: "bot",
    },
    {
      id: chatId,
      name: "Synthetic Handoff",
      phone: "+14025550103",
      email: "",
      service: "Automotive",
      area: "68104",
      urgency: "scheduled",
      source: "chat",
      created_at: "2026-11-17T11:00:00Z",
      historical: false,
      status: "new",
      follow_up_at: null,
      message: "Synthetic handoff",
      version: 1,
      conversation: [{ role: "visitor", text: "Synthetic callback request" }],
      conversation_state: "waiting",
    },
  ];
  const events: {
    id: string;
    kind: string;
    note: string;
    happened_at: string;
  }[] = [];
  await page.route("**/api/crm/**", async (route) => {
    const req = route.request(),
      url = new URL(req.url()),
      path = url.pathname.replace("/api/crm/", "");
    const body = req.method() === "GET" ? {} : req.postDataJSON();
    let status = 200,
      result: unknown = {};
    if (path === "login") {
      signedIn = true;
      result = { role };
    } else if (!signedIn) {
      status = 401;
      result = { error: "sign_in_required" };
    } else if (path === "session")
      result = { role, email: "qa@example.invalid", user_id: liveId };
    else if (path === "queue") {
      const filtered = leads.filter(
        (l) =>
          !url.searchParams.get("service") ||
          l.service === url.searchParams.get("service"),
      );
      result = {
        attention: 2,
        leads: filtered,
        metrics: {
          inquiry_confirmed: 2,
          booked: events.filter((e) => e.kind === "booked").length,
          callback_completed: events.filter(
            (e) => e.kind === "callback_completed",
          ).length,
        },
      };
    } else if (path === "notifications") {
      result = {
        attention: 2,
        active: leads.filter(lead => !lead.historical).map(lead => ({
          id: lead.id, lead_id: lead.id, name: lead.name,
          title: "New inquiry", category: "inquiry",
          urgent: lead.urgency === "urgent", occurred_at: lead.created_at,
        })),
        history: [{
          id: "activity", lead_id: liveId, name: "Synthetic Callback", title: "Callback completed",
          category: "staff", urgent: false, occurred_at: "2026-11-17T11:00:00Z",
        }],
      };
    } else if (path === "attention") result = { attention: 2 };
    else if (path === "logout") {
      signedIn = false;
      result = { ok: true };
    } else if (path === "settings")
      result = {
        preferences: { inquiries: true, handoffs: true, follow_ups: true },
        devices: [],
        receipts: [],
        push_enabled: false,
        vapid_public_key: null,
      };
    else if (path.startsWith("leads/")) {
      const lead = leads.find((l) => l.id === path.split("/")[1]);
      if (!lead) {
        status = 404;
        result = { error: "not_found" };
      } else if (req.method() === "POST") {
        lead.version++;
        if (body.action === "booked") lead.status = "booked";
        if (body.action === "schedule") {
          lead.status = "scheduled";
          lead.follow_up_at = body.follow_up_at;
        }
        events.push({
          id: crypto.randomUUID(),
          kind: body.action,
          note: body.note,
          happened_at: new Date().toISOString(),
        });
        result = lead;
      } else result = { lead, events };
    } else {
      status = 403;
      result = { error: "admin_required" };
    }
    await route.fulfill({
      status,
      contentType: "application/json",
      headers: { "Cache-Control": "no-store" },
      body: JSON.stringify(result),
    });
  });
}
async function login(page: Page) {
  await page.getByLabel("Email", { exact: true }).fill("qa@example.invalid");
  await page.getByLabel("Password", { exact: true }).fill("synthetic-only");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
}
test("private sign in, callback dialer, note, follow up and explicit booking", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await mockService(page);
  const exceptions: string[] = [];
  page.on("pageerror", (e) => exceptions.push(e.message));
  await page.goto(`/admin/leads/${liveId}`);
  await expect(
    page.getByRole("heading", { name: "Private callback queue" }),
  ).toBeVisible();
  await expect(page.getByText("Synthetic Callback")).toHaveCount(0);
  await login(page);
  await expect(
    page.getByRole("heading", { name: "Synthetic Callback" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Call +14025550101" }),
  ).toHaveAttribute("href", "tel:+14025550101");
  await page.getByLabel("Private note").fill("Synthetic result");
  await page.getByRole("button", { name: "Save result" }).click();
  await expect(page.getByText("Saved.", { exact: true })).toBeVisible();
  await page.getByLabel("Next action").selectOption("schedule");
  await page.getByLabel(/Follow up time/).fill("2027-01-05T12:30");
  await page.getByRole("button", { name: "Save result" }).click();
  await expect(page.getByText("scheduled", { exact: true })).toBeVisible();
  await page.getByLabel("Next action").selectOption("callback_completed");
  await page.getByRole("button", { name: "Save result" }).click();
  await expect(page.locator(".c1-activity")).toContainText(
    "callback completed",
  );
  await page.getByLabel("Next action").selectOption("booked");
  await page.getByRole("button", { name: "Save result" }).click();
  await expect(
    page.locator("dd").filter({ hasText: /^booked$/ }),
  ).toBeVisible();
  expect(exceptions).toEqual([]);
});
test("History and filters do not change attention; staff cannot use Admin", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await mockService(page, "staff", true);
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "Your callback queue" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Admin", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "2 pending attention items" }),
  ).toBeVisible();
  const menu = page.getByRole("button", { name: "Open navigation" });
  if (await menu.isVisible()) await menu.click();
  await page.getByRole("link", { name: "History", exact: true }).click();
  await expect(page.getByText("Synthetic Historical · 68103")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "2 pending attention items" }),
  ).toBeVisible();
  await page
    .getByRole("combobox", { name: "Service", exact: true })
    .selectOption("Residential");
  await expect(page.getByText("Synthetic Historical · 68103")).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "2 pending attention items" }),
  ).toBeVisible();
  await page.goto("/admin/business");
  await expect(
    page.getByText("Business settings require Josh’s admin account."),
  ).toBeVisible();
  await page.goto("/admin/settings");
  await expect(
    page.getByRole("heading", { name: "My Settings", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Push is currently disabled.", { exact: false }),
  ).toBeVisible();
});
test("manifest, direct entries, worker scope and public emergency path survive reload", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await mockService(page, "josh_admin", true);
  const analytics: string[] = [];
  page.on("request", (r) => {
    if (/google-analytics|googletagmanager/.test(r.url()))
      analytics.push(r.url());
  });
  await page.goto("/admin/");
  await page.reload();
  const menu = page.getByRole("button", { name: "Open navigation" });
  await expect(page.getByRole("navigation", { name: "Private dashboard" }).or(menu)).toBeVisible();
  const mobile = await menu.isVisible();
  if (mobile) await menu.click();
  await expect(
    page.getByRole("link", { name: "Admin", exact: true }),
  ).toBeVisible();
  if (mobile) await page.keyboard.press("Escape");
  const pwa = await page.evaluate(async () => {
    const manifest = await (await fetch("/admin/manifest.webmanifest")).json();
    const reg = await navigator.serviceWorker.ready;
    return {
      manifest,
      scope: reg.scope,
      cacheKeys: await caches.keys(),
      startup: document.querySelectorAll(
        'link[rel="apple-touch-startup-image"]',
      ).length,
    };
  });
  expect(pwa.manifest.start_url).toBe("/admin");
  expect(pwa.manifest.display).toBe("standalone");
  expect(
    pwa.manifest.icons.some(
      (i: { purpose: string }) => i.purpose === "maskable",
    ),
  ).toBe(true);
  expect(pwa.scope).toContain("/admin");
  expect(pwa.startup).toBe(12);
  expect(pwa.cacheKeys).toEqual([]);
  expect(analytics).toEqual([]);
  await page.goto(`/admin/leads/${chatId}`);
  await expect(
    page.getByRole("heading", { name: "Conversation · waiting" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Synthetic Handoff" }),
  ).toBeVisible();
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: "(402) 556-6715", exact: true }).first(),
  ).toHaveAttribute("href", "tel:+14025566715");
  await page
    .getByRole("button", { name: "Need help? Request a callback" })
    .click();
  await expect(
    page.getByRole("link", { name: "Call (402) 556-6715", exact: true }),
  ).toHaveAttribute("href", "tel:+14025566715");
  await page.goto("/services/rekeying");
  await expect(
    page.getByRole("heading", { name: "Lock Rekeying", exact: true }),
  ).toBeVisible();
});


test("notification filters and record navigation keep attention intact", async ({ page }) => {
  const writes: string[] = [];
  page.on("request", request => {
    if (request.url().includes("/api/crm/") && request.method() !== "GET") writes.push(request.url());
  });
  await mockService(page, "staff", true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/admin");
  await page.getByRole("link", { name: "2 pending attention items" }).click();
  await expect(page.getByRole("button", { name: "Active (2)" })).toBeVisible();
  await page.getByRole("button", { name: "Follow-ups", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "No follow-ups need attention." })).toBeVisible();
  await page.getByRole("button", { name: "Urgent", exact: true }).click();
  await expect(page.getByRole("link", { name: /Open record for Synthetic Callback/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Open record for Synthetic Handoff/ })).toHaveCount(0);
  await page.getByRole("button", { name: "History", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Callback completed" })).toBeVisible();
  await page.getByRole("link", { name: /Open record for Synthetic Callback/ }).click();
  await expect(page).toHaveURL(new RegExp(`/admin/leads/${liveId}$`));
  await expect(page.getByRole("link", { name: "2 pending attention items" })).toBeVisible();
  expect(writes).toEqual([]);
});

test("managed mobile menu and device-local sound preferences", async ({ page }) => {
  await mockService(page, "staff", true);
  await page.addInitScript(() => {
    const start = OscillatorNode.prototype.start;
    OscillatorNode.prototype.start = function (when?: number) {
      const root = document.documentElement;
      root.dataset.testOscillators = String(Number(root.dataset.testOscillators ?? "0") + 1);
      return start.call(this, when);
    };
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/admin/settings");
  await expect(page.getByRole("heading", { name: "My Settings" })).toBeVisible();
  const menu = page.getByRole("button", { name: "Open navigation" });
  if (await menu.isVisible()) {
    await menu.focus();
    await page.keyboard.press("Enter");
    const navigation = page.getByRole("dialog", { name: "Dashboard navigation" });
    await expect(navigation).toBeVisible();
    await expect(navigation.getByRole("link", { name: "Queue", exact: true })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(navigation).not.toBeVisible();
    await expect(menu).toBeFocused();
  }
  await page.getByLabel("Urgent callbacks", { exact: true }).selectOption("Amber Pulse");
  const preview = page.getByRole("button", { name: "Preview urgent callbacks sound" });
  await expect(preview).toBeEnabled();
  await preview.click();
  await expect(page.locator("html")).toHaveAttribute("data-test-oscillators", "3");
  await page.reload();
  await expect(page.getByLabel("Urgent callbacks", { exact: true })).toHaveValue("amber");
  await expect(page.getByLabel("Staff updates", { exact: true })).toHaveValue("silent");
  await expect(page.locator(".c1-entrance")).toHaveCount(0);
});


test("the dashboard fits the configured viewport", async ({ page }, testInfo) => {
  await mockService(page, "staff", true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/admin/notifications");
  await expect(page.getByRole("heading", { name: "Notifications" })).toBeVisible();
  const width = page.viewportSize()!.width;
  const menu = page.getByRole("button", { name: "Open navigation" });
  if (width <= 900) await expect(menu).toBeVisible();
  else await expect(menu).not.toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.getByRole("button", { name: "Active (2)" })).toBeVisible();
  const urgentLabel = page.locator('[data-category="urgent"] strong');
  for (const colorScheme of ["light", "dark"] as const) {
    await page.emulateMedia({ reducedMotion: "reduce", colorScheme });
    await expect(urgentLabel).toHaveCSS("color", "rgb(255, 155, 133)");
  }
  const path = testInfo.outputPath("notification-inbox.png");
  await page.screenshot({ path });
  await testInfo.attach("notification-inbox", { path, contentType: "image/png" });
});

test("inbox, bell and app badge reconcile to the same count", async ({ page }) => {
  await mockService(page, "staff", true);
  await page.addInitScript(() => {
    Object.defineProperties(navigator, {
      setAppBadge: { value: async (count: number) => { document.documentElement.dataset.testBadge = String(count); } },
      clearAppBadge: { value: async () => { document.documentElement.dataset.testBadge = "0"; } },
    });
  });
  let count = 1;
  await page.route("**/api/crm/notifications", route => route.fulfill({ json: {
    attention: count,
    active: count ? [{
      id: liveId, lead_id: liveId, name: "Synthetic Callback", title: "New inquiry",
      category: "inquiry", urgent: true, occurred_at: "2026-11-17T10:00:00Z",
    }] : [],
    history: [],
  } }));
  await page.goto("/admin/notifications");
  await expect(page.getByRole("button", { name: "Active (1)" })).toBeVisible();
  await expect(page.getByRole("link", { name: "1 pending attention items" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-test-badge", "1");
  count = 0;
  await page.getByRole("button", { name: "Refresh notifications" }).click();
  await expect(page.getByRole("button", { name: "Active (0)" })).toBeVisible();
  await expect(page.locator(".c1-bell")).toHaveAccessibleName("Notifications");
  await expect(page.locator("html")).toHaveAttribute("data-test-badge", "0");
});

test("incoming calls stay separate from the queue and staff cannot sync", async ({ page }) => {
  await mockService(page, "staff", true);
  await page.route("**/api/crm/calls", route => route.fulfill({ json: {
    connected: true,
    calls: [{ provider_call_id: "fixture", occurred_at: "2026-11-17T10:00:00Z",
      caller_phone: "+14025550101", disposition: "ANSWERED", duration_seconds: 22,
      historical: true, related_lead_id: liveId }],
  } }));
  await page.goto("/admin/calls");
  await expect(page.getByRole("heading", { name: "Incoming calls" })).toBeVisible();
  await expect(page.getByText(/ANSWERED.*Historical/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Import call records" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "2 pending attention items" })).toBeVisible();
  await page.getByRole("link", { name: "Open matching lead" }).click();
  await expect(page.getByRole("heading", { name: "Synthetic Callback" })).toBeVisible();
});
