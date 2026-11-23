# Premium CRM release gates

This runbook applies to draft PR #4, branch `premium-dashboard`. Do not merge or deploy merely because local tests pass.

## Verified source and tests

- Run `.github/workflows/crm-release-checks.yml` against the release candidate for Chromium, CRM units, disposable PostgreSQL/PostgREST, the populated-schema upgrade, application rollback, and build/SEO checks. [Run 16](https://github.com/AlphaActivities/aksarbenlocksmiths/actions/runs/44867645714) passed at commit `023a04c` before the upgrade and rollback checks were added. Record a successful run for the final candidate SHA.
- Browser viewport emulation is not physical iPhone or Android acceptance.

## Existing production environment

- Netlify project: `aksarbenlocksmiths`
- Supabase production project: `umnxslkgksqyqfwwdztg`
- Production CRM migration history at preflight: `20261117202054 callback_queue` and `20261117211153 owner_memberships`. Do not replay the repository's bootstrap migrations over those existing objects. Reconcile version history and confirm the deployed schema before applying the additive release migrations.
- Premium release migration: `supabase/migrations/202611210001_notification_inbox.sql`.
- Production customer data and existing authentication must remain intact.

## Hosted preview

1. Confirm Netlify build capacity and whether branch deploys can run. Do not purchase build minutes or upgrade the plan without approval.
2. The CRM function is pinned to the production project. Keep the PR preview free of production Supabase bindings. For authenticated hosted staging, use a separate approved deployment, pin that deployment's server code to its own disposable backend, and use only that project's credentials. Verify the runtime target before signing in.
3. For authenticated loopback acceptance, run `npm run build:ci` and then `CRM_TEST_AUTHENTICATED_BROWSER=1 npm run test:crm:http` with Docker and Playwright Chromium installed. The built dashboard goes through the real CRM handler and signed PostgREST JWTs into disposable PostgreSQL, using a synthetic Auth provider. Hosted Supabase Auth, hosted environment bindings, and physical-device acceptance are separate checks.
4. Limit staging access to authorized reviewers. Ensure no real customer data, live intake, or production push dispatch enters the preview.
5. Record preview URL, branch SHA, backend isolation evidence, and results.

## Physical-device acceptance

On actual iPhone Safari and installed Home Screen PWA, and actual Android Chrome and installed PWA, verify:

- Installation and cold launch
- Authentication and session recovery
- Queue, inbox, notification categories and history
- Deep links to authorized records, including after login
- Badge count and clearing behavior
- Sound preference and audible preview after user interaction
- Haptics where supported; explicitly document unsupported behavior
- Notification taps and permission flows only in a separately approved, isolated push test
- Accessibility, keyboard/focus and mobile drawer controls

Record device model, OS/browser, pass/fail and defects. Do not count emulated results as physical acceptance.

## Controlled production release

Prerequisites: passing CI, approved physical acceptance, build capacity, confirmed production backup/recovery plan, and explicit deployment approval.

1. Capture the current Netlify deploy ID and commit, including its last-known-good rollback candidate. At preflight the candidate was deploy `6b00e538bb927938de80a8ce` at `72a6d6a`. Recheck the current deploy and whether it can be republished before starting. Confirm a recoverable database backup and record its timestamp and recovery method.
2. Capture migration history, CRM attention, schema, RLS, and grants. The local bootstrap version `202611170001` differs from the recorded production version `20261117202054`. Use an explicit reviewed selection of the two release migrations against the confirmed production project and record their production migration entries. Avoid a blanket push that tries to replay the bootstrap.
3. Apply `202611210001_notification_inbox.sql` then `202611210002_inbound_calls.sql` before publishing the exact app revision in this PR. Check both migration records, new RPCs and policy grants before permitting app publication. Stop if either step fails and reconcile the recorded database state before retrying.
4. Publish the reviewed GitHub commit, confirm the actual deployed SHA, and smoke-test authorized owner, staff, and client access, the queue and inbox attention count, deep links, history, and Calls with imports disabled. Confirm intake and callback workflows using the agreed production-safe checks.
5. Keep push and VoIP activation outside this rollout.
6. If the app smoke fails, restore the captured prior deploy and rerun role, queue, and attention reads. The rollback rehearsal runs the previously deployed CRM handler against the upgraded database and confirms callback notes and call records survive. Retain both additive migrations and preserve new data. Handle a failed migration or a database incident separately using the recorded migration state and backup plan.

## Completion accounting

The prior 82% figure is a weighted project estimate including VoIP, which is explicitly excluded from this premium dashboard release. Do not declare 100% of the full scope while VoIP remains unimplemented or physical acceptance is outstanding.

## Additional Calls migration

Apply the notification inbox migration and then the additive inbound calls migration before publishing the corresponding app commit. Both were designed for the same C1 project, with no production data copies. Verify the owner-only server import and member read policies against disposable fixtures. Leave CRM_VOIP_ENABLED unset during the first release and keep provider credentials out of any hosted preview. For rollback, disable imports, restore the previously deployed app and preserve the additive tables. Review stored call retention separately before enabling live ingestion.
