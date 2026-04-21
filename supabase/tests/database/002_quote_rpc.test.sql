begin;

select plan(14);

create temp table test_commands (
  name text primary key,
  command jsonb not null
);

create temp table test_results (
  name text primary key,
  result jsonb not null
);

insert into test_commands (name, command)
values (
  'create_quote',
  jsonb_build_object(
    'idempotencyKey', 'pgtap-create-quote-1',
    'correlationId', 'pgtap-create-quote-1',
    'actor', jsonb_build_object('type', 'customer'),
    'businessId', '00000000-0000-4000-8000-000000000001',
    'customerName', 'PGTAP Customer',
    'customerEmail', 'pgtap@example.com',
    'pickupAddress', 'South Yarra VIC',
    'dropoffAddress', 'Richmond VIC',
    'serviceType', 'apartment_move',
    'jobStartAt', '2026-05-01T09:00:00+00:00',
    'jobBlockMinutes', 60,
    'depositCents', 10000,
    'pricingVersion', 'pgtap-v1',
    'breakdown', jsonb_build_object('source', 'pgtap')
  )
);

insert into test_results (name, result)
select 'create_quote', create_quote(command)
from test_commands
where name = 'create_quote';

select ok(
  (select (result->>'ok')::boolean from test_results where name = 'create_quote'),
  'create_quote succeeds'
);

insert into test_results (name, result)
select 'create_quote_replay', create_quote(command)
from test_commands
where name = 'create_quote';

select is(
  (select result #>> '{data,quoteId}' from test_results where name = 'create_quote_replay'),
  (select result #>> '{data,quoteId}' from test_results where name = 'create_quote'),
  'create_quote replay returns same quote id'
);

insert into test_results (name, result)
select 'create_quote_conflict',
  create_quote(command || jsonb_build_object('customerName', 'Different Customer'))
from test_commands
where name = 'create_quote';

select is(
  (select result->>'code' from test_results where name = 'create_quote_conflict'),
  'IDEMPOTENCY_CONFLICT',
  'same idempotency key with different payload returns IDEMPOTENCY_CONFLICT'
);

insert into test_results (name, result)
select 'accept_quote',
  accept_quote(jsonb_build_object(
    'idempotencyKey', 'pgtap-accept-quote-1',
    'correlationId', 'pgtap-accept-quote-1',
    'actor', jsonb_build_object('type', 'customer'),
    'quoteId', (select result #>> '{data,quoteId}' from test_results where name = 'create_quote')
  ));

select ok(
  (select (result->>'ok')::boolean from test_results where name = 'accept_quote'),
  'accept_quote succeeds'
);

select is(
  (select status::text from quotes where id = (select (result #>> '{data,quoteId}')::uuid from test_results where name = 'create_quote')),
  'accepted',
  'accept_quote transitions quote to accepted'
);

select is(
  (select version from quotes where id = (select (result #>> '{data,quoteId}')::uuid from test_results where name = 'create_quote')),
  2,
  'accept_quote increments quote version'
);

select is(
  (select count(*)::integer from domain_events where aggregate_type = 'quote' and aggregate_id = (select (result #>> '{data,quoteId}')::uuid from test_results where name = 'create_quote')),
  2,
  'quote creation and acceptance append two events'
);

select is(
  (select string_agg(aggregate_version::text, ',' order by aggregate_version) from domain_events where aggregate_type = 'quote' and aggregate_id = (select (result #>> '{data,quoteId}')::uuid from test_results where name = 'create_quote')),
  '1,2',
  'quote events are ordered by aggregate version'
);

insert into test_results (name, result)
select 'checkout',
  begin_booking_checkout(jsonb_build_object(
    'idempotencyKey', 'pgtap-checkout-1',
    'correlationId', 'pgtap-checkout-1',
    'actor', jsonb_build_object('type', 'customer'),
    'quoteId', (select result #>> '{data,quoteId}' from test_results where name = 'create_quote'),
    'holdMinutes', 15
  ));

select ok(
  (select (result->>'ok')::boolean from test_results where name = 'checkout'),
  'begin_booking_checkout succeeds'
);

select is(
  (select result->>'code' from test_results where name = 'checkout'),
  'BOOKING_HOLD_CREATED',
  'begin_booking_checkout returns hold-created code'
);

select is(
  (select status::text from bookings where id = (select (result #>> '{data,bookingId}')::uuid from test_results where name = 'checkout')),
  'pending_deposit',
  'checkout creates pending_deposit booking'
);

select is(
  (select count(*)::integer from booking_bucket_locks where booking_id = (select (result #>> '{data,bookingId}')::uuid from test_results where name = 'checkout')),
  4,
  'checkout inserts bucket locks for frozen job duration'
);

select is(
  (select count(*)::integer from outbox_jobs where job_type = 'expire_booking_hold' and payload->>'bookingId' = (select result #>> '{data,bookingId}' from test_results where name = 'checkout')),
  1,
  'checkout enqueues hold expiry job'
);

select is(
  (select count(*)::integer from domain_events where aggregate_type = 'booking' and aggregate_id = (select (result #>> '{data,bookingId}')::uuid from test_results where name = 'checkout')),
  1,
  'checkout appends booking hold event'
);

select * from finish();

rollback;
