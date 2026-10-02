-- =========================================================
-- ALVOXIS — core schema
-- profiles · orders · order_items · support_contributions ·
-- gifts · stripe_events
--
-- Money is stored as integer cents (EUR) so totals are exact.
-- Every payment state is written by the stripe-webhook Edge
-- Function (service role) — never by the browser.
-- =========================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------
-- helpers
-- ---------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ---------------------------------------------------------
-- profiles — one row per auth user
-- ---------------------------------------------------------

create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 80),
  avatar_url   text check (char_length(avatar_url) <= 2048),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- create the profile when an account is created (email or Google)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'), 80),
    left(new.raw_user_meta_data ->> 'avatar_url', 2048)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- accounts that already exist get a profile too
insert into public.profiles (id, display_name, avatar_url)
select
  u.id,
  left(coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name'), 80),
  left(u.raw_user_meta_data ->> 'avatar_url', 2048)
from auth.users u
on conflict (id) do nothing;


-- ---------------------------------------------------------
-- orders + order_items
-- ---------------------------------------------------------

create sequence public.order_number_seq start with 1001;

create table public.orders (
  id                          uuid primary key default gen_random_uuid(),
  user_id                     uuid references auth.users (id) on delete set null,
  order_number                text not null unique
                                default ('ALX-' || lpad(nextval('public.order_number_seq')::text, 6, '0')),
  currency                    text not null default 'eur' check (currency = 'eur'),
  subtotal_cents              integer not null check (subtotal_cents >= 0),
  total_cents                 integer not null check (total_cents >= 0),
  payment_status              text not null default 'pending'
                                check (payment_status in ('pending', 'paid', 'failed', 'canceled', 'expired', 'refunded')),
  fulfillment_status          text not null default 'unfulfilled'
                                check (fulfillment_status in ('unfulfilled', 'in_production', 'shipped', 'delivered', 'canceled')),
  shipping_address            jsonb,
  language                    text check (language in ('en', 'lv', 'ru', 'et', 'lt')),
  checkout_attempt_id         uuid unique,   -- one order per checkout click, however often it is retried
  stripe_checkout_session_id  text unique,
  stripe_payment_intent_id    text unique,
  paid_at                     timestamptz,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

create index orders_user_id_created_at_idx on public.orders (user_id, created_at desc);

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id                    uuid primary key default gen_random_uuid(),
  order_id              uuid not null references public.orders (id) on delete cascade,
  product_id            text not null check (product_id in ('mini', 'classic')),
  product_name          text not null,
  quantity              integer not null check (quantity between 1 and 10),
  unit_price_cents      integer not null check (unit_price_cents >= 0),
  total_price_cents     integer not null check (total_price_cents = unit_price_cents * quantity),
  personalization_data  jsonb not null default '{}'::jsonb,
  photo_path            text,
  created_at            timestamptz not null default now()
);

create index order_items_order_id_idx on public.order_items (order_id);
create index order_items_photo_path_idx on public.order_items (photo_path) where photo_path is not null;


-- ---------------------------------------------------------
-- support_contributions — "Support the story" (€1.00–€100.00)
-- ---------------------------------------------------------

create table public.support_contributions (
  id                          uuid primary key default gen_random_uuid(),
  user_id                     uuid references auth.users (id) on delete set null,
  amount_cents                integer not null check (amount_cents between 100 and 10000),
  currency                    text not null default 'eur' check (currency = 'eur'),
  language                    text check (language in ('en', 'lv', 'ru', 'et', 'lt')),
  checkout_attempt_id         uuid unique,
  stripe_checkout_session_id  text unique,
  stripe_payment_intent_id    text unique,
  payment_status              text not null default 'pending'
                                check (payment_status in ('pending', 'paid', 'failed', 'canceled', 'expired', 'refunded')),
  gift_eligible               boolean not null default false,
  paid_at                     timestamptz,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),
  -- a gift can only ever be granted for a confirmed contribution of €50.00 or more
  constraint support_gift_requires_paid_50 check (
    not gift_eligible or (payment_status = 'paid' and amount_cents >= 5000)
  )
);

create index support_contributions_user_id_created_at_idx
  on public.support_contributions (user_id, created_at desc);

create trigger support_contributions_set_updated_at
  before update on public.support_contributions
  for each row execute function public.set_updated_at();


-- ---------------------------------------------------------
-- gifts — the keepsake puzzle unlocked by €50+ support
-- ---------------------------------------------------------

create table public.gifts (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid references auth.users (id) on delete set null,
  support_contribution_id  uuid not null unique
                             references public.support_contributions (id) on delete cascade,
  gift_type                text not null default 'puzzle' check (gift_type in ('puzzle')),
  photo_path               text,
  photo_status             text not null default 'pending'
                             check (photo_status in ('pending', 'uploaded', 'approved', 'rejected')),
  production_status        text not null default 'not_started'
                             check (production_status in ('not_started', 'processing', 'shipped', 'delivered')),
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  constraint gifts_photo_consistent check ((photo_path is null) = (photo_status = 'pending'))
);

create index gifts_user_id_idx on public.gifts (user_id);

create trigger gifts_set_updated_at
  before update on public.gifts
  for each row execute function public.set_updated_at();


-- ---------------------------------------------------------
-- stripe_events — processed webhook events (idempotency)
-- ---------------------------------------------------------

create table public.stripe_events (
  id            text primary key,          -- Stripe event id (evt_…)
  type          text not null,
  processed_at  timestamptz not null default now()
);
