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
    v_result := app_private.rpc_failure(
      'QUOTE_NOT_BOOKABLE',
      'Quote is missing scheduling fields.',
      jsonb_build_object(
        'quoteId', v_quote.id,
        'hasJobStartAt', v_quote.job_start_at is not null,
        'hasJobBlockMinutes', v_quote.job_block_minutes is not null
      )
    );
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
