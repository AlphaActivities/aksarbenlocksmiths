# Luxury preview verification — 2026-11-23

Inspected development source: `5f434ea0b083949b919aaa390e90e39ef27d77c1`,
branch `work/luxury-ui-foundation-20261123`, draft PR #5.

The supplied historical Work publication is version 12, November 22, source
`5af1835aaf2e592697e64adf9f657171f8ce18b`. This is user-provided history;
the currently deployed source could not be independently verified.

## Corrections

The prior commit correctly updated the authenticated Queue route assertion.
Continuing that test exposed stale count-bearing notification selectors and a
real owner-page crash when a staff member's email is null. The staff list now
renders, searches and sorts nullable emails safely. A browser regression covers
this case. Other changes update assertions to the existing UI wording/routes.
No compiler settings, production bindings or schema changed.

## Local commands and results

All run from the repository root, using synthetic fixtures/disposable databases:

```sh
npm ci --cache /workspace/.npm-cache --no-audit --no-fund
npm run check:crm
npm run test:crm
npm run test:crm:db:wasm
npm run build:ci
CRM_TEST_AUTHENTICATED_BROWSER=1 CRM_CHROMIUM_PATH=/usr/bin/chromium npm run test:crm:http
CRM_CHROMIUM_PATH=/usr/bin/chromium npx --cache /workspace/.npm-cache playwright test --project='Android Chrome emulation' --project='iPhone viewport emulation (Chromium)' --project='Tablet viewport emulation' --project='Desktop Chromium'
git diff --check
```

PASS: installation, dashboard TypeScript, 29 CRM tests, disposable database
policies/upgrade preservation, production build, authenticated browser with real
signed PostgREST/JWT/RLS and rollback compatibility, and all 48 Chromium browser
cases. These include role gates, cookies/session refresh, callback outcomes,
notification counts, emergency public path, direct routes, viewport overflow,
reduced motion and nullable-email owner access.

Native WebKit installation was blocked by proxy HTTP 403 at every official
Playwright CDN endpoint. Native WebKit and physical iPhone/Safari acceptance
remain separate gates unless verified by GitHub CI or another environment.

## Hosting investigation and remaining gates

Existing URL: https://aksarben-admin-review.alphaactivities.chatgpt.site/admin/

Requests are blocked at this environment's proxy CONNECT with HTTP 403, before
an application response. No original Work session/deployment record or Work
publisher is exposed in available tools or repository files. The GitHub workflow
runs checks only; `vite preview` is a local server, not Work publication. Thus no
exact Work publication command, current deployed SHA, authentication status,
expiry or hosting cost can be verified here. No preview was created or updated.

Use the original Work session's publisher to replace the existing site's version
only after checking out the final verified development commit and confirming an
isolated synthetic backend and private authentication. The repository handler
pins the production Supabase target; it must not be used with production secrets
or records for this preview. Do not copy a production binding into preview.
After publication, independently verify publisher source SHA/version, private
sign-in, role restrictions, synthetic-only records, direct routes and responsive
layouts at the same URL. This is a required handoff, not a verified publisher API.

Juan's and Darcy's exact preview URLs/publishers were not recoverable from the
accessible workspace or public GitHub records. No URLs were guessed.

Local pre-existing branch `work` was preserved at its original SHA under
`preserved/work-before-luxury-20261123` so the requested `work/...` branch could
be checked out. Other local work was preserved. No main merge, production data,
Supabase schema, Netlify deployment or environment publication was performed.
