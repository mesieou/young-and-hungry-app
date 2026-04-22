# Architecture

## Source Of Truth

Postgres RPCs are the source of truth for quote, booking, payment, hold, expiry, cancellation, and reschedule transitions.

Application code calls typed command wrappers in `lib/core/booking/rpc-client.ts`. It must not write critical tables directly.

## MVP Quote Review

The first MVP does not need a quote-review dashboard or public deposit checkout.

Flow:

- Customer submits `/quote`.
- The server action calls `create_quote`.
- The app sends an ops quote-review email with the full job payload.
- Ops reviews the email and follows up manually with pricing, timing, and confirmation.

The email delivery attempt is also recorded in `notifications`. Failed email attempts create an `ops_issue`.

## Quote Checkout Bridge

Customer quote checkout lives at `/quote/[quoteId]`, but it is not the active MVP path.

The page can read quote and booking state for rendering, but it does not mutate critical tables. The checkout action calls:

- `accept_quote`
- `begin_booking_checkout`

The action uses separate idempotency keys for each RPC, derived from the same customer checkout attempt key. `begin_booking_checkout` is still the only place that creates booking holds and bucket locks.

## Boundaries

- `young-and-hungry-app` owns website, design system, SEO/content, ops UI, business-specific pricing/content config, and brand components.
- `database-core` will be extracted later for Supabase clients, BaseRepository, retries/backoff, logging, migration conventions, and typed RPC helpers.
- `booking-core` will be extracted later for command wrappers, state enums, RPC result types, and deterministic booking contracts.
- `events-core` will be extracted later for event type definitions, timeline formatting, and aggregate version helpers.
- `notifications-core` will be extracted later for email/SMS adapters and delivery persistence.
- `alerts-core` will be extracted later for ops issue and alert delivery helpers.
- `channel-contracts` will be extracted later for website, ops UI, and Skedy voice command contracts.

## Future Skedy Voice Integration

Skedy voice AI should act as a signed channel adapter into Young and Hungry commands. It must not write directly to Young and Hungry tables.

Required controls:

- HMAC request signing
- timestamp validation
- nonce replay protection
- secret rotation
- command-level idempotency keys

Conversational state stays in the voice layer. Transactional state lives only in Young and Hungry Postgres RPCs.
