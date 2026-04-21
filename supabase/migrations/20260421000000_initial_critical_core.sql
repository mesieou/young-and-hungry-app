create extension if not exists pgcrypto;

create schema if not exists app_private;

create type quote_status as enum ('draft', 'estimated', 'sent', 'accepted', 'expired', 'cancelled');
create type booking_status as enum ('pending_deposit', 'confirmed', 'in_progress', 'completed', 'cancelled', 'expired_hold', 'failed_recovery');
create type payment_status as enum ('pending', 'authorized', 'paid', 'failed', 'refunded', 'disputed');
create type outbox_job_state as enum ('queued', 'processing', 'succeeded', 'failed', 'dead_letter');
create type ops_issue_status as enum ('open', 'acknowledged', 'resolved');
create type ops_issue_severity as enum ('info', 'warning', 'critical');

create table quotes (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null,
  customer_name text,
  customer_email text,
  customer_phone text,
  pickup_address text,
  dropoff_address text,
  service_type text not null default 'removal',
  status quote_status not null default 'draft',
  pricing_version text not null default 'v1',
  price_cents integer check (price_cents is null or price_cents >= 0),
  deposit_cents integer not null default 10000 check (deposit_cents >= 0),
  currency text not null default 'AUD',
  job_start_at timestamptz,
  job_block_minutes integer check (job_block_minutes is null or job_block_minutes > 0),
  expires_at timestamptz,
  breakdown jsonb not null default '{}'::jsonb,
  version integer not null default 0 check (version >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null unique references quotes(id),
  business_id uuid not null,
  customer_name text,
  customer_email text,
  customer_phone text,
  pickup_address text,
  dropoff_address text,
  status booking_status not null default 'pending_deposit',
  job_start_at timestamptz not null,
  job_end_at timestamptz not null,
  job_block_minutes integer not null check (job_block_minutes > 0),
  held_until timestamptz,
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  cancellation_reason text,
  version integer not null default 0 check (version >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_time_order check (job_end_at > job_start_at)
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id),
  provider text not null default 'stripe',
  provider_payment_intent_id text,
  provider_event_id text,
  status payment_status not null default 'pending',
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'AUD',
  raw_payload jsonb not null default '{}'::jsonb,
  version integer not null default 0 check (version >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_provider_event_unique unique (provider, provider_event_id),
  constraint payments_provider_intent_unique unique (provider, provider_payment_intent_id)
);

create table booking_bucket_locks (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null,
  booking_id uuid not null references bookings(id) on delete cascade,
  bucket_start timestamptz not null,
  created_at timestamptz not null default now(),
  constraint booking_bucket_locks_business_bucket_unique unique (business_id, bucket_start),
  constraint booking_bucket_locks_alignment check (
    date_part('minute', bucket_start)::integer % 15 = 0
    and date_part('second', bucket_start)::integer = 0
  )
);

create table domain_events (
  id uuid primary key default gen_random_uuid(),
  aggregate_type text not null,
  aggregate_id uuid not null,
  aggregate_version integer not null check (aggregate_version > 0),
  event_type text not null,
  idempotency_key text,
  causation_id uuid,
  correlation_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint domain_events_aggregate_version_unique unique (aggregate_type, aggregate_id, aggregate_version)
);

create table command_dedup (
  command_name text not null,
  idempotency_key text not null,
  request_hash text not null,
  result jsonb not null,
  created_at timestamptz not null default now(),
  primary key (command_name, idempotency_key)
);

create table outbox_jobs (
  id uuid primary key default gen_random_uuid(),
  job_type text not null,
  state outbox_job_state not null default 'queued',
  payload jsonb not null default '{}'::jsonb,
  run_after timestamptz not null default now(),
  attempts integer not null default 0 check (attempts >= 0),
  max_attempts integer not null default 3 check (max_attempts > 0),
  locked_at timestamptz,
  locked_by text,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  channel text not null check (channel in ('email', 'sms', 'slack')),
  recipient text not null,
  template text not null,
  state outbox_job_state not null default 'queued',
  payload jsonb not null default '{}'::jsonb,
  attempts integer not null default 0 check (attempts >= 0),
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table ops_issues (
  id uuid primary key default gen_random_uuid(),
  severity ops_issue_severity not null default 'warning',
  category text not null check (category in ('booking', 'payment', 'notification', 'system')),
  status ops_issue_status not null default 'open',
  title text not null,
  dedupe_key text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz,
  constraint ops_issues_dedupe_unique unique (dedupe_key)
);

create table alert_deliveries (
  id uuid primary key default gen_random_uuid(),
  ops_issue_id uuid not null references ops_issues(id) on delete cascade,
  channel text not null check (channel in ('email', 'slack')),
  state outbox_job_state not null default 'queued',
  attempts integer not null default 0 check (attempts >= 0),
  max_attempts integer not null default 3 check (max_attempts > 0),
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index quotes_business_status_idx on quotes (business_id, status);
create index bookings_business_status_idx on bookings (business_id, status);
create index bookings_quote_idx on bookings (quote_id);
create index booking_bucket_locks_booking_idx on booking_bucket_locks (booking_id);
create index domain_events_aggregate_idx on domain_events (aggregate_type, aggregate_id, aggregate_version);
create index outbox_jobs_claim_idx on outbox_jobs (state, run_after, created_at);
create index ops_issues_open_idx on ops_issues (status, severity, created_at);

alter table quotes enable row level security;
alter table bookings enable row level security;
alter table payments enable row level security;
alter table booking_bucket_locks enable row level security;
alter table domain_events enable row level security;
alter table command_dedup enable row level security;
alter table outbox_jobs enable row level security;
alter table notifications enable row level security;
alter table ops_issues enable row level security;
alter table alert_deliveries enable row level security;

create or replace function app_private.rpc_success(p_code text, p_data jsonb)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object('ok', true, 'code', p_code, 'data', coalesce(p_data, '{}'::jsonb));
$$;

create or replace function app_private.rpc_failure(p_code text, p_message text, p_diagnostics jsonb default '{}'::jsonb)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'ok', false,
    'code', p_code,
    'message', p_message,
    'diagnostics', coalesce(p_diagnostics, '{}'::jsonb)
  );
$$;

create or replace function app_private.command_request_hash(p_command jsonb)
returns text
language sql
immutable
strict
as $$
  select encode(extensions.digest(p_command::text, 'sha256'), 'hex');
$$;

create or replace function app_private.get_command_replay(
  p_command_name text,
  p_idempotency_key text,
  p_request_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = public, app_private
as $$
declare
  v_existing command_dedup%rowtype;
begin
  if p_idempotency_key is null or length(trim(p_idempotency_key)) = 0 then
    return app_private.rpc_failure(
      'INTERNAL_TRANSITION_FAILED',
      'Missing idempotency key.',
      jsonb_build_object('commandName', p_command_name)
    );
  end if;

  select *
  into v_existing
  from command_dedup
  where command_name = p_command_name
    and idempotency_key = p_idempotency_key
  for update;

  if found then
    if v_existing.request_hash <> p_request_hash then
      return app_private.rpc_failure(
        'IDEMPOTENCY_CONFLICT',
        'Idempotency key was reused with a different request payload.',
        jsonb_build_object('commandName', p_command_name, 'idempotencyKey', p_idempotency_key)
      );
    end if;

    return v_existing.result;
  end if;

  return null;
end;
$$;

create or replace function app_private.remember_command_result(
  p_command_name text,
  p_idempotency_key text,
  p_request_hash text,
  p_result jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, app_private
as $$
begin
  insert into command_dedup (command_name, idempotency_key, request_hash, result)
  values (p_command_name, p_idempotency_key, p_request_hash, p_result);

  return p_result;
end;
$$;

create or replace function app_private.append_domain_event(
  p_aggregate_type text,
  p_aggregate_id uuid,
  p_aggregate_version integer,
  p_event_type text,
  p_idempotency_key text,
  p_correlation_id text,
  p_payload jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public, app_private
as $$
declare
  v_event_id uuid;
begin
  insert into domain_events (
    aggregate_type,
    aggregate_id,
    aggregate_version,
    event_type,
    idempotency_key,
    correlation_id,
    payload
  )
  values (
    p_aggregate_type,
    p_aggregate_id,
    p_aggregate_version,
    p_event_type,
    p_idempotency_key,
    p_correlation_id,
    coalesce(p_payload, '{}'::jsonb)
  )
  returning id into v_event_id;

  return v_event_id;
end;
$$;

create or replace function app_private.create_ops_issue(
  p_severity ops_issue_severity,
  p_category text,
  p_title text,
  p_dedupe_key text,
  p_payload jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public, app_private
as $$
declare
  v_issue_id uuid;
begin
  insert into ops_issues (severity, category, title, dedupe_key, payload)
  values (p_severity, p_category, p_title, p_dedupe_key, coalesce(p_payload, '{}'::jsonb))
  on conflict (dedupe_key)
  do update set
    updated_at = now(),
    payload = ops_issues.payload || excluded.payload
  returning id into v_issue_id;

  insert into outbox_jobs (job_type, payload)
  values ('send_ops_alert', jsonb_build_object('opsIssueId', v_issue_id))
  on conflict do nothing;

  return v_issue_id;
end;
$$;

create or replace function normalize_booking_interval(
  p_job_start_at timestamptz,
  p_job_block_minutes integer
)
returns table(bucket_start timestamptz)
language plpgsql
stable
as $$
begin
  if p_job_start_at is null or p_job_block_minutes is null then
    raise exception 'job_start_at and job_block_minutes are required';
  end if;

  if p_job_block_minutes <= 0 or p_job_block_minutes % 15 <> 0 then
    raise exception 'job_block_minutes must be a positive 15-minute multiple';
  end if;

  if date_part('minute', p_job_start_at)::integer % 15 <> 0
    or date_part('second', p_job_start_at)::integer <> 0 then
    raise exception 'job_start_at must align to a 15-minute bucket';
  end if;

  return query
  select generate_series(
    p_job_start_at,
    p_job_start_at + make_interval(mins => p_job_block_minutes - 15),
    interval '15 minutes'
  ) as bucket_start;
end;
$$;

create or replace function create_quote(p_command jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, app_private
as $$
declare
  v_command_name constant text := 'create_quote';
  v_idempotency_key text := p_command->>'idempotencyKey';
  v_request_hash text := app_private.command_request_hash(p_command);
  v_replay jsonb;
  v_quote_id uuid;
  v_result jsonb;
begin
  v_replay := app_private.get_command_replay(v_command_name, v_idempotency_key, v_request_hash);
  if v_replay is not null then
    return v_replay;
  end if;

  insert into quotes (
    business_id,
    customer_name,
    customer_email,
    customer_phone,
    pickup_address,
    dropoff_address,
    service_type,
    status,
    pricing_version,
    price_cents,
    deposit_cents,
    job_start_at,
    job_block_minutes,
    expires_at,
    breakdown,
    version
  )
  values (
    (p_command->>'businessId')::uuid,
    p_command->>'customerName',
    p_command->>'customerEmail',
    p_command->>'customerPhone',
    p_command->>'pickupAddress',
    p_command->>'dropoffAddress',
    coalesce(p_command->>'serviceType', 'removal'),
    'estimated',
    coalesce(p_command->>'pricingVersion', 'v1'),
    nullif(p_command->>'priceCents', '')::integer,
    coalesce(nullif(p_command->>'depositCents', '')::integer, 10000),
    nullif(p_command->>'jobStartAt', '')::timestamptz,
    nullif(p_command->>'jobBlockMinutes', '')::integer,
    coalesce(nullif(p_command->>'expiresAt', '')::timestamptz, now() + interval '7 days'),
    coalesce(p_command->'breakdown', '{}'::jsonb),
    1
  )
  returning id into v_quote_id;

  perform app_private.append_domain_event(
    'quote',
    v_quote_id,
    1,
    'quote_created',
    v_idempotency_key,
    p_command->>'correlationId',
    jsonb_build_object('commandName', v_command_name)
  );

  v_result := app_private.rpc_success(
    'QUOTE_CREATED',
    jsonb_build_object('quoteId', v_quote_id, 'status', 'estimated')
  );

  return app_private.remember_command_result(v_command_name, v_idempotency_key, v_request_hash, v_result);
exception when others then
  v_result := app_private.rpc_failure(
    'INTERNAL_TRANSITION_FAILED',
    'Failed to create quote.',
    jsonb_build_object('commandName', v_command_name, 'sqlstate', sqlstate, 'message', sqlerrm)
  );
  return app_private.remember_command_result(v_command_name, v_idempotency_key, v_request_hash, v_result);
end;
$$;

create or replace function accept_quote(p_command jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, app_private
as $$
declare
  v_command_name constant text := 'accept_quote';
  v_idempotency_key text := p_command->>'idempotencyKey';
  v_request_hash text := app_private.command_request_hash(p_command);
  v_replay jsonb;
  v_quote quotes%rowtype;
  v_result jsonb;
begin
  v_replay := app_private.get_command_replay(v_command_name, v_idempotency_key, v_request_hash);
  if v_replay is not null then
    return v_replay;
  end if;

  select * into v_quote
  from quotes
  where id = (p_command->>'quoteId')::uuid
  for update;

  if not found then
    v_result := app_private.rpc_failure('QUOTE_NOT_FOUND', 'Quote was not found.', jsonb_build_object('commandName', v_command_name));
    return app_private.remember_command_result(v_command_name, v_idempotency_key, v_request_hash, v_result);
  end if;

  if v_quote.expires_at is not null and v_quote.expires_at <= now() then
    v_result := app_private.rpc_failure('QUOTE_EXPIRED', 'Quote has expired.', jsonb_build_object('quoteId', v_quote.id));
    return app_private.remember_command_result(v_command_name, v_idempotency_key, v_request_hash, v_result);
  end if;

  if v_quote.status <> 'accepted' then
    update quotes
    set status = 'accepted',
        version = version + 1,
        updated_at = now()
    where id = v_quote.id
    returning * into v_quote;

    perform app_private.append_domain_event(
      'quote',
      v_quote.id,
      v_quote.version,
      'quote_accepted',
      v_idempotency_key,
      p_command->>'correlationId',
      jsonb_build_object('commandName', v_command_name)
    );
  end if;

  v_result := app_private.rpc_success(
    'QUOTE_ACCEPTED',
    jsonb_build_object('quoteId', v_quote.id, 'status', v_quote.status)
  );

  return app_private.remember_command_result(v_command_name, v_idempotency_key, v_request_hash, v_result);
end;
$$;

create or replace function begin_booking_checkout(p_command jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, app_private
as $$
declare
  v_command_name constant text := 'begin_booking_checkout';
  v_idempotency_key text := p_command->>'idempotencyKey';
  v_request_hash text := app_private.command_request_hash(p_command);
  v_replay jsonb;
  v_quote quotes%rowtype;
  v_booking bookings%rowtype;
  v_existing_booking_id uuid;
  v_hold_minutes integer := coalesce(nullif(p_command->>'holdMinutes', '')::integer, 15);
  v_result jsonb;
begin
  v_replay := app_private.get_command_replay(v_command_name, v_idempotency_key, v_request_hash);
  if v_replay is not null then
    return v_replay;
  end if;

  select * into v_quote
  from quotes
  where id = (p_command->>'quoteId')::uuid
  for update;

  if not found then
    v_result := app_private.rpc_failure('QUOTE_NOT_FOUND', 'Quote was not found.', jsonb_build_object('commandName', v_command_name));
    return app_private.remember_command_result(v_command_name, v_idempotency_key, v_request_hash, v_result);
  end if;

  if v_quote.status <> 'accepted' then
    v_result := app_private.rpc_failure('QUOTE_NOT_ACCEPTED', 'Quote must be accepted before checkout.', jsonb_build_object('quoteId', v_quote.id, 'status', v_quote.status));
    return app_private.remember_command_result(v_command_name, v_idempotency_key, v_request_hash, v_result);
  end if;

  if v_quote.expires_at is not null and v_quote.expires_at <= now() then
    v_result := app_private.rpc_failure('QUOTE_EXPIRED', 'Quote has expired.', jsonb_build_object('quoteId', v_quote.id));
    return app_private.remember_command_result(v_command_name, v_idempotency_key, v_request_hash, v_result);
  end if;

  if v_quote.job_start_at is null or v_quote.job_block_minutes is null then
    v_result := app_private.rpc_failure('INTERNAL_TRANSITION_FAILED', 'Quote is missing scheduling fields.', jsonb_build_object('quoteId', v_quote.id));
    return app_private.remember_command_result(v_command_name, v_idempotency_key, v_request_hash, v_result);
  end if;

  select id into v_existing_booking_id
  from bookings
  where quote_id = v_quote.id
    and status in ('pending_deposit', 'confirmed', 'in_progress')
  limit 1;

  if found then
    v_result := app_private.rpc_failure(
      'BOOKING_ALREADY_EXISTS_FOR_QUOTE',
      'An active booking already exists for this quote.',
      jsonb_build_object('quoteId', v_quote.id, 'bookingId', v_existing_booking_id)
    );
    return app_private.remember_command_result(v_command_name, v_idempotency_key, v_request_hash, v_result);
  end if;

  begin
    insert into bookings (
      quote_id,
      business_id,
      customer_name,
      customer_email,
      customer_phone,
      pickup_address,
      dropoff_address,
      status,
      job_start_at,
      job_end_at,
      job_block_minutes,
      held_until,
      version
    )
    values (
      v_quote.id,
      v_quote.business_id,
      v_quote.customer_name,
      v_quote.customer_email,
      v_quote.customer_phone,
      v_quote.pickup_address,
      v_quote.dropoff_address,
      'pending_deposit',
      v_quote.job_start_at,
      v_quote.job_start_at + make_interval(mins => v_quote.job_block_minutes),
      v_quote.job_block_minutes,
      now() + make_interval(mins => v_hold_minutes),
      1
    )
    returning * into v_booking;

    insert into booking_bucket_locks (business_id, booking_id, bucket_start)
    select v_booking.business_id, v_booking.id, bucket_start
    from normalize_booking_interval(v_booking.job_start_at, v_booking.job_block_minutes);
  exception
    when unique_violation then
      v_result := app_private.rpc_failure(
        'BUCKET_CONFLICT',
        'Requested time is no longer available.',
        jsonb_build_object('quoteId', v_quote.id, 'businessId', v_quote.business_id)
      );
      return app_private.remember_command_result(v_command_name, v_idempotency_key, v_request_hash, v_result);
    when others then
      v_result := app_private.rpc_failure(
        'INTERNAL_TRANSITION_FAILED',
        'Failed to reserve booking buckets.',
        jsonb_build_object('quoteId', v_quote.id, 'sqlstate', sqlstate, 'message', sqlerrm)
      );
      return app_private.remember_command_result(v_command_name, v_idempotency_key, v_request_hash, v_result);
  end;

  perform app_private.append_domain_event(
    'booking',
    v_booking.id,
    v_booking.version,
    'booking_hold_created',
    v_idempotency_key,
    p_command->>'correlationId',
    jsonb_build_object('quoteId', v_quote.id, 'heldUntil', v_booking.held_until)
  );

  insert into outbox_jobs (job_type, run_after, payload)
  values (
    'expire_booking_hold',
    v_booking.held_until,
    jsonb_build_object(
      'bookingId', v_booking.id,
      'idempotencyKey', concat('expire:', v_booking.id::text, ':', extract(epoch from v_booking.held_until)::text)
    )
  );

  v_result := app_private.rpc_success(
    'BOOKING_HOLD_CREATED',
    jsonb_build_object(
      'bookingId', v_booking.id,
      'quoteId', v_quote.id,
      'status', v_booking.status,
      'heldUntil', v_booking.held_until,
      'paymentIntentInput', jsonb_build_object(
        'amountCents', v_quote.deposit_cents,
        'currency', 'AUD',
        'depositCents', v_quote.deposit_cents
      )
    )
  );

  return app_private.remember_command_result(v_command_name, v_idempotency_key, v_request_hash, v_result);
end;
$$;

create or replace function confirm_paid_booking(p_command jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, app_private
as $$
declare
  v_command_name constant text := 'confirm_paid_booking';
  v_idempotency_key text := p_command->>'idempotencyKey';
  v_request_hash text := app_private.command_request_hash(p_command);
  v_replay jsonb;
  v_booking bookings%rowtype;
  v_payment payments%rowtype;
  v_existing_payment payments%rowtype;
  v_new_booking_version integer;
  v_result jsonb;
begin
  v_replay := app_private.get_command_replay(v_command_name, v_idempotency_key, v_request_hash);
  if v_replay is not null then
    return v_replay;
  end if;

  select * into v_existing_payment
  from payments
  where provider = coalesce(p_command->>'provider', 'stripe')
    and provider_event_id = p_command->>'providerEventId'
  limit 1;

  if found then
    select * into v_booking from bookings where id = v_existing_payment.booking_id;
    v_result := app_private.rpc_success(
      'PAYMENT_ALREADY_PROCESSED',
      jsonb_build_object('bookingId', v_booking.id, 'bookingStatus', v_booking.status, 'paymentStatus', v_existing_payment.status)
    );
    return app_private.remember_command_result(v_command_name, v_idempotency_key, v_request_hash, v_result);
  end if;

  select * into v_booking
  from bookings
  where id = (p_command->>'bookingId')::uuid
  for update;

  if not found then
    v_result := app_private.rpc_failure('PAYMENT_TARGET_INVALID', 'Booking target was not found.', jsonb_build_object('commandName', v_command_name));
    return app_private.remember_command_result(v_command_name, v_idempotency_key, v_request_hash, v_result);
  end if;

  if v_booking.status <> 'pending_deposit' then
    perform app_private.create_ops_issue(
      'critical',
      'payment',
      'Payment webhook targeted invalid booking state',
      concat('payment-target-invalid:', p_command->>'providerEventId'),
      jsonb_build_object('bookingId', v_booking.id, 'status', v_booking.status, 'idempotencyKey', v_idempotency_key)
    );

    v_result := app_private.rpc_failure(
      'PAYMENT_TARGET_INVALID',
      'Payment cannot confirm this booking state.',
      jsonb_build_object('bookingId', v_booking.id, 'status', v_booking.status)
    );
    return app_private.remember_command_result(v_command_name, v_idempotency_key, v_request_hash, v_result);
  end if;

  if v_booking.held_until is null or v_booking.held_until <= now() then
    insert into payments (
      booking_id,
      provider,
      provider_payment_intent_id,
      provider_event_id,
      status,
      amount_cents,
      raw_payload,
      version
    )
    values (
      v_booking.id,
      coalesce(p_command->>'provider', 'stripe'),
      p_command->>'providerPaymentIntentId',
      p_command->>'providerEventId',
      'paid',
      (p_command->>'amountCents')::integer,
      p_command,
      1
    )
    returning * into v_payment;

    update bookings
    set status = 'failed_recovery',
        version = version + 1,
        updated_at = now()
    where id = v_booking.id
    returning version into v_new_booking_version;

    delete from booking_bucket_locks where booking_id = v_booking.id;

    perform app_private.append_domain_event('payment', v_payment.id, 1, 'payment_paid_after_hold_expired', v_idempotency_key, p_command->>'correlationId', p_command);
    perform app_private.append_domain_event('booking', v_booking.id, v_new_booking_version, 'booking_payment_recovery_required', v_idempotency_key, p_command->>'correlationId', p_command);

    perform app_private.create_ops_issue(
      'critical',
      'payment',
      'Payment received after booking hold expired',
      concat('late-payment:', p_command->>'providerEventId'),
      jsonb_build_object('bookingId', v_booking.id, 'paymentId', v_payment.id, 'idempotencyKey', v_idempotency_key)
    );

    insert into outbox_jobs (job_type, payload)
    values ('refund_payment', jsonb_build_object('paymentId', v_payment.id, 'bookingId', v_booking.id));

    v_result := app_private.rpc_failure(
      'BOOKING_HOLD_EXPIRED',
      'Booking hold expired before payment confirmation.',
      jsonb_build_object('bookingId', v_booking.id, 'paymentId', v_payment.id)
    );
    return app_private.remember_command_result(v_command_name, v_idempotency_key, v_request_hash, v_result);
  end if;

  insert into payments (
    booking_id,
    provider,
    provider_payment_intent_id,
    provider_event_id,
    status,
    amount_cents,
    raw_payload,
    version
  )
  values (
    v_booking.id,
    coalesce(p_command->>'provider', 'stripe'),
    p_command->>'providerPaymentIntentId',
    p_command->>'providerEventId',
    'paid',
    (p_command->>'amountCents')::integer,
    p_command,
    1
  )
  returning * into v_payment;

  update bookings
  set status = 'confirmed',
      confirmed_at = now(),
      version = version + 1,
      updated_at = now()
  where id = v_booking.id
  returning * into v_booking;

  perform app_private.append_domain_event('payment', v_payment.id, 1, 'payment_paid', v_idempotency_key, p_command->>'correlationId', p_command);
  perform app_private.append_domain_event('booking', v_booking.id, v_booking.version, 'booking_confirmed', v_idempotency_key, p_command->>'correlationId', jsonb_build_object('paymentId', v_payment.id));

  insert into outbox_jobs (job_type, payload)
  values
    ('send_booking_confirmation_email', jsonb_build_object('bookingId', v_booking.id)),
    ('send_booking_confirmation_sms', jsonb_build_object('bookingId', v_booking.id));

  v_result := app_private.rpc_success(
    'BOOKING_CONFIRMED',
    jsonb_build_object('bookingId', v_booking.id, 'bookingStatus', v_booking.status, 'paymentStatus', v_payment.status)
  );

  return app_private.remember_command_result(v_command_name, v_idempotency_key, v_request_hash, v_result);
exception
  when unique_violation then
    v_result := app_private.rpc_failure(
      'PAYMENT_ALREADY_PROCESSED',
      'Provider payment event was already processed.',
      jsonb_build_object('providerEventId', p_command->>'providerEventId')
    );
    return app_private.remember_command_result(v_command_name, v_idempotency_key, v_request_hash, v_result);
end;
$$;

create or replace function expire_booking_hold(p_command jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, app_private
as $$
declare
  v_command_name constant text := 'expire_booking_hold';
  v_idempotency_key text := p_command->>'idempotencyKey';
  v_request_hash text := app_private.command_request_hash(p_command);
  v_replay jsonb;
  v_booking bookings%rowtype;
  v_result jsonb;
begin
  v_replay := app_private.get_command_replay(v_command_name, v_idempotency_key, v_request_hash);
  if v_replay is not null then
    return v_replay;
  end if;

  select * into v_booking
  from bookings
  where id = (p_command->>'bookingId')::uuid
  for update;

  if not found then
    v_result := app_private.rpc_failure('PAYMENT_TARGET_INVALID', 'Booking target was not found.', jsonb_build_object('commandName', v_command_name));
    return app_private.remember_command_result(v_command_name, v_idempotency_key, v_request_hash, v_result);
  end if;

  if v_booking.status <> 'pending_deposit' then
    v_result := app_private.rpc_success('BOOKING_HOLD_EXPIRY_NOOP', jsonb_build_object('bookingId', v_booking.id, 'status', v_booking.status));
    return app_private.remember_command_result(v_command_name, v_idempotency_key, v_request_hash, v_result);
  end if;

  if v_booking.held_until is not null and v_booking.held_until > now() then
    v_result := app_private.rpc_success('BOOKING_HOLD_STILL_ACTIVE', jsonb_build_object('bookingId', v_booking.id, 'status', v_booking.status));
    return app_private.remember_command_result(v_command_name, v_idempotency_key, v_request_hash, v_result);
  end if;

  update bookings
  set status = 'expired_hold',
      version = version + 1,
      updated_at = now()
  where id = v_booking.id
  returning * into v_booking;

  delete from booking_bucket_locks where booking_id = v_booking.id;

  perform app_private.append_domain_event('booking', v_booking.id, v_booking.version, 'booking_hold_expired', v_idempotency_key, p_command->>'correlationId', p_command);

  v_result := app_private.rpc_success('BOOKING_HOLD_EXPIRED', jsonb_build_object('bookingId', v_booking.id, 'status', v_booking.status));
  return app_private.remember_command_result(v_command_name, v_idempotency_key, v_request_hash, v_result);
end;
$$;

create or replace function cancel_booking(p_command jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, app_private
as $$
declare
  v_command_name constant text := 'cancel_booking';
  v_idempotency_key text := p_command->>'idempotencyKey';
  v_request_hash text := app_private.command_request_hash(p_command);
  v_replay jsonb;
  v_booking bookings%rowtype;
  v_result jsonb;
begin
  v_replay := app_private.get_command_replay(v_command_name, v_idempotency_key, v_request_hash);
  if v_replay is not null then
    return v_replay;
  end if;

  select * into v_booking
  from bookings
  where id = (p_command->>'bookingId')::uuid
  for update;

  if not found then
    v_result := app_private.rpc_failure('PAYMENT_TARGET_INVALID', 'Booking target was not found.', jsonb_build_object('commandName', v_command_name));
    return app_private.remember_command_result(v_command_name, v_idempotency_key, v_request_hash, v_result);
  end if;

  if v_booking.status <> 'cancelled' then
    update bookings
    set status = 'cancelled',
        cancelled_at = now(),
        cancellation_reason = p_command->>'reason',
        version = version + 1,
        updated_at = now()
    where id = v_booking.id
    returning * into v_booking;

    delete from booking_bucket_locks where booking_id = v_booking.id;

    perform app_private.append_domain_event('booking', v_booking.id, v_booking.version, 'booking_cancelled', v_idempotency_key, p_command->>'correlationId', p_command);
  end if;

  v_result := app_private.rpc_success('BOOKING_CANCELLED', jsonb_build_object('bookingId', v_booking.id, 'status', v_booking.status));
  return app_private.remember_command_result(v_command_name, v_idempotency_key, v_request_hash, v_result);
end;
$$;

create or replace function reschedule_booking(p_command jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, app_private
as $$
declare
  v_command_name constant text := 'reschedule_booking';
  v_idempotency_key text := p_command->>'idempotencyKey';
  v_request_hash text := app_private.command_request_hash(p_command);
  v_replay jsonb;
  v_booking bookings%rowtype;
  v_result jsonb;
  v_job_start_at timestamptz := (p_command->>'jobStartAt')::timestamptz;
  v_job_block_minutes integer := (p_command->>'jobBlockMinutes')::integer;
begin
  v_replay := app_private.get_command_replay(v_command_name, v_idempotency_key, v_request_hash);
  if v_replay is not null then
    return v_replay;
  end if;

  select * into v_booking
  from bookings
  where id = (p_command->>'bookingId')::uuid
  for update;

  if not found then
    v_result := app_private.rpc_failure('PAYMENT_TARGET_INVALID', 'Booking target was not found.', jsonb_build_object('commandName', v_command_name));
    return app_private.remember_command_result(v_command_name, v_idempotency_key, v_request_hash, v_result);
  end if;

  if v_booking.status not in ('pending_deposit', 'confirmed') then
    v_result := app_private.rpc_failure('PAYMENT_TARGET_INVALID', 'Booking cannot be rescheduled in its current state.', jsonb_build_object('bookingId', v_booking.id, 'status', v_booking.status));
    return app_private.remember_command_result(v_command_name, v_idempotency_key, v_request_hash, v_result);
  end if;

  begin
    delete from booking_bucket_locks where booking_id = v_booking.id;

    update bookings
    set job_start_at = v_job_start_at,
        job_end_at = v_job_start_at + make_interval(mins => v_job_block_minutes),
        job_block_minutes = v_job_block_minutes,
        version = version + 1,
        updated_at = now()
    where id = v_booking.id
    returning * into v_booking;

    insert into booking_bucket_locks (business_id, booking_id, bucket_start)
    select v_booking.business_id, v_booking.id, bucket_start
    from normalize_booking_interval(v_booking.job_start_at, v_booking.job_block_minutes);
  exception
    when unique_violation then
      v_result := app_private.rpc_failure(
        'BUCKET_CONFLICT',
        'Requested reschedule time is not available.',
        jsonb_build_object('bookingId', v_booking.id)
      );
      return app_private.remember_command_result(v_command_name, v_idempotency_key, v_request_hash, v_result);
    when others then
      v_result := app_private.rpc_failure(
        'INTERNAL_TRANSITION_FAILED',
        'Failed to reschedule booking.',
        jsonb_build_object('bookingId', v_booking.id, 'sqlstate', sqlstate, 'message', sqlerrm)
      );
      return app_private.remember_command_result(v_command_name, v_idempotency_key, v_request_hash, v_result);
  end;

  perform app_private.append_domain_event('booking', v_booking.id, v_booking.version, 'booking_rescheduled', v_idempotency_key, p_command->>'correlationId', p_command);

  v_result := app_private.rpc_success('BOOKING_RESCHEDULED', jsonb_build_object('bookingId', v_booking.id, 'status', v_booking.status));
  return app_private.remember_command_result(v_command_name, v_idempotency_key, v_request_hash, v_result);
end;
$$;

grant usage on schema app_private to anon, authenticated, service_role;

grant execute on function normalize_booking_interval(timestamptz, integer) to anon, authenticated, service_role;
grant execute on function create_quote(jsonb) to anon, authenticated, service_role;
grant execute on function accept_quote(jsonb) to anon, authenticated, service_role;
grant execute on function begin_booking_checkout(jsonb) to anon, authenticated, service_role;
grant execute on function confirm_paid_booking(jsonb) to anon, authenticated, service_role;
grant execute on function expire_booking_hold(jsonb) to anon, authenticated, service_role;
grant execute on function cancel_booking(jsonb) to anon, authenticated, service_role;
grant execute on function reschedule_booking(jsonb) to anon, authenticated, service_role;
