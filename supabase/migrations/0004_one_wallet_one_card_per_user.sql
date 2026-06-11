-- ===========================================================================
-- Bill — exactly one wallet and one card per user
-- ---------------------------------------------------------------------------
-- Provisioning is "read, and create only if missing". Two near-simultaneous
-- sign-ins (two tabs, a double click, a network retry, the /api/provision
-- backstop firing alongside a sign-in) can BOTH pass the "missing" check and
-- BOTH try to create — issuing duplicate wallets/cards for one user.
--
-- These UNIQUE(user_id) constraints make the database the arbiter: the loser of
-- the race fails its insert with SQLSTATE 23505, and ensureUserProvisioned()
-- catches that and re-reads the row that won. Without this, the duplicate rows
-- would also break every .maybeSingle()/.single() read in the app (the dashboard
-- starts erroring with "multiple rows returned").
--
-- NOTE: each user should have at most one wallet and one card today, so these
-- apply cleanly. If a prior race already created duplicates, dedupe them before
-- running this (keep the oldest row per user_id).
-- ===========================================================================

alter table wallets add constraint wallets_user_id_key unique (user_id);
alter table cards   add constraint cards_user_id_key   unique (user_id);
