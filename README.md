# Young and Hungry

Young and Hungry is a removalist platform for `youngandh.co`.

The app is intentionally split between:

- a Next.js frontend and ops UI
- Supabase/Postgres RPCs as the source of truth for booking and payment transitions
- shared package boundaries that can later be extracted from Skedy patterns

## Local Setup

```bash
npm install
npm run dev
```

## Supabase

Young and Hungry uses its own Supabase project, separate from Skedy.

- Project ref: `ukrcintphnfxvcxikvwb`
- Project URL: `https://ukrcintphnfxvcxikvwb.supabase.co`

Read [docs/SUPABASE.md](./docs/SUPABASE.md) before changing migrations, env vars, or database deployment.

## Responsive UI

Young & Hungry uses a shared responsive UI system. Before adding or changing public-facing UI, read [docs/RESPONSIVE_SYSTEM.md](./docs/RESPONSIVE_SYSTEM.md).

Rules:

- Build mobile first
- Use shared layout primitives before custom wrappers
- Keep mobile nav, dialogs, and action rails reachable on small screens
- Add/update UI regression tests for critical responsive behavior

## Content And SEO

Young & Hungry now uses a registry-driven public content system inspired by the DRY SEO structure in Skedy.

- Public page registry: [lib/seo/public-pages.ts](./lib/seo/public-pages.ts)
- Shared site copy: [lib/content/site-copy.ts](./lib/content/site-copy.ts)
- Content/SEO rules: [docs/CONTENT_SEO_SYSTEM.md](./docs/CONTENT_SEO_SYSTEM.md)

Before adding or rewriting an indexable public page:

- assign a clear primary keyword
- define metadata in the public page registry
- emit structured data through the shared SEO components
- make sure the route lands in the sitemap
- avoid internal product or infrastructure jargon in customer-facing copy

## Git Remote

```bash
git remote -v
```

Expected origin:

```bash
git@github.com:mesieou/young-and-hungry-app.git
```

## Critical Rule

Booking, payment, hold, expiry, cancellation, and reschedule transitions must go through Postgres RPCs only. Do not write directly to the critical tables from UI/API code.

Read [SYSTEM_INVARIANTS.md](./SYSTEM_INVARIANTS.md) before implementing booking/payment features.
