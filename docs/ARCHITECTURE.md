# Architecture

## Source Of Truth

Postgres RPCs are the source of truth for quote, booking, payment, hold, expiry, cancellation, and reschedule transitions.

Application code calls typed command wrappers in `lib/core/booking/rpc-client.ts`. It must not write critical tables directly.

## MVP Quote Review

The first MVP does not need a quote-review dashboard or public deposit checkout.

Flow:

- Customer enters pickup and dropoff on the homepage hero.
- The homepage submits those route fields to `/quote` as `pickupAddress` and `dropoffAddress`.
- `/quote` preserves the route and continues the five-step quote flow at job type and truck selection.
- A prominent reviewed-estimate range appears after route, job type, and truck selection, matching Lugg's low-friction pattern while staying explicit about Y&H billing rules.
- The server recalculates the same estimate before calling `create_quote`; client-provided pricing is not trusted.
- The server action calls `create_quote`.
- The app sends an ops quote-review email with the full job payload.
- Ops reviews the email and follows up manually with pricing, timing, and confirmation.

The email delivery attempt is also recorded in `notifications`. Failed email attempts create an `ops_issue`.

Field conventions follow the Skedy dashboard patterns where possible:

- Address fields use Google Places autocomplete restricted to Australia when `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is configured.
- Address fields fall back to manual text entry if the Google Maps key or script is unavailable.
- Phone input shows the Australian country code and the server normalizes valid Australian numbers to E.164, for example `0412 345 678` becomes `+61412345678`.
- Client validation only improves UX; `quoteRequestSchema` remains the server-side source of truth for submitted quote data.

Pricing conventions:

- Pricebook: `yh-pricebook-2026-04-28-v3`.
- Customer quotes recommend 4 tonne for item deliveries, small moves, studios, and 1 bedroom moves; 6 tonne for 2 and 3 bedroom apartment or house moves.
- 4+ bedroom apartment and house instant quotes are not available yet and are shown as coming soon in the UI.
- The visible estimate follows the Lugg-style shape: truck/labor time, route distance, route duration, service adjustment, booking/admin fee, and weekday/weekend rate.
- Current formula: `labor/truck cost + charged route km + booking/admin fee`.
- Labor/truck cost uses frozen pricebook hourly rates, minimum billable minutes, load/unload baseline, service-type adjustment, and chargeable travel time.
- Billable time rounds up to half-hour blocks.
- The first 60 minutes of travel from base to pickup is free. Only base-to-pickup time over 60 minutes is chargeable.
- Charged travel includes pickup to dropoff and dropoff back to base. Any chargeable base-to-pickup excess is included when the pickup is more than 60 minutes from base.
- Route charge uses Google Directions kilometers when available.
- `/api/quote/route-estimate` calls Google Directions server-side once for base-to-pickup, pickup-to-dropoff, and dropoff-to-base legs and returns distance/duration for the live quote UI.
- `submitQuoteRequest` recalculates Google distance and quote price server-side before calling `create_quote`; client-side route/pricing data is never trusted.
- The stored quote receives `price_cents`, `job_block_minutes`, `pricing_version`, and the full `routeDistance` and `quoteEstimate` breakdown.
- If route distance is unavailable, the quote remains deterministic but marks route pricing as pending so ops can review it instead of silently guessing.

## Public Content And SEO

Public content now follows a Skedy-style DRY structure:

- `lib/seo/public-pages.ts` is the source of truth for indexable page metadata, canonical paths, schema type, keyword ownership, related links, and sitemap membership.
- `lib/content/site-copy.ts` holds shared microcopy for the homepage, estimate flow, trust messaging, and reusable UI text.
- `components/seo/PublicStructuredData.tsx` renders structured data from the page registry.
- `components/seo/PublicRoutePage.tsx` provides a reusable page shell for registry-backed public routes.

The public site should not hand-write metadata or customer messaging route by route unless there is a strong reason. Add or update page content in the registry first, then wire the route to that entry.

## Quote Checkout Bridge

Customer quote checkout lives at `/quote/[quoteId]`, but it is not the active MVP path.

The page can read quote and booking state for rendering, but it does not mutate critical tables. The checkout action calls:

- `accept_quote`
- `begin_booking_checkout`

The action uses separate idempotency keys for each RPC, derived from the same customer checkout attempt key. `begin_booking_checkout` is still the only place that creates booking holds and bucket locks.

## Boundaries

- `young-and-hungry-app` owns website, design system, SEO/content, ops UI, business-specific pricing/content config, and brand components.
- Shared responsive UI primitives live in-app for now:
  - `SiteContainer`
  - `PageSection`
  - `StepShell`
  - `ResponsiveDrawer`
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
