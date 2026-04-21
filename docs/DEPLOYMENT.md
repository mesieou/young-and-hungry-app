# Deployment

## Phase 1

- Host on Vercel.
- Production domain: `youngandh.co`.
- Preview deployments for pull requests.
- Production deploys from `main`.
- Use the dedicated Young and Hungry Supabase project, separate from Skedy.

## Supabase

- Project ref: `ukrcintphnfxvcxikvwb`
- Project URL: `https://ukrcintphnfxvcxikvwb.supabase.co`
- Postgres major version: `17`

Required deployment secrets:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `DATABASE_URL`

Never commit Supabase passwords or keys. Store them in `.env.local` locally and in the deployment platform secret store.

## Not On Skedy Server

Do not deploy Young and Hungry on the current Skedy app server.

Skedy's app server runs web, Redis, NATS, workers, cron, nginx, staging routing, and AI/voice-specific infrastructure. Sharing it would couple uptime, deploys, certs, secrets, and company boundaries.

## Background Jobs

MVP uses Vercel Cron to call protected API routes for:

- outbox processing
- hold expiry
- notification retries
- alert retries

Move workers to a dedicated Young and Hungry server only when job volume or long-running processing requires it.
