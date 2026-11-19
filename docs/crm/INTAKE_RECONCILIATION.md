# C1 intake reconciliation milestone — issue #3

Work branch: `codex/c1-intake-reconciliation`.
Issue: https://github.com/AlphaActivities/aksarbenlocksmiths/issues/3
Starting branch SHA: `763e66e9552e947872862a13bc5766dd8955c1b6`.

## Reconciliation and preservation

The original checkout was clean at `f56e31c94f4a4fa4c78ade2a2e2b3c72028ba6bd`. The dedicated remote development branch contains that complete seven-commit implementation plus the routing fix from PR #1 and password recovery/owner-only staff management from PR #2. Those changes are retained. Local `main` stays at its original SHA; no main push or production operation belongs to this milestone. The checkout originally fetched only main; the development branch now has its own additive local fetch/tracking configuration. No user edits were discarded, no main merge/reset was performed, and the existing release bundle remains untouched.

GitHub's API endpoint was blocked by proxy CONNECT 403, but the issue body was recovered from the GitHub HTML page. The private review URL, `https://aksarben-admin-review.alphaactivities.chatgpt.site/admin/`, also returns proxy CONNECT 403 in this environment. Independent review-host inspection/parity is therefore still pending.

Josh supplied the preview-only filter CSS in chat. It is ported deliberately: date/select controls have `min-width:0` and `max-width:100%`, native date appearance is removed and date padding-inline is 8px; up to 800px the filters use two `minmax(0,1fr)` columns with a 12px gap, zero-margin/min-width labels/buttons, and full-width service/Refresh rows. Browser assertions cover widths 320, 375, 393 and 800px. Netlify's existing direct admin/API rewrites are retained. The preview-host-only fallback and separate browser CRM adapter are **not** ported into production source.

## Intake changes

- Verify exactly one configured `contact` form in the authenticated catalogue for C1's fixed Netlify site. Explicit foreign catalogue site IDs fail closed. A catalogue representation may omit `site_id` because the authenticated endpoint itself is site-scoped.
- Every submission must include the configured `form_id`; a supplied `site_id` must match C1. Provider IDs must be bounded string IDs; malformed data or handoff IDs cannot silently create a different intake kind.
- Cutoff, provider dates and stored watermarks require an explicit ISO timezone and a real calendar date. Reject future cutoffs/cursors; normalize offset/microsecond timestamps consistently. The cutoff is inclusive, and the 15-minute overlap never crosses it.
- Store the cursor under `netlify:<site-id>:<form-id>:<canonical-cutoff>`. A cursor from another form/cutoff cannot skip this configuration's records. Legacy `name=netlify` rows are not modified or reused. First use of a scoped key starts at the **reviewed configured cutoff** and may replay existing accepted records; database uniqueness resolves those records without reopening them or producing another alert.
- Validate the entire bounded poll before persistence. Invalid later pages, provider failures, incomplete pagination and excessive eligible batches do not partially persist earlier pages or advance the cursor. Maximum eligible batch: 500, matching the existing transactional RPC; maximum scan: 100 pages of 100. A larger eligible backlog fails closed and needs a separately reviewed reconciliation plan—do not move the cutoff forward merely to silence this guard.
- Persist a validated batch in one existing `crm_ingest` transaction, then save its watermark. No database migration or change to existing RLS/owner policies was needed. If the cursor write fails after CRM persistence, retain the durable lead and safely replay; do not classify that as a rejected visitor submission or delete the lead.
- Added owner-only `GET /api/crm/reconcile` for non-writing inspection while unattended sync remains disabled. It returns only site/form/cutoff/window/count evidence, never contact details or tokens. `eligible` means eligible provider records, **not** guaranteed new CRM leads. Staff/client requests are rejected before provider reads. Existing `POST /api/crm/reconcile` remains explicitly mutating and disabled by default along with scheduled sync.

This validates supplied bindings and time semantics, not the business correctness of the real rollout date. The real form ID, cutoff, provider representation, timezone and deployment bindings still require authorized live verification. No live intake or push switch was enabled or changed.

## Proof using fixtures and disposable PostgreSQL

`tests/crm/fixtures/intake.mjs` contains only synthetic provider data and a fetch double that rejects unrecognised URLs. The full HTTP proof in `tests/crm/intake-http-integration.mjs` runs only against the loopback PostgREST/PostgreSQL instance created by `scripts/crm/test-http.sh`. It never delegates a Netlify request to the network or contacts production Supabase. Synthetic JWTs are valid only for that disposable test stack.

Observed first valid submission: `inserted=1`, `duplicates=0`; one correct lead with original provider ID/date, service, area and urgency. Observed same-ID replay within overlap: `inserted=0`, `duplicates=1`; still one inquiry event and one outbox record. Concurrent same-ID requests together insert exactly one lead. Spam/honeypot/pre-cutoff/future records do not become leads. Invalid/wrong-form/wrong-site records, provider failures and failed persistence leave counts and cursor unchanged. A simulated cursor failure after successful persistence recovers by replay with zero additional leads. Existing synthetic History is byte-for-byte unchanged. The dispatcher is never invoked; no actual notifications are sent.

## Commands and results

| Command | Result |
| --- | --- |
| `npm ci --cache /workspace/.npm-cache --no-audit --no-fund` | Pass, frozen lockfile |
| `npm run test:crm` | Pass: 32 focused tests, including existing recovery/owner tests and 14 intake tests |
| `npm run check:crm` | Pass: scoped dashboard lint and TypeScript |
| `npm run test:crm:http` | Pass: existing actual HTTP/JWT/RLS checks plus full fixture-Netlify-to-database intake/replay proof |
| `npm run test:crm:db` | Pass: both migrations and intake/owner policy assertions on two fresh PostgreSQL 15 containers |
| `npm run test:crm:db:wasm` | Pass: disposable embedded PostgreSQL intake and owner policy/RPC assertions |
| `NODE_ENV=production npm run build` | Pass; public/admin output, strict media check and sitemap generated; also validated with pinned Node 18.14.0 |
| `node scripts/assert-sitemap.mjs` | Pass |
| `CRM_CHROMIUM_PATH=/usr/bin/chromium npm run test:crm:browser` | Pass: 15 cases, Android Chrome emulation first, iPhone viewport in Chromium, then desktop; includes recovery, roles, callback/note/schedule/booking, History, direct routes, emergency calling and narrow filter layout |
| `tsc --build tsconfig.json --force --pretty false` | Existing full-project failure: 70 diagnostics, exactly identical to a source snapshot of `763e66e` with the same installed compiler/dependencies; zero new diagnostics |

All data-writing tests use fixtures, disposable containers or an in-memory database. No production customer/marked-test records, schema, secrets or Netlify deployments were altered. Repository main is not a delivery target. VoIP remains deferred; optional intake/push stay unverified and disabled.

## Remaining live acceptance and rollback

1. Independently compare the actual review UI after access is available; validate the supplied CSS on physical Android first, then iPhone Safari and desktop. Emulation is preliminary evidence, not physical-device acceptance.
2. In an authorized read-only session, verify the real site/form identity, submission shape and reviewed cutoff, then invoke owner-only inspection and confirm the scoped cursor/window. Do not enable unattended polling from fixture evidence alone.
3. Verify approved owner/staff/client login, real password recovery/SMTP/inbox delivery, account management and direct API/RLS denials on the isolated preview. No customer records should be used as test fixtures.
4. If separately approved later, use only explicitly marked test records in a non-production stack for live-provider submission/replay/failure acceptance. Preserve real History and existing Netlify notifications. Production records, migrations/secrets and synchronization switches remain outside this milestone.
5. Push/review only the development branch. No main push, Netlify release or environment publication is authorized by this milestone.

Rollback is a development-branch revert of this milestone's commits, followed by the same fixture/disposable checks. No database rollback is required because no migration was added or applied to production. Keep the development branch isolated until preview parity and live API acceptance are independently established.
