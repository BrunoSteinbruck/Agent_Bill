-- ===========================================================================
-- Bill — agent_decisions: persist the user-facing message and the card-level
-- action Bill recommended, alongside the raw decision.
--
-- `user_message` is what the app shows the user for notify/review/block.
-- `recommended_action` is the card lever Bill suggests — never auto-executed by
-- the webhook; the user (or an explicit action route) carries it out. This keeps
-- the non-custodial, user-in-control boundary intact.
-- ===========================================================================

create type recommended_action as enum (
  'none',
  'freeze_card',
  'flag_subscription',
  'cancel_renewal'
);

alter table agent_decisions
  add column user_message       text,
  add column recommended_action recommended_action not null default 'none';
