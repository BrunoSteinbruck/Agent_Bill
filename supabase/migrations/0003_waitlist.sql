-- ===========================================================================
-- Bill — waitlist
-- ---------------------------------------------------------------------------
-- Captures "apply for access" submissions from the public landing page while
-- the product is pre-launch. This table is NOT owned by an auth user, so RLS is
-- enabled with NO policies: the anon/auth roles can neither read nor write it.
-- Only the service-role key (the /api/waitlist backend route) can insert, and
-- only you — via the Supabase dashboard / service role — can read the list.
--
-- `status` is the management lever: pending → invited → rejected. When you're
-- ready to let someone in, flip them to 'invited' and send the signup link.
-- ===========================================================================

create table waitlist (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  email       text not null,
  country     text,
  stack       text,
  reason      text,
  locale      text,
  -- Acquisition source for attribution (e.g. utm_source=twitter, a ?ref=...).
  -- Lets you measure which posts / channels drive signups before launch.
  source      text,
  status      text not null default 'pending',
  created_at  timestamptz not null default now(),
  unique (email)
);

create index waitlist_status_idx on waitlist (status);
create index waitlist_created_at_idx on waitlist (created_at desc);

-- Lock it down: enabling RLS with no policies means only the service role
-- (which bypasses RLS) can touch these rows. The public can submit through the
-- backend route, but the email list is never publicly readable.
alter table waitlist enable row level security;
