# C1 account administration and password recovery

The initial passwords remain user-assigned; no first-login password change is forced. Never put account passwords or Auth keys in source, logs, test fixtures, or reports. Create individual Auth users through private administration, then bind their actual Auth UUIDs to C1 memberships. Only Josh receives `josh_admin`; staff and client roles cannot use owner APIs or database administration RPCs. Never provision memberships by copying a UUID from another project.

The new owner-only staff management screen lists C1 members and can add, change, or remove staff/client access for existing Auth accounts. It cannot create Auth passwords, promote another owner, or remove/reassign the owner. Server role checks and database RPC checks both enforce this. Ordinary authenticated roles have no direct membership write policy/grant. Removing membership prevents subsequent application requests even if an Auth session still exists. Customer records are retained.

## Recovery configuration and operation

- Site URL: `https://aksarbenlocksmiths.com/admin`.
- Exact allowed redirect: `https://aksarbenlocksmiths.com/admin/reset-password`.
- Use Supabase Auth's normal recovery template and an authorized SMTP provider. The default provider is restricted to eligible organization team addresses; do not add customers to the Supabase organization to work around email restrictions.
- Forgot password and My Settings both lead to recovery. Requests always return the same account-neutral message, including provider failures; public confirmation is not evidence of delivery. Inspect provider delivery separately during acceptance.
- The server creates an S256 PKCE challenge and stores only signed, short-lived HttpOnly/Secure/SameSite verifier state. The email must be opened in the same browser within 10 minutes. A new request replaces that browser's earlier verifier. Opening in another browser requires a new request there.
- The callback code is removed from the address bar before any API request; no session tokens or passwords go to browser storage or analytics. Verification requires an explicit click, avoiding automatic consumption by page scanners. Supabase exchanges the single-use code only with the matching verifier. It validates the user, and C1 membership is checked before creating a separate 10-minute recovery cookie.
- Password update requires valid signed recovery state and rechecks Auth and membership. Ordinary application cookies cannot substitute for recovery state. New voluntarily chosen passwords require at least 12 characters; this does not change the initial account passwords. Errors never include provider bodies. After success, recovery and app cookies are cleared, provider sign-out is requested, and fresh login is required.
- Invalid, expired, used, cross-browser and non-member recovery attempts fail closed and offer a fresh request. Passwords are never changed on page load.

## Validation and remaining live gates

`npm run test:crm`, `npm run check:crm`, `npm run test:crm:db:wasm`, and production build cover API security, generic recovery responses, PKCE cookies, invalid/used links, recovery-only password updates, role isolation, membership management, callback history, follow-up scheduling, booking and replay-safe persistence. The embedded PostgreSQL suite is disposable, without a production connection. The Docker/PostgreSQL 15 suite remains available separately.

The local browser runner could not launch Chromium in the current executor (socket creation denied), so no browser-fixture pass is claimed. Check the deployed UI separately. Passing API mocks or disposable database tests does not prove real Auth login, SMTP delivery, inbox receipt or live workflows. Those require the three approved private accounts and an authorized inbox. Keep CRM intake, push and VoIP disabled until their respective live gates pass; preserve Netlify submissions and reviewed History.

## Other clients

C2 Missy is read-only in this task. Its source already has Forgot password, email reset, recovery state, matching-password validation, invalid-link errors and voluntary password changes. Its signed-in change-password screen was inspected without submitting a change or sending an email. Delivery and full recovery were not reverified. Preserve the existing implementation.

C3 Juan and C4 Darcy implementation briefs receive the same recovery requirement and acceptance gate. No source, database or deployment changes to those projects belong to this C1 release.

References: https://supabase.com/docs/guides/auth/passwords ; https://supabase.com/docs/guides/auth/sessions/pkce-flow ; https://supabase.com/docs/guides/auth/auth-smtp
