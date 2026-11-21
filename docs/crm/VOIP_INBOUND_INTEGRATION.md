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
