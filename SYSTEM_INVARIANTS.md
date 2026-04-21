# System Invariants

These invariants are part of acceptance criteria. If implementation differs, update this document and the tests in the same PR.

## Booking And Payment

- All booking/payment transitions go through Postgres RPCs only.
- TypeScript may call commands, validate UI input, and render results, but must not reimplement transition logic.
- All active booking holds and confirmed bookings occupy normalized 15-minute buckets.
- A business cannot have more than one active booking/hold in the same bucket for MVP.
- Booking holds must exist before payment is requested.
- A payment can confirm only a locked `pending_deposit` booking whose `held_until` is still in the future.
- Expired/cancelled holds are immutable payment targets.
- Payment after hold expiry creates an `ops_issue` and recovery/refund path. It must not silently confirm.

## Idempotency And Events

- Every mutating command has an idempotency key.
- Same command + same idempotency key + same request hash returns the previous result.
- Same command + same idempotency key + different request hash returns `IDEMPOTENCY_CONFLICT`.
- Stripe/provider webhook event IDs are uniquely stored and replay-safe.
- Every successful state transition increments the aggregate version and appends a domain event.
- Aggregate mutation RPCs must lock the target aggregate row before checking or changing state.
- Domain events are ordered per aggregate with unique `(aggregate_type, aggregate_id, aggregate_version)`.

## Diagnostics

- Every failure from a critical RPC returns a structured failure code.
- Critical anomalies create an unresolved `ops_issue`.
- Alert delivery must not block booking/payment RPC success.
- Notification failures create retry jobs and `notification_failed` events, but do not mutate booking confirmation state.
