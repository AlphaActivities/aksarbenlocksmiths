# VoIP.ms inbound call integration contract

Status: implementation specification, NOT a connected provider integration.

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
