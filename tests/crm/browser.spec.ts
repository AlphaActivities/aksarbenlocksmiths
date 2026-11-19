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
  await expect(
    page.getByRole("link", { name: "Admin", exact: true }),
  ).toBeVisible();
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

test("preview filter layout keeps From/Through readable in two columns without narrow-screen overflow", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await mockService(page, "staff", true);
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "Your callback queue" }),
  ).toBeVisible();
  await page.getByLabel("From", { exact: true }).fill("2026-11-19");
  await page.getByLabel("Through", { exact: true }).fill("2026-11-20");
  for (const width of [320, 375, 393, 800]) {
    await page.setViewportSize({ width, height: 900 });
    const layout = await page.locator(".c1-filters").evaluate((element) => {
      const controls = [
        ...element.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
          "input,select",
        ),
      ];
      const rect = element.getBoundingClientRect();
      const labels = [...element.querySelectorAll("label")].map((label) =>
        label.getBoundingClientRect().toJSON(),
      );
      const button = element.querySelector("button")!.getBoundingClientRect();
      return {
        display: getComputedStyle(element).display,
        gap: getComputedStyle(element).gap,
        width: rect.width,
        labels,
        buttonWidth: button.width,
        margins: [...element.querySelectorAll("label,button")].map(
          (node) => getComputedStyle(node).margin,
        ),
        controls: controls.map((node) => ({
          right: node.getBoundingClientRect().right,
          left: node.getBoundingClientRect().left,
          minWidth: getComputedStyle(node).minWidth,
          maxWidth: getComputedStyle(node).maxWidth,
          appearance: getComputedStyle(node).appearance,
          padding: getComputedStyle(node).paddingInlineStart,
        })),
        values: controls.slice(0, 2).map((node) => node.value),
      };
    });
    expect(layout.display).toBe("grid");
    expect(layout.gap).toBe("12px");
    expect(Math.abs(layout.labels[0].y - layout.labels[1].y)).toBeLessThan(1);
    expect(
      Math.abs(layout.labels[0].width - layout.labels[1].width),
    ).toBeLessThan(1);
    expect(Math.abs(layout.labels[2].width - layout.width)).toBeLessThan(1);
    expect(Math.abs(layout.buttonWidth - layout.width)).toBeLessThan(1);
    expect(layout.margins.every((margin) => margin === "0px")).toBe(true);
    for (const control of layout.controls) {
      expect(control.left).toBeGreaterThanOrEqual(0);
      expect(control.right).toBeLessThanOrEqual(width);
      expect(control.minWidth).toBe("0px");
      expect(control.maxWidth).toBe("100%");
    }
    for (const date of layout.controls.slice(0, 2)) {
      expect(date.appearance).toBe("none");
      expect(date.padding).toBe("8px");
    }
    expect(layout.values).toEqual(["2026-11-19", "2026-11-20"]);
  }
});
