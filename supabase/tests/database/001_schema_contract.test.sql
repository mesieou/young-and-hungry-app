begin;

select plan(36);

select ok(to_regclass('public.businesses') is not null, 'businesses table exists');
select ok(to_regclass('public.quotes') is not null, 'quotes table exists');
select ok(to_regclass('public.bookings') is not null, 'bookings table exists');
select ok(to_regclass('public.payments') is not null, 'payments table exists');
select ok(to_regclass('public.booking_bucket_locks') is not null, 'booking_bucket_locks table exists');
select ok(to_regclass('public.domain_events') is not null, 'domain_events table exists');
select ok(to_regclass('public.command_dedup') is not null, 'command_dedup table exists');
select ok(to_regclass('public.outbox_jobs') is not null, 'outbox_jobs table exists');
select ok(to_regclass('public.notifications') is not null, 'notifications table exists');
select ok(to_regclass('public.ops_issues') is not null, 'ops_issues table exists');
select ok(to_regclass('public.alert_deliveries') is not null, 'alert_deliveries table exists');

select ok(
  exists(select 1 from pg_proc where proname = 'create_quote' and pronamespace = 'public'::regnamespace),
  'create_quote RPC exists'
);
select ok(
  exists(select 1 from pg_proc where proname = 'accept_quote' and pronamespace = 'public'::regnamespace),
  'accept_quote RPC exists'
);
select ok(
  exists(select 1 from pg_proc where proname = 'begin_booking_checkout' and pronamespace = 'public'::regnamespace),
  'begin_booking_checkout RPC exists'
);
select ok(
  exists(select 1 from pg_proc where proname = 'confirm_paid_booking' and pronamespace = 'public'::regnamespace),
  'confirm_paid_booking RPC exists'
);
select ok(
  exists(select 1 from pg_proc where proname = 'expire_booking_hold' and pronamespace = 'public'::regnamespace),
  'expire_booking_hold RPC exists'
);
select ok(
  exists(select 1 from pg_proc where proname = 'cancel_booking' and pronamespace = 'public'::regnamespace),
  'cancel_booking RPC exists'
);
select ok(
  exists(select 1 from pg_proc where proname = 'reschedule_booking' and pronamespace = 'public'::regnamespace),
  'reschedule_booking RPC exists'
);
select ok(
  exists(select 1 from pg_proc where proname = 'normalize_booking_interval' and pronamespace = 'public'::regnamespace),
  'normalize_booking_interval RPC exists'
);

select ok(
  exists(select 1 from pg_constraint where conname = 'booking_bucket_locks_business_bucket_unique'),
  'booking bucket unique constraint exists'
);
select ok(
  exists(select 1 from pg_constraint where conname = 'domain_events_aggregate_version_unique'),
  'domain event aggregate version unique constraint exists'
);
select ok(
  exists(select 1 from pg_constraint where conname = 'command_dedup_pkey'),
  'command dedupe primary key exists'
);
select ok(
  exists(select 1 from pg_constraint where conname = 'payments_provider_event_unique'),
  'payment provider event unique constraint exists'
);

select is(
  (select status from businesses where id = '00000000-0000-4000-8000-000000000001')::text,
  'active',
  'default Y&H business is active'
);
select is(
  (select domain from businesses where id = '00000000-0000-4000-8000-000000000001'),
  'youngandh.co',
  'default Y&H business domain is seeded'
);

select is(
  (select count(*)::integer from normalize_booking_interval('2026-05-01 09:00:00+00'::timestamptz, 60)),
  4,
  'normalize_booking_interval returns one bucket per 15 minutes'
);
select is(
  (select min(bucket_start) from normalize_booking_interval('2026-05-01 09:00:00+00'::timestamptz, 60)),
  '2026-05-01 09:00:00+00'::timestamptz,
  'normalize_booking_interval starts on requested bucket'
);
select is(
  (select max(bucket_start) from normalize_booking_interval('2026-05-01 09:00:00+00'::timestamptz, 60)),
  '2026-05-01 09:45:00+00'::timestamptz,
  'normalize_booking_interval ends at last occupied bucket'
);

select throws_ok(
  $$select * from normalize_booking_interval('2026-05-01 09:05:00+00'::timestamptz, 60)$$,
  'P0001',
  'job_start_at must align to a 15-minute bucket',
  'normalize_booking_interval rejects unaligned starts'
);
select throws_ok(
  $$select * from normalize_booking_interval('2026-05-01 09:00:00+00'::timestamptz, 50)$$,
  'P0001',
  'job_block_minutes must be a positive 15-minute multiple',
  'normalize_booking_interval rejects unaligned durations'
);

select ok(
  (select relrowsecurity from pg_class where oid = 'quotes'::regclass),
  'quotes RLS is enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'bookings'::regclass),
  'bookings RLS is enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'payments'::regclass),
  'payments RLS is enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'booking_bucket_locks'::regclass),
  'booking_bucket_locks RLS is enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'domain_events'::regclass),
  'domain_events RLS is enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'ops_issues'::regclass),
  'ops_issues RLS is enabled'
);

select * from finish();

rollback;
