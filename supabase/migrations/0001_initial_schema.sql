-- ===========================================================================
-- Bill — initial schema
-- ---------------------------------------------------------------------------
-- Model: the user owns their wallet (non-custodial, via Crossmint). The card
-- balance is held at the card-program level (Lithic/Rain). The Bill agent can
-- read everything and act on the *card* (freeze, decline, cancel renewal) but
-- never moves wallet funds.
--
-- Security: every domain table is owned by a user and protected by RLS so a
-- signed-in user only ever sees their own rows. The backend/agent uses the
-- service-role key, which bypasses RLS.
-- ===========================================================================

create extension if not exists "uuid-ossp";

-- --- Enums -----------------------------------------------------------------
create type card_status as enum ('active', 'frozen', 'terminated');
create type subscription_status as enum ('healthy', 'observed', 'needs_review', 'cancelled');
create type transaction_status as enum ('pending', 'approved', 'declined', 'settled', 'reversed');
create type decision_type as enum ('approve', 'block', 'notify', 'review');
create type rule_action as enum ('approve', 'block', 'notify');

-- --- updated_at helper ------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ===========================================================================
-- profiles — 1:1 with auth.users, holds product-level profile data
-- ===========================================================================
create table profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  full_name     text,
  country       text,
  currency      text not null default 'USD',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- ===========================================================================
-- wallets — the user's non-custodial wallet (Crossmint). Bill reads, never moves.
-- ===========================================================================
create table wallets (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid not null references auth.users (id) on delete cascade,
  crossmint_wallet_id   text not null,
  address               text not null,
  chain                 text not null default 'polygon',
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (crossmint_wallet_id)
);

create index wallets_user_id_idx on wallets (user_id);

create trigger wallets_updated_at
  before update on wallets
  for each row execute function set_updated_at();

-- ===========================================================================
-- cards — the Bill virtual card (Lithic). Limits are enforced by the agent.
-- ===========================================================================
create table cards (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid not null references auth.users (id) on delete cascade,
  lithic_card_token     text not null,
  last_four             text not null,
  network               text not null default 'Visa',
  status                card_status not null default 'active',
  -- Spend posture (in minor units of `currency`, e.g. cents)
  currency              text not null default 'USD',
  monthly_limit         integer,
  new_merchant_cap      integer,
  trusted_merchant_cap  integer,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (lithic_card_token)
);

create index cards_user_id_idx on cards (user_id);

create trigger cards_updated_at
  before update on cards
  for each row execute function set_updated_at();

-- ===========================================================================
-- subscriptions — recurring merchants Bill is watching
-- ===========================================================================
create table subscriptions (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid not null references auth.users (id) on delete cascade,
  merchant_name         text not null,
  descriptor_pattern    text,
  amount                integer not null,            -- minor units
  max_amount            integer,                     -- user-approved ceiling
  suggested_max_amount  integer,                     -- agent suggestion
  currency              text not null default 'USD',
  next_charge_date      date,
  cycles_paid           integer not null default 0,
  usage_score           integer,                     -- 0-100, advisory
  status                subscription_status not null default 'observed',
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index subscriptions_user_id_idx on subscriptions (user_id);

create trigger subscriptions_updated_at
  before update on subscriptions
  for each row execute function set_updated_at();

-- ===========================================================================
-- user_rules — per-merchant posture the agent consults before deciding
-- ===========================================================================
create table user_rules (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  merchant_pattern  text not null,
  action            rule_action not null,
  threshold_amount  integer,                         -- minor units, optional
  note              text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index user_rules_user_id_idx on user_rules (user_id);

create trigger user_rules_updated_at
  before update on user_rules
  for each row execute function set_updated_at();

-- ===========================================================================
-- transactions — card activity, mirrored from Lithic webhooks
-- ===========================================================================
create table transactions (
  id                        uuid primary key default uuid_generate_v4(),
  user_id                   uuid not null references auth.users (id) on delete cascade,
  card_id                   uuid references cards (id) on delete set null,
  subscription_id           uuid references subscriptions (id) on delete set null,
  lithic_transaction_token  text not null,
  merchant_name             text,
  descriptor                text,
  amount                    integer not null,        -- minor units
  currency                  text not null default 'USD',
  status                    transaction_status not null default 'pending',
  is_recurring              boolean not null default false,
  occurred_at               timestamptz not null default now(),
  created_at                timestamptz not null default now(),
  unique (lithic_transaction_token)
);

create index transactions_user_id_idx on transactions (user_id);
create index transactions_card_id_idx on transactions (card_id);

-- ===========================================================================
-- agent_decisions — every decision Bill makes, for auditability
-- ===========================================================================
create table agent_decisions (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  transaction_id    uuid references transactions (id) on delete cascade,
  decision          decision_type not null,
  reasoning         text,
  confidence        numeric(3, 2),                   -- 0.00 - 1.00
  model             text,
  created_at        timestamptz not null default now()
);

create index agent_decisions_user_id_idx on agent_decisions (user_id);
create index agent_decisions_transaction_id_idx on agent_decisions (transaction_id);

-- ===========================================================================
-- Auto-create a profile row when a new auth user signs up
-- ===========================================================================
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ===========================================================================
-- Row Level Security — users can only touch their own rows
-- ===========================================================================
alter table profiles        enable row level security;
alter table wallets         enable row level security;
alter table cards           enable row level security;
alter table subscriptions   enable row level security;
alter table user_rules      enable row level security;
alter table transactions    enable row level security;
alter table agent_decisions enable row level security;

-- profiles keyed by id; everything else by user_id
create policy "own profile" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "own wallets" on wallets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own cards" on cards
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own subscriptions" on subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own rules" on user_rules
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- transactions and decisions are written by the backend (service role) and are
-- read-only to the user.
create policy "read own transactions" on transactions
  for select using (auth.uid() = user_id);

create policy "read own decisions" on agent_decisions
  for select using (auth.uid() = user_id);
