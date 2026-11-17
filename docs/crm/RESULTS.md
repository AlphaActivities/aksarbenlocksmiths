# C1 implementation evidence — 2026-11-17

## Release state

Implemented and committed locally on **main**. No push, production database migration, live history import, function deployment or Netlify release was performed. The remote main was re-fetched during final checks and remained `52c3ba6afaa866696945e1faa9b3508a381e301a`; `git merge --ff-only origin/main` reported already up to date. The implementation commit before this evidence document is `6fe0780` (private dashboard); earlier focused commits are listed below. The final documentation commit changes the candidate HEAD; use the exact full SHA in the task's final report or `git rev-parse HEAD`.

**Live release SHA: none.** Netlify deploy `6a9b6e96951ee5ce30d94d0b` is Josh's supplied prior-production/recovery identifier, not a new release or an independently inspected deploy. It was API-sourced and had no Git SHA. GitHub protections and Git-to-Netlify deployment linkage remain unverified. Do not push merely to discover whether production deploys.

Authorized target identities: Netlify site `1468843e-3044-4988-a4d8-c9bb7ba6e87a`, Supabase `umnxslkgksqyqfwwdztg`. No usable Netlify/Supabase bindings were present in the process. Native Git reads worked; GitHub API access received a proxy CONNECT 403. Codex environment configuration was not edited, reapplied or published. Missy's repository was read through Git objects at `232babd5b9351b3be2814c4d58c8edeafe66e5ad` without edits/pushes.

## Implemented

- Separate `/admin` entry, individual sign in and server session validation, C1 membership checks, Josh-only Admin route/API, staff/client lead work, no private GA initialization or private-data caching.
- Urgent inquiries/callbacks/scheduled queue; original dates/age, source, area, service, urgency and next action; detail/note/follow-up/outcome work; explicit callback completion and booking reports; filtered History outside active counts.
- One migration, `202611170001_callback_queue.sql`: nine namespaced CRM tables, RLS, restricted RPC grants, one Josh admin per project, transactional ingestion and audit events, provider/handoff identity constraints, optimistic work versions, retry keys, per-device preferences/receipts and leased outbox.
- Authenticated canonical Netlify polling, scoped to the verified site/form; retry-safe writes and overlapping watermark. Existing `contact` intake remains the recovery source. Intake and push switches default off and are independent.
- Review-bound export/dry-run/import tools. History preserves provider IDs/dates, creates no alert or active count and is excluded from fresh-inquiry/outcome reports. Tests prove replay creates zero new duplicates. **No actual historical customer records were exported, reviewed or imported.** The earlier reported 43 records is not asserted as current or legitimate.
- Public emergency click-to-call retained, additive area/urgency validation, immediate emergency exit in a bounded callback assistant, durable handoff identity and private recorded conversation; staff claim/return state. This is a callback intake assistant, not a live two-way human/LLM chat service.
- Branded standalone manifest, regular/maskable/Home Screen icons, twelve portrait startup images from existing client branding, matched bootstrap logo, measured four-second entrance, Reduce Motion and supported vibration fallback.
- Explicit notification enrollment, device refresh/remove/test/visual receipt, individual inquiry/handoff/follow-up preferences, minimal lock-screen copy, safe internal tap destinations, `/admin` and `/admin/` recognition, canonical attention reconciliation and zero clearing. Provider acceptance is distinct from human receipt.
- Customer contact fields/free text/private URLs removed at the public GA boundary; phone/email taps represent intent, Netlify acceptance is separate from durable CRM inquiry events. No fresh GA event is emitted by history import.

VoIP.ms is **entirely deferred**, including credentials, CDR, test calls and automatic missed-call alerts. It is not a release gate. Google Play internal testing remains an optional separate release.

## Commands and observed results

| Command/check | Observed result |
| --- | --- |
| `npm ci --cache /workspace/.npm-cache --no-audit --no-fund` | Pass; frozen lockfile, also verified on Node 18.14.0/npm 9.3.1 |
| `npm run test:crm` | **13/13 pass**, also pass on Node 18.14.0; no skipped tests |
| `npm run check:crm` | Pass: new admin/assistant/privacy code lint and TypeScript |
| `npm run test:crm:db` | Pass on **two fresh disposable PostgreSQL 15 stacks**, migration plus policy/RPC assertions |
| `npm run test:crm:http` | Pass: actual signed PostgREST JWT → PostgreSQL RLS/RPC through the application API; auth-provider response is a test double |
| `NODE_ENV=production npm run build` | Pass on Node 24.22.1 and pinned **18.14.0**; strict required-media check passed; both public/admin entries in `dist`; sitemap generated |
| `node scripts/assert-sitemap.mjs` | Pass: required blog URLs present |
| `CRM_CHROMIUM_PATH=/usr/bin/chromium npm run test:crm:browser` | **9/9 pass**: Android emulation first (3), iPhone viewport in Chromium (3), desktop Chromium (3); no skipped tests |
| esbuild bundle of all three server functions, target `node18`, followed by Node 18 invocation | Pass: CRM fails closed without bindings; scheduled intake/push remain disabled |
| `npm run media:check` | Pass; bare command skips strict checks by design; production build above ran the strict check |
| `npm run lint` | Existing failures remain: **87 errors / 8 warnings**, down from baseline 90 / 8; new app's scoped lint passes |
| `tsc -b` | Existing failures remain: **70 diagnostics**, baseline 71; normalized comparison found **zero new diagnostics** |
| `npm run build:ci` | Existing SEO failure remains: one post has 10 keywords, expected 6–8. Vite/sitemap stages pass |
| Supabase CLI 2.58.5 download/checksum, `start --help` | Pass; checksum verification preserved |
| Full `supabase start` | Failed: default ECR denied access; supported Docker Hub mirror then exhausted Docker layer extraction space. Stopped that attempt; no production operation occurred |
| `supabase db reset --local`, full-stack `supabase status` | **Not run** because the full stack never became ready; lighter real database/HTTP tests passed instead |
| Remote migration history/dry-run/push and function/site deployment | **Not run**: live bindings/access and release verification unavailable |

Database checks exercise transactional rollback on failed intake; provider retry and handoff replay; original History timestamps and zero History alerts; anonymous/wrong-project denials; privilege-escalation/direct-ingest rejection; staff/client work and exclusive claims; callback completion/booking deduplication; device isolation; and exclusive notification leases. HTTP checks additionally reject a forged JWT and confirm account preference isolation. Browser checks use explicit synthetic API fixtures and prevent requests to the live analytics property. They exercise sign in, retained deep links, phone href, notes/scheduling/outcomes, History/filter count separation, staff Admin denial, My Settings, manifest/worker scope, direct-route reload, public emergency exit and rekeying route. They are not live provider tests.

## Still pending before a live release

1. Secure bindings for the confirmed Netlify/Supabase targets; verify Netlify form ID and current fields in the authorized account. Inspect the actual current deploy, main protections and deployment linkage. No credentials are requested in chat.
2. Remote migration-history comparison/dry run, approved migration application, individual account provisioning and real Supabase Auth/session refresh tests. Re-run wrong-role/wrong-project checks against deployed APIs/database policies.
3. Authorized current Netlify export, spam/test/duplicate review, dry run, legitimate-only History import, original-date verification and replay proving inserted=0 and no alerts. Then set the reviewed live cutoff and enable/test canonical intake.
4. Controlled actual form acceptance, failed persistence/recovery, retry, handoff, callback and booking checks on reachable HTTPS. Netlify scheduled invocation behavior must be verified in the site's deployment.
5. **Physical Android first**: Mike's model/Android/Chrome details are unavailable; native installation, dialer and closed-app lead/handoff alert receipt/tap/badge tests remain pending. iPhone Safari/Home Screen/OS/haptics/startup-image alignment and installed desktop Chrome notification tests are also pending. iPhone viewport emulation is not Safari acceptance. Record actual device/browser/OS data when tested.
6. Actual push-provider acceptance, permission denial, registration/removal, selected-device test and explicit visual receipt. No physical or live push receipt is claimed. Keep automatic delivery disabled until controlled checks can be run.

The complete secure binding list, operating commands, release gates and step-by-step acceptance checklist are in [RUNBOOK.md](RUNBOOK.md). No gate above depends on VoIP.ms.

## Commit/recovery trail

- `e3b9c22`: verified targets, adopted scope and baseline evidence.
- `7fce8d3`: database model, policies and disposable repeatability checks.
- `4e2a3ad`: authenticated API, canonical intake, history tools and push outbox.
- `c85fc2f`: pending-callback counts, outcome deduplication and scoped grants.
- `22ae447`: public callback assistant/intake/privacy and API validation.
- `6fe0780`: private dashboard, installability, assets, device settings and browser tests.

No live rollback is currently necessary. If a future release regresses, first disable `CRM_INTAKE_ENABLED` and `CRM_PUSH_ENABLED` in the authorized Netlify runtime, preserve submissions and the last valid watermark, and restore the **verified** prior site release if public flows need recovery. The supplied recovery deploy ID above must be inspected before using it. For Git, inspect the actual release range, revert its commits newest first, validate and release through verified protections; never force-push/reset main. Retain the additive database migration/customer data; review the backend separately and reconcile from a valid/earlier watermark with deduplication. Full commands and rationale are in the runbook.
