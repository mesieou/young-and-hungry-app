# Supabase Schema

Last updated: 2026-04-22

This file is updated by `npm run db:schema`.

## Cloud Project

- Project ref: `ukrcintphnfxvcxikvwb`
- Project URL: `https://ukrcintphnfxvcxikvwb.supabase.co`
- Postgres major version: `17`

## Source Of Truth

- Migrations live in `supabase/migrations`.
- Raw schema dump lives in `schema_audit.sql`.
- Critical booking/payment logic lives in Postgres RPCs, not duplicated TypeScript transitions.

## Required Critical-Core Tables

- `quotes`
- `bookings`
- `payments`
- `booking_bucket_locks`
- `domain_events`
- `command_dedup`
- `outbox_jobs`
- `notifications`
- `ops_issues`
- `alert_deliveries`
