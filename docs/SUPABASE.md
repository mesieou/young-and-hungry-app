# Supabase

## Cloud Project

- Project name: `young-and-hungry-app`
- Project ref: `ukrcintphnfxvcxikvwb`
- Project URL: `https://ukrcintphnfxvcxikvwb.supabase.co`
- Postgres major version: `17`
- Database owner: Young and Hungry, separate from Skedy

Do not reuse the Skedy database or Skedy secrets for this app.

## Secrets

Secrets are not committed to git.

Required local/deployment environment variables:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `DATABASE_URL`
- `SUPABASE_DB_PASSWORD`

Use `.env.local` for local development and the hosting provider secret store for preview/production.

`SUPABASE_DB_PASSWORD` is required by the Supabase CLI for `supabase db push --dry-run` and `supabase db push`.

## Local Supabase

The local Supabase project is configured in `supabase/config.toml`.

- API: `http://127.0.0.1:55421`
- DB: `postgresql://postgres:postgres@127.0.0.1:55422/postgres`
- Studio: `http://127.0.0.1:55423`

Commands:

```bash
npm run db:start
npm run db:reset
npm run test:db
```

The cloud direct database host currently resolves as IPv6-only from this machine. If `npm run test:db` cannot resolve `db.ukrcintphnfxvcxikvwb.supabase.co`, run pgTAP against the local stack after `npm run db:reset`:

```bash
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:55422/postgres npm run test:db
```

## Remote Migration Workflow

This repo is linked to `ukrcintphnfxvcxikvwb`.

Required workflow:

```bash
supabase db push --dry-run
supabase db push
npm run db:schema
```

After every critical database change, commit together:

- SQL migration
- `schema_audit.sql`
- `supabase/SCHEMA.md`
- database tests under `supabase/tests/database`
- relevant TypeScript RPC wrapper tests

## Current Remote Migration State

Applied to the cloud project:

- `20260421000000_initial_critical_core.sql`
- `20260421001000_add_business_identity.sql`
- `20260422000000_quote_not_bookable_failure.sql`

The remote database now contains the MVP critical-core schema:

- quotes
- bookings
- payments
- booking bucket locks
- command dedupe
- domain events
- outbox jobs
- notifications
- ops issues
- alert deliveries
