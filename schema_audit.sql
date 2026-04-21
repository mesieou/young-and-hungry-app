--
-- PostgreSQL database dump
--

\restrict eY9VCm1ygmEsutiGNt5ZyKzFDuZmG5ixDfESaqIHbbm8v1cBjCYmP5wYiYo17Lr

-- Dumped from database version 15.8
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: booking_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.booking_status AS ENUM (
    'pending_deposit',
    'confirmed',
    'in_progress',
    'completed',
    'cancelled',
    'expired_hold',
    'failed_recovery'
);


--
-- Name: ops_issue_severity; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.ops_issue_severity AS ENUM (
    'info',
    'warning',
    'critical'
);


--
-- Name: ops_issue_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.ops_issue_status AS ENUM (
    'open',
    'acknowledged',
    'resolved'
);


--
-- Name: outbox_job_state; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.outbox_job_state AS ENUM (
    'queued',
    'processing',
    'succeeded',
    'failed',
    'dead_letter'
);


--
-- Name: payment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_status AS ENUM (
    'pending',
    'authorized',
    'paid',
    'failed',
    'refunded',
    'disputed'
);


--
-- Name: quote_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.quote_status AS ENUM (
    'draft',
    'estimated',
    'sent',
    'accepted',
    'expired',
    'cancelled'
);


--
-- Name: accept_quote(jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.accept_quote(p_command jsonb) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'app_private'
    AS $$
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


--
-- Name: begin_booking_checkout(jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.begin_booking_checkout(p_command jsonb) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'app_private'
    AS $$
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


--
-- Name: cancel_booking(jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cancel_booking(p_command jsonb) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'app_private'
    AS $$
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


--
-- Name: confirm_paid_booking(jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.confirm_paid_booking(p_command jsonb) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'app_private'
    AS $$
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


--
-- Name: create_quote(jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_quote(p_command jsonb) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'app_private'
    AS $$
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


--
-- Name: expire_booking_hold(jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.expire_booking_hold(p_command jsonb) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'app_private'
    AS $$
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


--
-- Name: normalize_booking_interval(timestamp with time zone, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.normalize_booking_interval(p_job_start_at timestamp with time zone, p_job_block_minutes integer) RETURNS TABLE(bucket_start timestamp with time zone)
    LANGUAGE plpgsql STABLE
    AS $$
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


--
-- Name: reschedule_booking(jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.reschedule_booking(p_command jsonb) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'app_private'
    AS $$
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


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alert_deliveries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.alert_deliveries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ops_issue_id uuid NOT NULL,
    channel text NOT NULL,
    state public.outbox_job_state DEFAULT 'queued'::public.outbox_job_state NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    max_attempts integer DEFAULT 3 NOT NULL,
    last_error text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT alert_deliveries_attempts_check CHECK ((attempts >= 0)),
    CONSTRAINT alert_deliveries_channel_check CHECK ((channel = ANY (ARRAY['email'::text, 'slack'::text]))),
    CONSTRAINT alert_deliveries_max_attempts_check CHECK ((max_attempts > 0))
);


--
-- Name: booking_bucket_locks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.booking_bucket_locks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_id uuid NOT NULL,
    booking_id uuid NOT NULL,
    bucket_start timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT booking_bucket_locks_alignment CHECK (((((date_part('minute'::text, bucket_start))::integer % 15) = 0) AND ((date_part('second'::text, bucket_start))::integer = 0)))
);


--
-- Name: bookings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bookings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    quote_id uuid NOT NULL,
    business_id uuid NOT NULL,
    customer_name text,
    customer_email text,
    customer_phone text,
    pickup_address text,
    dropoff_address text,
    status public.booking_status DEFAULT 'pending_deposit'::public.booking_status NOT NULL,
    job_start_at timestamp with time zone NOT NULL,
    job_end_at timestamp with time zone NOT NULL,
    job_block_minutes integer NOT NULL,
    held_until timestamp with time zone,
    confirmed_at timestamp with time zone,
    cancelled_at timestamp with time zone,
    cancellation_reason text,
    version integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT bookings_job_block_minutes_check CHECK ((job_block_minutes > 0)),
    CONSTRAINT bookings_time_order CHECK ((job_end_at > job_start_at)),
    CONSTRAINT bookings_version_check CHECK ((version >= 0))
);


--
-- Name: businesses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.businesses (
    id uuid NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    domain text NOT NULL,
    timezone text DEFAULT 'Australia/Melbourne'::text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    config jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT businesses_status_check CHECK ((status = ANY (ARRAY['active'::text, 'paused'::text])))
);


--
-- Name: command_dedup; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.command_dedup (
    command_name text NOT NULL,
    idempotency_key text NOT NULL,
    request_hash text NOT NULL,
    result jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: domain_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.domain_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    aggregate_type text NOT NULL,
    aggregate_id uuid NOT NULL,
    aggregate_version integer NOT NULL,
    event_type text NOT NULL,
    idempotency_key text,
    causation_id uuid,
    correlation_id text,
    payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT domain_events_aggregate_version_check CHECK ((aggregate_version > 0))
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    channel text NOT NULL,
    recipient text NOT NULL,
    template text NOT NULL,
    state public.outbox_job_state DEFAULT 'queued'::public.outbox_job_state NOT NULL,
    payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    last_error text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT notifications_attempts_check CHECK ((attempts >= 0)),
    CONSTRAINT notifications_channel_check CHECK ((channel = ANY (ARRAY['email'::text, 'sms'::text, 'slack'::text])))
);


--
-- Name: ops_issues; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ops_issues (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    severity public.ops_issue_severity DEFAULT 'warning'::public.ops_issue_severity NOT NULL,
    category text NOT NULL,
    status public.ops_issue_status DEFAULT 'open'::public.ops_issue_status NOT NULL,
    title text NOT NULL,
    dedupe_key text,
    payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    resolved_at timestamp with time zone,
    CONSTRAINT ops_issues_category_check CHECK ((category = ANY (ARRAY['booking'::text, 'payment'::text, 'notification'::text, 'system'::text])))
);


--
-- Name: outbox_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.outbox_jobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_type text NOT NULL,
    state public.outbox_job_state DEFAULT 'queued'::public.outbox_job_state NOT NULL,
    payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    run_after timestamp with time zone DEFAULT now() NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    max_attempts integer DEFAULT 3 NOT NULL,
    locked_at timestamp with time zone,
    locked_by text,
    last_error text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT outbox_jobs_attempts_check CHECK ((attempts >= 0)),
    CONSTRAINT outbox_jobs_max_attempts_check CHECK ((max_attempts > 0))
);


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    booking_id uuid NOT NULL,
    provider text DEFAULT 'stripe'::text NOT NULL,
    provider_payment_intent_id text,
    provider_event_id text,
    status public.payment_status DEFAULT 'pending'::public.payment_status NOT NULL,
    amount_cents integer NOT NULL,
    currency text DEFAULT 'AUD'::text NOT NULL,
    raw_payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    version integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT payments_amount_cents_check CHECK ((amount_cents >= 0)),
    CONSTRAINT payments_version_check CHECK ((version >= 0))
);


--
-- Name: quotes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quotes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_id uuid NOT NULL,
    customer_name text,
    customer_email text,
    customer_phone text,
    pickup_address text,
    dropoff_address text,
    service_type text DEFAULT 'removal'::text NOT NULL,
    status public.quote_status DEFAULT 'draft'::public.quote_status NOT NULL,
    pricing_version text DEFAULT 'v1'::text NOT NULL,
    price_cents integer,
    deposit_cents integer DEFAULT 10000 NOT NULL,
    currency text DEFAULT 'AUD'::text NOT NULL,
    job_start_at timestamp with time zone,
    job_block_minutes integer,
    expires_at timestamp with time zone,
    breakdown jsonb DEFAULT '{}'::jsonb NOT NULL,
    version integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT quotes_deposit_cents_check CHECK ((deposit_cents >= 0)),
    CONSTRAINT quotes_job_block_minutes_check CHECK (((job_block_minutes IS NULL) OR (job_block_minutes > 0))),
    CONSTRAINT quotes_price_cents_check CHECK (((price_cents IS NULL) OR (price_cents >= 0))),
    CONSTRAINT quotes_version_check CHECK ((version >= 0))
);


--
-- Name: alert_deliveries alert_deliveries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alert_deliveries
    ADD CONSTRAINT alert_deliveries_pkey PRIMARY KEY (id);


--
-- Name: booking_bucket_locks booking_bucket_locks_business_bucket_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_bucket_locks
    ADD CONSTRAINT booking_bucket_locks_business_bucket_unique UNIQUE (business_id, bucket_start);


--
-- Name: booking_bucket_locks booking_bucket_locks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_bucket_locks
    ADD CONSTRAINT booking_bucket_locks_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_quote_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_quote_id_key UNIQUE (quote_id);


--
-- Name: businesses businesses_domain_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_domain_key UNIQUE (domain);


--
-- Name: businesses businesses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_pkey PRIMARY KEY (id);


--
-- Name: businesses businesses_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_slug_key UNIQUE (slug);


--
-- Name: command_dedup command_dedup_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.command_dedup
    ADD CONSTRAINT command_dedup_pkey PRIMARY KEY (command_name, idempotency_key);


--
-- Name: domain_events domain_events_aggregate_version_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.domain_events
    ADD CONSTRAINT domain_events_aggregate_version_unique UNIQUE (aggregate_type, aggregate_id, aggregate_version);


--
-- Name: domain_events domain_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.domain_events
    ADD CONSTRAINT domain_events_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: ops_issues ops_issues_dedupe_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ops_issues
    ADD CONSTRAINT ops_issues_dedupe_unique UNIQUE (dedupe_key);


--
-- Name: ops_issues ops_issues_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ops_issues
    ADD CONSTRAINT ops_issues_pkey PRIMARY KEY (id);


--
-- Name: outbox_jobs outbox_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.outbox_jobs
    ADD CONSTRAINT outbox_jobs_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: payments payments_provider_event_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_provider_event_unique UNIQUE (provider, provider_event_id);


--
-- Name: payments payments_provider_intent_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_provider_intent_unique UNIQUE (provider, provider_payment_intent_id);


--
-- Name: quotes quotes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_pkey PRIMARY KEY (id);


--
-- Name: booking_bucket_locks_booking_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX booking_bucket_locks_booking_idx ON public.booking_bucket_locks USING btree (booking_id);


--
-- Name: bookings_business_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX bookings_business_status_idx ON public.bookings USING btree (business_id, status);


--
-- Name: bookings_quote_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX bookings_quote_idx ON public.bookings USING btree (quote_id);


--
-- Name: domain_events_aggregate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX domain_events_aggregate_idx ON public.domain_events USING btree (aggregate_type, aggregate_id, aggregate_version);


--
-- Name: ops_issues_open_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ops_issues_open_idx ON public.ops_issues USING btree (status, severity, created_at);


--
-- Name: outbox_jobs_claim_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX outbox_jobs_claim_idx ON public.outbox_jobs USING btree (state, run_after, created_at);


--
-- Name: quotes_business_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX quotes_business_status_idx ON public.quotes USING btree (business_id, status);


--
-- Name: alert_deliveries alert_deliveries_ops_issue_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alert_deliveries
    ADD CONSTRAINT alert_deliveries_ops_issue_id_fkey FOREIGN KEY (ops_issue_id) REFERENCES public.ops_issues(id) ON DELETE CASCADE;


--
-- Name: booking_bucket_locks booking_bucket_locks_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_bucket_locks
    ADD CONSTRAINT booking_bucket_locks_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: booking_bucket_locks booking_bucket_locks_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_bucket_locks
    ADD CONSTRAINT booking_bucket_locks_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id);


--
-- Name: bookings bookings_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id);


--
-- Name: bookings bookings_quote_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_quote_id_fkey FOREIGN KEY (quote_id) REFERENCES public.quotes(id);


--
-- Name: payments payments_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id);


--
-- Name: quotes quotes_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id);


--
-- Name: alert_deliveries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.alert_deliveries ENABLE ROW LEVEL SECURITY;

--
-- Name: booking_bucket_locks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.booking_bucket_locks ENABLE ROW LEVEL SECURITY;

--
-- Name: bookings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

--
-- Name: businesses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

--
-- Name: command_dedup; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.command_dedup ENABLE ROW LEVEL SECURITY;

--
-- Name: domain_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.domain_events ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: ops_issues; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ops_issues ENABLE ROW LEVEL SECURITY;

--
-- Name: outbox_jobs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.outbox_jobs ENABLE ROW LEVEL SECURITY;

--
-- Name: payments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

--
-- Name: quotes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

\unrestrict eY9VCm1ygmEsutiGNt5ZyKzFDuZmG5ixDfESaqIHbbm8v1cBjCYmP5wYiYo17Lr

