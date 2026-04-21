# Deployment

## Phase 1

- Host on Vercel.
- Production domain: `youngandh.co`.
- Preview deployments for pull requests.
- Production deploys from `main`.
- Use a separate Supabase project and separate secrets from Skedy.

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
