begin;

select plan(18);

create temp table test_results (
  name text primary key,
  result jsonb not null
);

insert into test_results (name, result)
values (
  'quote_a',
  create_quote(jsonb_build_object(
    'idempotencyKey', 'pgtap-conflict-quote-a',
    'correlationId', 'pgtap-conflict-quote-a',
    'actor', jsonb_build_object('type', 'customer'),
    'businessId', '00000000-0000-4000-8000-000000000001',
    'customerName', 'Conflict A',
    'customerEmail', 'a@example.com',
    'pickupAddress', 'South Yarra VIC',
    'dropoffAddress', 'Richmond VIC',
    'serviceType', 'apartment_move',
    'jobStartAt', '2026-06-01T09:00:00+00:00',
    'jobBlockMinutes', 60,
    'depositCents', 10000,
    'pricingVersion', 'pgtap-v1'
  ))
);

insert into test_results (name, result)
values (
  'quote_b',
  create_quote(jsonb_build_object(
    'idempotencyKey', 'pgtap-conflict-quote-b',
    'correlationId', 'pgtap-conflict-quote-b',
    'actor', jsonb_build_object('type', 'customer'),
    'businessId', '00000000-0000-4000-8000-000000000001',
    'customerName', 'Conflict B',
    'customerEmail', 'b@example.com',
    'pickupAddress', 'South Yarra VIC',
    'dropoffAddress', 'Richmond VIC',
    'serviceType', 'apartment_move',
    'jobStartAt', '2026-06-01T09:15:00+00:00',
    'jobBlockMinutes', 60,
    'depositCents', 10000,
    'pricingVersion', 'pgtap-v1'
  ))
);

insert into test_results (name, result)
values
  ('accept_a', accept_quote(jsonb_build_object(
    'idempotencyKey', 'pgtap-conflict-accept-a',
    'actor', jsonb_build_object('type', 'customer'),
    'quoteId', (select result #>> '{data,quoteId}' from test_results where name = 'quote_a')
  ))),
  ('accept_b', accept_quote(jsonb_build_object(
    'idempotencyKey', 'pgtap-conflict-accept-b',
    'actor', jsonb_build_object('type', 'customer'),
    'quoteId', (select result #>> '{data,quoteId}' from test_results where name = 'quote_b')
  )));

insert into test_results (name, result)
values (
  'checkout_a',
  begin_booking_checkout(jsonb_build_object(
    'idempotencyKey', 'pgtap-conflict-checkout-a',
    'actor', jsonb_build_object('type', 'customer'),
    'quoteId', (select result #>> '{data,quoteId}' from test_results where name = 'quote_a'),
    'holdMinutes', 15
  ))
);

insert into test_results (name, result)
values (
  'checkout_b',
  begin_booking_checkout(jsonb_build_object(
    'idempotencyKey', 'pgtap-conflict-checkout-b',
    'actor', jsonb_build_object('type', 'customer'),
    'quoteId', (select result #>> '{data,quoteId}' from test_results where name = 'quote_b'),
    'holdMinutes', 15
  ))
);

select ok(
  (select (result->>'ok')::boolean from test_results where name = 'checkout_a'),
  'first overlapping checkout succeeds'
);

select is(
  (select result->>'code' from test_results where name = 'checkout_b'),
  'BUCKET_CONFLICT',
  'overlapping checkout returns BUCKET_CONFLICT'
);

select is(
  (select count(*)::integer from bookings where quote_id in (
    (select (result #>> '{data,quoteId}')::uuid from test_results where name = 'quote_a'),
    (select (result #>> '{data,quoteId}')::uuid from test_results where name = 'quote_b')
  )),
  1,
  'failed conflicting checkout does not leave a booking row'
);

insert into test_results (name, result)
values (
  'confirm_a',
  confirm_paid_booking(jsonb_build_object(
    'idempotencyKey', 'pgtap-confirm-a',
    'correlationId', 'pgtap-confirm-a',
    'actor', jsonb_build_object('type', 'system'),
    'bookingId', (select result #>> '{data,bookingId}' from test_results where name = 'checkout_a'),
    'provider', 'stripe',
    'providerEventId', 'evt_pgtap_confirm_a',
    'providerPaymentIntentId', 'pi_pgtap_confirm_a',
    'amountCents', 10000
  ))
);

select ok(
  (select (result->>'ok')::boolean from test_results where name = 'confirm_a'),
  'confirm_paid_booking succeeds for active hold'
);

select is(
  (select status::text from bookings where id = (select (result #>> '{data,bookingId}')::uuid from test_results where name = 'checkout_a')),
  'confirmed',
  'payment confirmation transitions booking to confirmed'
);

select is(
  (select status::text from payments where provider_event_id = 'evt_pgtap_confirm_a'),
  'paid',
  'payment row is paid'
);

select is(
  (select count(*)::integer from outbox_jobs where job_type in ('send_booking_confirmation_email', 'send_booking_confirmation_sms') and payload->>'bookingId' = (select result #>> '{data,bookingId}' from test_results where name = 'checkout_a')),
  2,
  'payment confirmation enqueues customer notifications'
);

insert into test_results (name, result)
values (
  'provider_replay',
  confirm_paid_booking(jsonb_build_object(
    'idempotencyKey', 'pgtap-confirm-a-provider-replay',
    'correlationId', 'pgtap-confirm-a-provider-replay',
    'actor', jsonb_build_object('type', 'system'),
    'bookingId', (select result #>> '{data,bookingId}' from test_results where name = 'checkout_a'),
    'provider', 'stripe',
    'providerEventId', 'evt_pgtap_confirm_a',
    'providerPaymentIntentId', 'pi_pgtap_confirm_a',
    'amountCents', 10000
  ))
);

select is(
  (select result->>'code' from test_results where name = 'provider_replay'),
  'PAYMENT_ALREADY_PROCESSED',
  'provider webhook replay is safe'
);

select is(
  (select count(*)::integer from payments where provider_event_id = 'evt_pgtap_confirm_a'),
  1,
  'provider webhook replay does not duplicate payment rows'
);

insert into test_results (name, result)
values (
  'late_quote',
  create_quote(jsonb_build_object(
    'idempotencyKey', 'pgtap-late-quote',
    'correlationId', 'pgtap-late-quote',
    'actor', jsonb_build_object('type', 'customer'),
    'businessId', '00000000-0000-4000-8000-000000000001',
    'customerName', 'Late Payment',
    'customerEmail', 'late@example.com',
    'pickupAddress', 'Carlton VIC',
    'dropoffAddress', 'Fitzroy VIC',
    'serviceType', 'small_move',
    'jobStartAt', '2026-06-02T09:00:00+00:00',
    'jobBlockMinutes', 30,
    'depositCents', 10000,
    'pricingVersion', 'pgtap-v1'
  ))
);

insert into test_results (name, result)
values (
  'late_accept',
  accept_quote(jsonb_build_object(
    'idempotencyKey', 'pgtap-late-accept',
    'actor', jsonb_build_object('type', 'customer'),
    'quoteId', (select result #>> '{data,quoteId}' from test_results where name = 'late_quote')
  ))
);

insert into test_results (name, result)
values (
  'late_checkout',
  begin_booking_checkout(jsonb_build_object(
    'idempotencyKey', 'pgtap-late-checkout',
    'actor', jsonb_build_object('type', 'customer'),
    'quoteId', (select result #>> '{data,quoteId}' from test_results where name = 'late_quote'),
    'holdMinutes', -1
  ))
);

insert into test_results (name, result)
values (
  'late_confirm',
  confirm_paid_booking(jsonb_build_object(
    'idempotencyKey', 'pgtap-late-confirm',
    'correlationId', 'pgtap-late-confirm',
    'actor', jsonb_build_object('type', 'system'),
    'bookingId', (select result #>> '{data,bookingId}' from test_results where name = 'late_checkout'),
    'provider', 'stripe',
    'providerEventId', 'evt_pgtap_late',
    'providerPaymentIntentId', 'pi_pgtap_late',
    'amountCents', 10000
  ))
);

select is(
  (select result->>'code' from test_results where name = 'late_confirm'),
  'BOOKING_HOLD_EXPIRED',
  'late payment after hold expiry returns BOOKING_HOLD_EXPIRED'
);

select is(
  (select status::text from bookings where id = (select (result #>> '{data,bookingId}')::uuid from test_results where name = 'late_checkout')),
  'failed_recovery',
  'late payment moves booking to failed_recovery'
);

select is(
  (select count(*)::integer from booking_bucket_locks where booking_id = (select (result #>> '{data,bookingId}')::uuid from test_results where name = 'late_checkout')),
  0,
  'late payment recovery releases bucket locks'
);

select is(
  (select count(*)::integer from ops_issues where dedupe_key = 'late-payment:evt_pgtap_late'),
  1,
  'late payment creates an ops issue'
);

select is(
  (select count(*)::integer from outbox_jobs where job_type = 'refund_payment' and payload->>'bookingId' = (select result #>> '{data,bookingId}' from test_results where name = 'late_checkout')),
  1,
  'late payment queues refund handling'
);

select is(
  (select count(*)::integer from domain_events where aggregate_type = 'booking' and aggregate_id = (select (result #>> '{data,bookingId}')::uuid from test_results where name = 'checkout_a')),
  2,
  'successful booking has hold and confirmed events'
);

select is(
  (select string_agg(aggregate_version::text, ',' order by aggregate_version) from domain_events where aggregate_type = 'booking' and aggregate_id = (select (result #>> '{data,bookingId}')::uuid from test_results where name = 'checkout_a')),
  '1,2',
  'successful booking events have ordered aggregate versions'
);

select is(
  (select count(*)::integer from payments where provider_event_id in ('evt_pgtap_confirm_a', 'evt_pgtap_late')),
  2,
  'payment rows exist for successful and late payment paths'
);

select is(
  (select count(*)::integer from ops_issues where status = 'open'),
  1,
  'only late payment path leaves an open ops issue in this test'
);

select * from finish();

rollback;
