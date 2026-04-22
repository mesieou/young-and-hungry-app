# Deployment

## Phase 1

- Host on Vercel.
- Production domain: `youngandh.co`.
- Preview deployments for pull requests.
- Production deploys from `main`.
- Use the dedicated Young and Hungry Supabase project, separate from Skedy.

## Vercel

- Team: `skedys-projects`
- Project: `young-and-hungry-app`
- Project ID: `prj_QEfKzf9RgHlLoEepBEF1S5lBoeSZ`
- Production URL: `https://young-and-hungry-app.vercel.app`
- GitHub repo: `mesieou/young-and-hungry-app`
- Git connection: connected through Vercel, so pushes to `main` deploy to production.
- Local project link lives in `.vercel/` and must remain uncommitted.

Custom domain status:

- `youngandh.co` is added to the Vercel project.
- `www.youngandh.co` is added to the Vercel project.
- DNS resolves to Vercel and HTTPS is serving the app.

Required DNS records from Vercel:

- `A youngandh.co 76.76.21.21`
- `A www.youngandh.co 76.76.21.21`

## Supabase

- Project ref: `ukrcintphnfxvcxikvwb`
- Project URL: `https://ukrcintphnfxvcxikvwb.supabase.co`
- Postgres major version: `17`

Required deployment secrets:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `DATABASE_URL`
- `OPS_QUOTE_EMAIL`
- `EMAIL_FROM`
- `RESEND_API_KEY`

Never commit Supabase passwords or keys. Store them in `.env.local` locally and in the deployment platform secret store.

`OPS_QUOTE_EMAIL`, `EMAIL_FROM`, and `RESEND_API_KEY` are required before relying on live quote requests, because the MVP review workflow is email-only.

## Not On Skedy Server

Do not deploy Young and Hungry on the current Skedy app server.

Skedy's app server runs web, Redis, NATS, workers, cron, nginx, staging routing, and AI/voice-specific infrastructure. Sharing it would couple uptime, deploys, certs, secrets, and company boundaries.

## Background Jobs

MVP uses Vercel Cron to call protected API routes for:

- outbox processing
- hold expiry
- notification retries
- alert retries

Current Hobby-compatible cron schedule is daily in `vercel.json`. Increase frequency only after moving to Vercel Pro or a dedicated worker.

Move workers to a dedicated Young and Hungry server only when job volume or long-running processing requires it.
