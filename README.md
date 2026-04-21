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
