# C1 callback queue: operation and release

## Architecture and scope

The public Vite/React site retains its existing Netlify `contact` form and emergency `tel:+14025566715` links. Area/ZIP and urgency are additive fields. A bounded callback assistant offers the emergency number immediately and submits scheduled handoffs to that same recoverable intake. It does not quote prices, promise arrival times or transfer data to an AI provider.

`/admin` has a separate HTML/JavaScript entry with no public GA4 initialization. Private records are never cached by the worker. Only same-origin HttpOnly/Secure/SameSite cookies hold the Supabase session; no browser localStorage token or service key. Every private API request validates the account with Supabase Auth, then checks C1 membership. Database RLS and security-definer RPC checks enforce the same boundary. Only the separately provisioned `josh_admin` account gets the Admin route/API; the database permits at most one such account per project. Staff (including Heber) and the client may work this project's records and their own device settings.

Supabase provides Auth/PostgreSQL. Server functions run on **Netlify**, not Supabase Edge Functions; there is no Supabase function name to deploy. Do not run the blueprint's example Edge Function command against an invented name. `crm_*` objects and RPCs are namespaced; inspect the live migration history before applying them.

VoIP.ms, credentials, CDR, call routing, test calls and missed-call alerts are **deferred by Josh** and absent from this release. Manual answered/unanswered/voicemail outcomes, completed callbacks and explicit bookings are implemented. An answered call never creates a booked-job event. Google Play/TWA is a separate optional later release.

## Local checks

Use the existing checkout on `main`; do not create a worktree for this task. The hosting config pins Node 18.14.0, although pre-existing ESLint packages declare >=18.18.0. New code was also checked with Node 24.22.1. Do not silently change the hosting runtime.

```bash
npm ci --cache /workspace/.npm-cache --no-audit --no-fund
npm run test:crm
npm run check:crm
npm run test:crm:db
bash scripts/crm/test-http.sh
NODE_ENV=production npm run build
node scripts/assert-sitemap.mjs
CRM_CHROMIUM_PATH=/usr/bin/chromium npx playwright test
```

`test:crm:db` creates **two new disposable PostgreSQL 15 containers**, applies every migration to each, and runs actual policies/RPCs. It neither connects to nor resets production. `test-http.sh` uses disposable PostgreSQL/PostgREST containers, synthetic JWTs and synthetic records. Its auth-provider response is a test double; real PostgREST verifies JWT signatures and real database policies execute. Neither test contacts a live provider. They remove only their own containers/network. Pull `postgres:15-alpine` and `postgrest/postgrest:v12.2.3` if not present.

Playwright uses synthetic API fixtures. Android Chrome emulation runs first, followed by an iPhone viewport **in Chromium**, then desktop Chromium. These prove layout, public routing, UI state, access presentation, manifest/worker registration and local callback actions; they do not prove Safari, physical dialer behavior, installation or native push delivery. Use Playwright's installed Chromium by omitting `CRM_CHROMIUM_PATH`, after `npx playwright install chromium`, on other machines.

For full local Supabase use CLI 2.58.5 (verified download/checksum in this run), first inspect `supabase start --help` and this repository's `supabase/config.toml`. `supabase start`, `supabase db reset --local`, `supabase status` must refer to a disposable local stack. Never print `supabase status -o env` into a report; it contains keys. This environment's full stack attempt failed on ECR access, then on the Docker mirror's large image extraction; use the verified lighter tests above until a full stack is available. Do not disable checksums, TLS or package signatures.

`npm run lint`, `npm run build:ci` and full `tsc -b` retain documented baseline defects. `check:crm` covers the new app without masking those failures. Existing SEO and unrelated application bugs were not changed.

## Secure runtime bindings — Netlify, not Codex configuration

Set these only through the authorized site's managed server environment. No secret values belong in Git, terminal command arguments, reports or chat. The application server verifies that `SUPABASE_URL` is exactly the authorized project's HTTPS origin.

| Name | Purpose |
| --- | --- |
| `SUPABASE_URL` | `https://umnxslkgksqyqfwwdztg.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase Auth/user-scoped PostgREST requests, kept server-side here |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only ingestion/outbox operations; never `VITE_*` |
| `NETLIFY_AUTH_TOKEN` | Authorized read access to C1 forms; never browser code |
| `NETLIFY_FORM_ID` | Verify live `contact` form under site `1468843e-3044-4988-a4d8-c9bb7ba6e87a` |
| `NETLIFY_LIVE_FROM` | Explicit reviewed rollout timestamp in UTC; prevents old submissions becoming new alerts |
| `CRM_INTAKE_ENABLED` | Defaults off; set `true` only after target/form and history reconciliation |
| `CRM_PUSH_ENABLED` | Defaults off; independent of intake; enable only for controlled device acceptance first |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` | Managed Web Push signing credentials/contact. Private key must be available to the server signing process, not a proxy placeholder |

Preserve the site's existing `VITE_ENABLE_FORM_SEND` behavior; production needs `true` for the existing real Netlify intake. Do not assume preview/mock acceptance equals a real form submission. No secret or domain was added to Codex environment settings during this implementation.

Provision individual Auth email/password accounts through authorized administration, then add their exact Auth UUIDs to `crm_memberships` with the C1 project UUID `c1000000-0000-4000-8000-000000000001`. Josh alone gets `josh_admin`; approved staff get `staff`, Mike gets `client`. Never infer a privileged role from an email in a browser or create shared/default passwords. There is no public membership creation path. Review Auth password/rate-limit/signup settings in the dedicated project.

## Recoverable intake and History

`sync-intake` is a Netlify **scheduled function**, whose public URL cannot be invoked on Netlify. It polls authenticated canonical Netlify records; it does not trust arbitrary webhook bodies or expose an unsigned ingestion endpoint. This deliberately avoids inventing a webhook authentication protocol. The site/form identity is checked before each sync. The admin-only reconciliation button uses the same path. Schedule: every five minutes; push dispatch: every minute. Both are disabled by default. Confirm scheduled-function platform behavior in a deploy preview before enabling live intake.

Polling scans all pages (bounded at 10,000 records; an incomplete scan fails), uses a 15-minute overlap and commits its watermark only after persistence. This protects retries but is not a substitute for reconciliation if Netlify exposes records more than 15 minutes late. Reset the server-side watermark to a reviewed earlier point to replay after such an incident. Unique provider identity, chat handoff identity, and transactionally inserted events/outbox rows prevent duplicate leads/alerts. Replays never reopen a staff-worked record. Netlify acceptance and CRM persistence remain distinct; Netlify submissions remain the recovery source. No provider/customer payload is logged.

Do **not** treat 43 as a verified current count. The authorized history flow is:

```bash
# Secure bindings must already exist; output directory must be outside this checkout.
node scripts/crm/export-history.mjs --output /tmp/c1-history.private.json
# Review every record and edit the generated .review.json privately:
# legitimate / spam / duplicate / test. Its SHA-256 binds it to the exact export.
node scripts/crm/import-history.mjs --input /tmp/c1-history.private.json --review /tmp/c1-history.private.json.review.json
# Only after the dry-run counts and decisions are approved:
node scripts/crm/import-history.mjs --input /tmp/c1-history.private.json --review /tmp/c1-history.private.json.review.json --apply --target-ref umnxslkgksqyqfwwdztg
# Repeat the exact apply and confirm inserted=0; verify History and no new outbox rows.
```

Export files are created with owner-only permissions and refuse overwrite or a checkout output path. Keep all exports/review files outside Git and remove them through the authorized retention procedure. Import passes `p_history=true`: original provider IDs/dates are retained; no push, active badge or fresh conversion is emitted. Resolve overlap with already-active records in review; ingestion never silently rewrites an existing lead. Configure `NETLIFY_LIVE_FROM` at the reviewed export/rollout boundary before enabling polling.

The assistant's stable handoff UUID is stored along with the canonical Netlify submission ID. Staff can claim, review the recorded conversation, log a result and return it to bot state. This is an intake assistant and durable staff handoff, not a real-time human chat transport; the visitor gets Netlify acceptance, not an unverified claim that a staff member has seen it.

## Device acceptance — Android first

Record **Mike's physical Android model, Android version, Chrome version and reachable authorized HTTPS URL** before the first mobile acceptance pass. Until available, keep that pass pending; an emulator is preliminary QA only. Verify manifest name/icons/maskable icon, `/admin` start URL, standalone installation, worker coverage for `/admin` and `/admin/`, launcher icon, expired-session sign in and deep-link restoration. Verify emergency dialer opens the existing business number; do not make an uncontrolled real call.

In My Settings explicitly enable notifications. Permission denial must remain usable. Register/refresh/remove devices individually; send a test to the selected device, close the app, and record explicit human visual receipt. The sender's `accepted` status means provider acceptance only. Follow with one controlled website inquiry and one handoff, tap their alerts, verify record destinations, canonical count and clearing at zero. Check launcher indicators without requiring numeric badges on every Android launcher.

Repeat on an actual iPhone/Safari Home Screen installation (record model/iOS), then an installed desktop Chrome app (record OS/Chrome). Check branded startup image/first-frame alignment and measured logo landing, four-second hold, greeting/ring/date/bell, zero/pending attention, Reduce Motion, supported haptics, reopen state, signed-out routing, light/dark readability, denied permission, device removal and closed-window notification taps. Twelve portrait geometries are supplied; unsupported geometries need their own asset and real-device verification. Startup assets can be regenerated from the existing client logo with Pillow and `python3 scripts/crm/generate-assets.py`; normal builds use committed assets.

One canonical attention count excludes imported History and closed/booked work and is independent of aggregate/date/service filters. Foreground pushes request a fresh count; background workers request a minimal authenticated count rather than trusting delayed payload counts. There is no offline private-record cache. Lock screens show generic text and an internal ID destination, never names, numbers or conversation text. Outbox leases and per-device receipts prevent concurrent work and repeat accepted sends; Web Push is an at-least-once transport across a process crash, so stable notification tags suppress visual stacking. Do not claim exactly-once provider delivery after an ambiguous network failure.

## Release gates and rollback

No push is a harmless save: a live push is a release. Local commits stay on `main` until all applicable gates below are met.

1. Verify GitHub main protections/required checks without changing protections. Confirm Netlify's Git integration: the supplied last production deploy was API-sourced with no SHA. A main push must not be assumed to deploy.
2. Inspect the current live deploy ID/commit (if present) and save a verified recovery point. Reconfirm site and dedicated database identity. Review remote migration history/dry run before any production database change:
   `supabase link --project-ref umnxslkgksqyqfwwdztg`, `supabase migration list --linked`, `supabase db push --linked --dry-run`. Apply only the reviewed C1 migration after applicable project checks, with authorized credentials; no local test command authorizes a production reset.
3. Bind server credentials, provision approved roles, verify real sign in and direct unauthenticated/wrong-role/wrong-project API/database denials on HTTPS. Complete reviewed History export/import/replay. Test actual successful, duplicate and failed intake/reconciliation. Check callbacks and explicit booking reports. VoIP is excluded from these gates.
4. Run Android-first physical acceptance, iPhone and desktop checks; record pending checks accurately. Keep push off until controlled registration/provider acceptance/visual receipt tests are possible. Do not represent local mocks as live integration.
5. Re-run baseline/relevant checks, account for existing failures under repository protection policy. Re-fetch immediately before a release: `git fetch origin main`, `git diff --check origin/main...HEAD`, `git merge-base --is-ancestor origin/main HEAD`, `git log --oneline origin/main..HEAD`. Use a plain fast-forward `git push origin HEAD:main` only when protections permit the verified release. No force push or bypass.
6. Verify the deploy picked up the intended candidate SHA, then smoke test public homepage/services, private sign in, live intake and C1 project identity. Record actual release SHA and deploy ID. Neither is known merely because local commits exist.

If private intake or alerts regress, set `CRM_INTAKE_ENABLED=false` and `CRM_PUSH_ENABLED=false` in the authorized Netlify runtime and verify the disabled paths. Restore the verified prior Netlify release if public flows regress (reported recovery ID in PREFLIGHT.md must first be checked). Preserve Netlify submissions, private leads, audit events and the last valid sync watermark. Do not drop the migration or delete customer records as a site rollback.

For Git rollback, inspect the **actual introduced release range**, then revert its commits newest first on main, re-run public/private checks, and release through the same verified process. Never reset or force-push main. Resume polling from a reviewed valid/earlier watermark; uniqueness makes replay safe. A site rollback does not reverse database changes, and server bindings must be reviewed separately.
