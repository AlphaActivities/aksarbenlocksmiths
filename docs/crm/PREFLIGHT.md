# C1 implementation preflight — 2026-11-17

Read all nine pages of `C1_Mike_Aksarben_Locksmiths_Codex_Blueprint.pdf`, including commands and the final Android/desktop page. The user adopted it as the implementation specification. Josh's subsequent update defers **all VoIP.ms work**; it is not a launch dependency. Google Play internal testing is an optional later release.

## Verified repository and supplied targets

- Origin identity: `github.com/AlphaActivities/aksarbenlocksmiths`; clean checkout switched from environment branch `work` to existing remote `main` workflow, without a new worktree.
- Fetched `origin/main` and baseline HEAD: `52c3ba6afaa866696945e1faa9b3508a381e301a`. No delta from the blueprint's inspected baseline.
- Netlify: `aksarbenlocksmiths`, site ID `1468843e-3044-4988-a4d8-c9bb7ba6e87a`, URL `https://aksarbenlocksmiths.com`.
- Josh reports published deploy `6a9b6e96951ee5ce30d94d0b`, production context, branch `main`, source API, no Git commit reference. This is the **reported recovery deploy**, not independently verified in this environment. Git-to-Netlify deployment linkage remains unverified.
- Authorized dedicated Supabase project: `umnxslkgksqyqfwwdztg` in Business Marketing V1. No existing Supabase config, migration history or database binding found in this checkout. No live database mutation has been made.
- Internal application project ID: `c1000000-0000-4000-8000-000000000001`. Cross-project memberships do not authorize access to this app.
- Read-only design reference: `AlphaActivities/Missy-dours-homes` at full revision `232babd5b9351b3be2814c4d58c8edeafe66e5ad`, read through Git objects in `/tmp/c1-missy-reference`. No changes or pushes to Missy's repository. Reviewed entrance, haptics, worker and startup registration. Reused interaction principles, not Missy's assets, credentials or data.

## Baseline commands, before first source edit

| Command | Result |
| --- | --- |
| `git status --short --branch` | Clean; initial environment branch `work` |
| `git fetch origin main` | Pass; Git read authentication works |
| `git switch main` | Pass; tracks `origin/main` |
| `git rev-parse HEAD origin/main` | Both the SHA above; no merge necessary |
| `npm ci --cache /workspace/.npm-cache --no-audit --no-fund` | Pass, frozen lockfile |
| `npm run lint` | Existing failure: 90 errors, 8 warnings |
| `npm run media:check` | Pass; script skips strict media unless `NODE_ENV=production` |
| `npm run build` | Pass; Vite output `dist`, sitemap generated |
| `npm run build:ci` | Existing failure: SEO check, `common-lock-problems-la-vista-businesses-face` has 10 keywords, expected 6–8 |
| `tsc -b` | Existing failure: 71 TypeScript diagnostics |

Initial baseline used the machine's Node 24.22.1/npm 11.9.0. Repository hosting config pins Node **18.14.0**; a verified npm-distributed Node 18.14.0/npm 9.3.1 toolchain was installed outside the checkout to validate that major too. The existing ESLint dependencies require at least 18.18.0; record this mismatch rather than silently updating the hosting runtime. Current new code checks and release builds are documented in RESULTS.md.

No Netlify, Supabase or VoIP credential bindings were present by exported variable name. A `GH_TOKEN` binding exists, but a read-only GitHub API request was denied by the network proxy (403 CONNECT); branch-protection and deployment API reads are unverified. No credential values were printed. Codex cloud environment configuration was left unchanged.
