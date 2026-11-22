# VoIP.ms inbound call integration contract

Status: server adapter implemented and tested with synthetic records. Live provider acceptance is pending.

## Goal

Import verified incoming business call metadata into Mike's existing Supabase CRM. Preserve the existing VoIP.ms receptionist, IVR, DID, and forwarding to Mike's personal cell phone. Never originate outbound calls.

## Source-of-truth discovery before coding provider calls

With the account owner present, inspect VoIP.ms in a secure browser session and document:

1. Business DIDs and relationship between public website phone number and the provider DID.
2. IVR menu choices, forwarding destinations, and caller ID behavior.
3. Whether the account permits API access and read-only call detail records (CDRs), webhooks, or export.
4. Actual field names, timestamp timezone, direction, call status, duration, DID, caller number, destination and any stable provider record identifier.
5. Whether recording, transcription or receptionist summaries exist, are enabled, and may be used with consent and appropriate privacy controls.

Do not infer that an IVR choice or answered forwarding leg proves a booked job. Do not store call audio, transcripts, or Mike's personal cell number by default.

## Data contract

A normalized inbound call should include only provider-backed fields:

- provider: voip_ms
- provider_call_id: provider-issued stable ID, if available
- occurred_at: normalized UTC time
- caller_phone: normalized E.164 when supplied
- business_did: verified DID
- direction: inbound, provider-confirmed
- status: provider status, not guessed
- duration_seconds: provider-confirmed integer when available
- ivr_choice: only if the provider actually exposes it
- related_lead_id: optional, matched by normalized phone and verified business project

No external calls or API keys may be made from the browser. Provider credentials must remain server-side, and must never appear in Git, logs or responses.

## Sync and reconciliation

- Prefer provider read-only access with the minimum scopes available.
- Use an explicit, bounded time window and cursor/checkpoint.
- If stable provider IDs exist, enforce a unique constraint on project + provider + provider_call_id.
- If IDs do not exist, do not invent reliable deduplication; document the limitations and require a reviewed composite identity.
- Avoid retroactive alerts for historical imports.
- Never automatically change lead status, callback completion, booking, or assigned staff based solely on a CDR.
- Record ingestion errors and source timestamps; make retries idempotent.
- Apply RLS and server authorization; owner-only controls for syncing and credentials.
- Separate call activity metrics from verified inquiries, callback completions, and booked jobs.
- Do not modify the receptionist or route calls to a new number.

## Acceptance

1. Provider access inspected and actual schema documented.
2. A synthetic provider fixture exercises mapping, filtering and idempotent retry without network access.
3. An authorized read-only provider request is tested, with secrets redacted.
4. Historical CDR import is excluded from urgent notifications.
5. Live inbound call is verified only with the account owner's explicit test-call approval.
6. CRM role boundaries and all previous browser/database/SEO checks pass.
7. Production activation is separate from code review and requires approval.

Until these gates pass, show VoIP.ms as 'not connected' rather than inventing call counts or claiming completed integration.

## Implementation and account evidence

The existing portal inspection verified DID +15314308880, the three-level Aksarben keypad IVR, keys 1–4 forwarding to Mike, no configured AI agents, and an empty call recordings view. The carrier handoff from the public number ending 6715 remains unverified. The inspected API setting was disabled. The new browser session reached the sign-in form. Use an owner-controlled sign-in to recheck account settings.

The CRM adapter uses the documented HTTPS getCDR method for one UTC day per import. It accepts only records with an inbound description, inbound destination type, exact verified business DID and stable provider ID. It stores only the fields used by the Calls view. The CRM preserves VoIP.ms disposition without attributing it to the human forward destination. IVR selections, forwarding legs, recordings and call logs are outside this import.

Configure CRM_VOIP_ENABLED, VOIP_MS_USERNAME, VOIP_MS_API_PASSWORD and VOIP_MS_BUSINESS_DID only in the approved server environment. Confirm VoIP.ms API credential scope and a stable allowlisted egress address before approving activation. Use a provider account or scoped credential with the least available access. The provider's documented REST format places credentials in the request query, so disable request URL logging for provider calls. The application never returns that URL and rejects redirects. Reconcile one already-existing UTC date with the portal as the first live probe. No call origination is required.

An owner explicitly chooses each UTC day. The RPC records the highest successfully submitted day as an audit watermark. It does not imply coverage of earlier dates. Rerun the same day for late entries. Imported dates before today UTC are historical. No call import emits alerts, updates leads, or adds booking events. An optional lead link requires exactly one matching non-historical CRM phone. To pause ingestion, disable CRM_VOIP_ENABLED. Existing Calls rows remain readable to authorized CRM members.

## One-day read-only verification

Netlify's current team plan has no verified static Functions egress. Keep the provider API disabled until an approved egress host has a verified static outbound address and the provider's credential scope has been reviewed. The portal labels its 3CX bearer token for SMS/MMS. The documented REST API uses an account email, API-specific credential and source-IP allowlist. The account API exposes write methods, so do not treat the IP allowlist as a read-only permission.

On the approved host, keep `CRM_VOIP_ENABLED` unset and set `VOIP_MS_INSPECTION_IPV4` to the verified single public IPv4. The probe contacts `https://checkip.amazonaws.com/` without credentials and stops on an egress mismatch before making the credential-bearing CDR request. Inject provider secrets privately at run time after the host and account access are approved. Set `VOIP_MS_BUSINESS_DID` and `VOIP_MS_INBOUND_CALL_TYPE` using the provider-confirmed filter for the exact inbound DID. Run `node scripts/crm/inspect-voip-day.mjs YYYY-MM-DD` once for an approved completed UTC date. The probe returns counts and field names and does not invoke Supabase. Compare it with the portal in UTC before a separately authorized import. Keep account, billing, call logs, and unrelated call legs outside the CRM payload.

Use an existing approved fixed-egress machine or network first. Confirm the public IPv4 is reserved or contractually static and verify the observed address from the exact runtime used for the probe. When provider access is approved, cross-check the source with VoIP.ms getIP. A single observed address on a serverless runtime does not establish stable egress. Do not allowlist a shared cloud range. Ordinary Supabase Edge Functions and the connected Netlify Free team are unsuitable for a verified static outbound address. Cloudflare's dedicated egress entitlement could not be verified from the connected account.

### Temporary inspection host

1. On the actual Ubuntu machine and intended network, run `curl -4fsS --max-time 10 https://checkip.amazonaws.com/` and compare privately with the static public IPv4 shown in the ISP account or assignment confirmation. Check the router WAN address for carrier NAT or an upstream gateway. A manually configured LAN address or DHCP reservation is insufficient. Verify egress from the same environment used for the probe, with VPN and proxy settings accounted for.
2. If Ubuntu cannot be verified, obtain cost approval before provisioning an Ubuntu OS-only Lightsail instance with the Linux public IPv4 bundle. The published US price for the smallest bundle is $0.0067/hour, capped at $5/month. A static IPv4 costs no extra while attached. Instances accrue charges while stopped. An IP left unattached for over an hour can incur $0.005/hour. Confirm the live quote and region in the owner account. Skip snapshots and extra services. [AWS pricing](https://aws.amazon.com/lightsail/pricing/) and [billing details](https://docs.aws.amazon.com/lightsail/latest/userguide/amazon-lightsail-frequently-asked-questions-faq-billing-and-account-management.html).
3. Use a temporary authorized IAM identity or the owner's delegated console access. The CLI lifecycle requires the applicable Lightsail create, describe, firewall, static IP attachment and cleanup actions. For a temporary operator key this includes `CreateInstances`, `GetInstance`, `GetInstanceState`, `GetBlueprints`, `GetBundles`, `GetRegions`, `ImportKeyPair`, `DeleteKeyPair`, `PutInstancePublicPorts`, `GetInstancePortStates`, `AllocateStaticIp`, `AttachStaticIp`, `GetStaticIp`, `DetachStaticIp`, `ReleaseStaticIp`, and `DeleteInstance`. Add `TagResource` when creating tagged resources and `GetInstanceAccessDetails` if using browser SSH. Check effective policy and region before provisioning. Restrict SSH to the operator source, leave application ports closed, and verify the attached IP matches the probe runtime's egress. [AWS action and resource reference](https://docs.aws.amazon.com/service-authorization/latest/reference/list_lightsail.html).
4. Ask VoIP.ms to confirm the narrowest credential scope and whether the business DID can be filtered server-side. Verify the inbound filter and portal comparison date first. If only a broad API password is available, get approval for the specifically identified scope and temporary controls before using it. Allowlist only the verified address and keep the credential out of shell history, deployment configuration and request logs. Enable API access as late as possible and agree on the revocation steps before the probe.
5. After the one-day read or on failure, restore the prior API state, revoke the temporary credential and remove its allowlist entry before releasing the host IP. If using Lightsail, clean up the temporary host and its key and confirm the static IP is released. Keep only the sanitized aggregate result. A portal-only comparison remains an option with API disabled, but it cannot verify the API payload.

If no approved host exists, a temporary Linux VPS with an attached reserved IPv4 can run the one-day probe without any customer-facing app or inbound HTTP endpoint. Keep Netlify and Supabase unchanged during the probe. Confirm whether the provider can issue a CDR-only credential. If only the broader account API password is available, first get approval for that scope, then use the dedicated API password on the one verified address for the shortest practical window. Revoke temporary access and release any temporary paid resources after verification.

Both the probe and manual import now require the provider-confirmed inbound Call Type. The importer rejects a batch if the same stable record ID appears with conflicting normalized metadata. The disposable HTTP test covers the owner-only import, replay, lead linkage and unchanged queue.

For multiple verified business numbers, configure VOIP_MS_INBOUND_ROUTES on the server as a JSON array of objects with did and callType strings. Each route requires a confirmed inbound filter and exact destination. The legacy single route still works. Each day is written in one transaction after all routes succeed. An owner can retry the date after a transient failure. The November 22 update below supersedes the original 100 record display limit.

## Bidirectional call history, development branch

The website publishes (402) 556 6715. The prior account inspection documents (531) 430 8880 as an IVR DID. There is no documented carrier handoff between those two numbers, outbound caller ID assignment, or evidence that calls placed from a separate handset traverse VoIP.ms. Reconcile carrier forwarding records and a UTC portal sample for each direction before claiming business wide coverage. An answered IVR leg cannot establish that Mike answered. A missed incoming record means the provider reported no answer, busy or failed.

The November 22 migration keeps the existing table and defaults legacy records to incoming. Both directions have a caller and dialed number. On import, only a unique eligible customer phone links. Unmatched rows remain visible. Open Customer call history on a lead to page backward through every linked record. Filters run before pagination. Existing staff callback, notification and assignment workflows remain independent of provider outcomes.

Each verified inbound route may also specify an outbound object with callType, destinationType and description. These must be the exact confirmed values for ordinary outgoing customer calls, distinct from forwarding. The caller ID must match the configured business identity. Synthetic values exercise this contract. Confirm provider identifiers, redacted fields, outbound identity, forwarding exclusion, per day limits and call leg semantics before activating. Unknown routes cannot establish completeness.

The optional single process worker runs with node scripts/crm/sync-voip.mjs on an approved host. Supply the existing server settings plus CRM_VOIP_START_DAY (first UTC day to recover) and CRM_VOIP_CURSOR_FILE (a private durable writable path). Supervise one instance with process restart. It polls today and yesterday each minute and catches up one older day per successful cycle. Completed days replay safely after an interruption. Failed cycles back off from one to sixty seconds. The UTC heartbeat logs only sync_ok or sync_failed. Older amendments beyond the overlap require a manual replay. Large responses beyond the adapter limit require reconciliation. Polling frequency does not guarantee provider publication time.

Final delivery review: the official API overview permits a DNS hostname on the source allowlist. It must resolve to the actual requesting host's egress. This does not make an inbound website hostname or shared serverless pool an exclusive source. The provider documents account CDRs and direction and disposition filters. No supported free voice CDR push covering the full account was identified. No automated delivery path meeting the present account and hosting constraints is verified. Manual portal review remains available. Oracle remains a backup only.

Sources: https://wiki.voip.ms/article/API_Overview and https://wiki.voip.ms/article/Call_Detail_Records
