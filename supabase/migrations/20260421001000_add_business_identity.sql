create table businesses (
  id uuid primary key,
  slug text not null unique,
  name text not null,
  domain text not null unique,
  timezone text not null default 'Australia/Melbourne',
  status text not null default 'active' check (status in ('active', 'paused')),
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into businesses (id, slug, name, domain, timezone, config)
values (
  '00000000-0000-4000-8000-000000000001',
  'young-and-hungry',
  'Young & Hungry',
  'youngandh.co',
  'Australia/Melbourne',
  jsonb_build_object(
    'defaultCurrency', 'AUD',
    'defaultDepositCents', 10000,
    'defaultJobBlockMinutes', 120,
    'bookingHoldMinutes', 15
  )
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  domain = excluded.domain,
  timezone = excluded.timezone,
  config = excluded.config,
  updated_at = now();

alter table quotes
  add constraint quotes_business_id_fkey
  foreign key (business_id)
  references businesses(id);

alter table bookings
  add constraint bookings_business_id_fkey
  foreign key (business_id)
  references businesses(id);

alter table booking_bucket_locks
  add constraint booking_bucket_locks_business_id_fkey
  foreign key (business_id)
  references businesses(id);

alter table businesses enable row level security;
