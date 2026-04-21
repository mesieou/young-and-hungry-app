# Architecture

## Source Of Truth

Postgres RPCs are the source of truth for quote, booking, payment, hold, expiry, cancellation, and reschedule transitions.

Application code calls typed command wrappers in `lib/core/booking/rpc-client.ts`. It must not write critical tables directly.

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
