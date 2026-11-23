import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import { chromium, expect } from "@playwright/test";

const origin = "http://localhost:8888";
const dist = resolve("dist");
const types = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".webp": "image/webp", ".png": "image/png", ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json",
};

export async function authenticateBrowser({ handler, fixturePassword, refreshCount }) {
  // Use the built app and real CRM function on one origin. Only the test runner can reach it.
  const server = createServer(async (request, response) => {
    try {
      if (request.headers.host !== "localhost:8888") {
        response.writeHead(403).end();
        return;
      }
      const url = new URL(request.url, origin);
      if (url.pathname.startsWith("/api/crm/")) {
        let body = "";
        for await (const chunk of request) {
          body += chunk;
          if (body.length > 24000) {
            response.writeHead(413).end();
            return;
          }
        }
        const result = await handler({
          httpMethod: request.method, path: url.pathname, headers: request.headers,
          queryStringParameters: Object.fromEntries(url.searchParams), body,
        });
        response.writeHead(result.statusCode, {
          ...result.headers, ...(result.multiValueHeaders?.["Set-Cookie"]?.length
            ? { "Set-Cookie": result.multiValueHeaders["Set-Cookie"] } : {}),
        }).end(result.body);
        return;
      }
      const pathname = url.pathname === "/admin" ||
        (url.pathname.startsWith("/admin/") && !extname(url.pathname))
        ? "/admin/index.html" : url.pathname;
      const file = resolve(dist, `.${pathname}`);
      if (!file.startsWith(dist + sep)) {
        response.writeHead(404).end();
        return;
      }
      const contents = await readFile(file);
      response.writeHead(200, {
        "Content-Type": types[extname(file)] ?? "application/octet-stream",
        "Cache-Control": "no-store",
        ...(pathname === "/admin/sw.js" ? { "Service-Worker-Allowed": "/admin" } : {}),
      }).end(contents);
    } catch (error) {
      response.writeHead(error.code === "ENOENT" ? 404 : 500).end();
    }
  });
  await new Promise((ready, fail) => {
    server.once("error", fail);
    server.listen(8888, "127.0.0.1", ready);
  });
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: process.env.CRM_CHROMIUM_PATH || undefined,
      args: ["--no-sandbox", "--disable-dev-shm-usage", "--single-process", "--no-zygote", "--disable-gpu"],
    });
    const context = await browser.newContext({
      baseURL: origin, reducedMotion: "reduce", serviceWorkers: "block",
    });
    await context.addInitScript(() => {
      Object.defineProperty(navigator, "language", { value: "en-US@posix" });
    });
    await context.route("**/*", route => new URL(route.request().url()).origin === origin
      ? route.continue() : route.abort());
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    page.on("pageerror", error => console.error("Synthetic dashboard script error:", error.message));
    const heading = name => page.getByRole("heading", { name, exact: true });
    const btn = name => page.getByRole("button", { name, exact: true });
    const nav = page.getByRole("navigation", { name: "Private dashboard" });
    const login = async name => {
      await expect(heading("Private callback queue")).toBeVisible();
      await page.getByLabel("Email", { exact: true }).fill(`${name}@example.invalid`);
      await page.getByLabel("Password", { exact: true }).fill(fixturePassword);
      await btn("Sign in").click();
    };
    const signOut = async () => {
      await btn("Sign out").click();
      await expect(heading("Private callback queue")).toBeVisible();
    };
    await page.goto("/admin/notifications");
    await login("outsider");
    await expect(page.getByRole("alert")).toHaveText("Your account does not have access to this action.");
    await login("staff");
    await expect(heading("Notifications")).toBeVisible();
    await expect(nav.getByRole("link", { name: "Admin", exact: true })).toHaveCount(0);
    await expect(btn("Active (0)")).toBeVisible();
    const cookies = await context.cookies(`${origin}/api/crm/session`);
    for (const name of ["c1_access", "c1_refresh"])
      expect(cookies.find(cookie => cookie.name === name)).toMatchObject({
        httpOnly: true, secure: true, sameSite: "Strict", path: "/api/crm",
      });
    await context.clearCookies({ name: "c1_access" });
    await page.reload();
    await expect(btn("Active (0)")).toBeVisible();
    expect(refreshCount()).toBeGreaterThan(0);

    await nav.getByRole("link", { name: "Queue", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/queue\/?$/);
    await expect(heading("Your callback queue")).toBeVisible();
    await page.getByText("Add a callback manually", { exact: true }).click();
    await page.getByLabel("Name", { exact: true }).fill("Synthetic browser callback");
    const phone = page.getByLabel("Callback number");
    await phone.fill("invalid callback");
    expect(await phone.evaluate(input => input.validity.patternMismatch)).toBe(true);
    await phone.fill("+1 (402) 555-0119");
    expect(await phone.evaluate(input => input.validity.valid)).toBe(true);
    await page.getByLabel("Area or ZIP").fill("68102");
    await btn("Save callback").click();
    await expect(page.getByText("Callback saved.", { exact: true })).toBeVisible();
    await nav.getByRole("link", { name: "Notifications", exact: true }).click();
    await expect(btn("Active (1)")).toBeVisible();
    await page.getByRole("link", { name: "Open record for Synthetic browser callback" }).click();
    await expect(heading("Synthetic browser callback")).toBeVisible();
    expect(await (await page.request.get("/api/crm/attention")).json()).toEqual({ attention: 1 });
    await page.getByLabel("Next action").selectOption("callback_completed");
    await btn("Save result").click();
    await expect(page.getByRole("list").getByText("callback completed", { exact: true })).toBeVisible();
    await nav.getByRole("link", { name: "Notifications", exact: true }).click();
    await expect(btn("Active (0)")).toBeVisible();
    await btn("Staff activity").click();
    await expect(page.getByRole("link", { name: "Open record for Synthetic browser callback" })).toBeVisible();
    await signOut();

    for (const role of ["client", "owner"]) {
      await page.goto("/admin/business");
      await login(role);
      if (role === "client")
        await expect(page.getByText("Business settings require Josh’s admin account.", { exact: true })).toBeVisible();
      else
        await expect(heading("Business settings")).toBeVisible();
      await page.goto("/admin/calls");
      await expect(page.getByText("VoIP.ms is not connected.")).toBeVisible();
      await expect(btn("Import call records")).toHaveCount(0);
      await signOut();
    }
    console.log("PASS: built dashboard, synthetic sign-in, secure cookies, refresh, role gates, callbacks, and inbox against disposable PostgreSQL");
  } finally {
    await browser?.close();
    await new Promise((done, fail) => server.close(error => error ? fail(error) : done()));
  }
}
