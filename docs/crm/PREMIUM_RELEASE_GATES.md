# Premium CRM release gates

This runbook applies to draft PR #4, branch `premium-dashboard`. Do not merge or deploy merely because local tests pass.

## Verified source and tests

- The development executor reported 32 Chromium browser checks, 19 CRM unit tests, disposable PostgreSQL/PostgREST migration tests, and build/SEO checks passing.
- The repository includes `.github/workflows/crm-release-checks.yml` to repeat checks in GitHub Actions. Verify an actual successful run before treating CI as passed. A missing workflow run is not a pass.
- Browser viewport emulation is not physical iPhone or Android acceptance.

## Existing production environment

- Netlify project: `aksarbenlocksmiths`
- Supabase production project: `umnxslkgksqyqfwwdztg`
- Production CRM migration history at preflight: `callback_queue`, `owner_memberships`.
- Premium release migration: `supabase/migrations/202611210001_notification_inbox.sql`.
- Production customer data and existing authentication must remain intact.

## Hosted preview

1. Confirm Netlify build capacity and whether branch deploys can run. Do not purchase build minutes or upgrade the plan without approval.
2. Keep preview Supabase environment variables unset until a safe isolated backend and test identities are configured. Never copy production service-role keys into preview contexts.
3. If a test-only backend is unavailable, use the existing synthetic-data local preview for UI checks, but do not label hosted authenticated staging as passed.
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

1. Capture the deployed Netlify commit, current migration history and CRM attention baseline. Preserve the existing customer data.
2. Review the additive migration SQL, privileges, RLS and schema compatibility once more.
3. Apply the notification inbox migration to the existing production Supabase project using the migration mechanism, before publishing code that calls the new RPC.
4. Verify the new RPC exists and has expected role access without creating or modifying customer records.
5. Deploy the reviewed GitHub commit, verify the actual deployed SHA, then smoke-test owner, staff and client navigation and notification reads with authorized sessions.
6. Confirm existing lead intake, callback actions, deep links, badge count and history remain correct.
7. Leave production push disabled unless separately approved. Do not modify VoIP routing.
8. If verification fails, stop new rollout, restore the prior app deploy where supported, and diagnose database compatibility. Do not blindly roll back database changes or delete customer data.

## Completion accounting

The prior 82% figure is a weighted project estimate including VoIP, which is explicitly excluded from this premium dashboard release. Do not declare 100% of the full scope while VoIP remains unimplemented or physical acceptance is outstanding.
