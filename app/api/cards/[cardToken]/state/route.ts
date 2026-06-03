/**
 * POST /api/cards/:cardToken/state — freeze / unfreeze / terminate a card.
 *
 * Body: { "state": "OPEN" | "PAUSED" | "CLOSED" }
 *
 * This is the user-initiated card lever (e.g. acting on a Bill recommendation
 * to freeze). We confirm the card belongs to the caller via RLS, change it at
 * Lithic, then mirror the new status into Supabase. It only ever touches the
 * card — never the user's wallet or funds.
 */

import { getAuthUser } from "../../../../../lib/supabase/auth";
import {
  badRequest,
  json,
  notFound,
  serverError,
  unauthorized,
} from "../../../../../lib/api/http";
import { setCardState } from "../../../../../lib/lithic/client";
import type { CardStatus } from "../../../../../lib/supabase/types";

type LithicState = "OPEN" | "PAUSED" | "CLOSED";

const STATE_TO_STATUS: Record<LithicState, CardStatus> = {
  OPEN: "active",
  PAUSED: "frozen",
  CLOSED: "terminated",
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ cardToken: string }> },
): Promise<Response> {
  const { supabase, user } = await getAuthUser();
  if (!user) return unauthorized();

  const { cardToken } = await params;

  let body: { state?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return badRequest("Body must be valid JSON.");
  }

  const state = body.state;
  if (state !== "OPEN" && state !== "PAUSED" && state !== "CLOSED") {
    return badRequest('state must be one of: "OPEN", "PAUSED", "CLOSED".');
  }

  // Ownership check — RLS means this only returns the card if it's the user's.
  const { data: card, error: lookupErr } = await supabase
    .from("cards")
    .select("id")
    .eq("lithic_card_token", cardToken)
    .maybeSingle();

  if (lookupErr) return serverError(lookupErr.message);
  if (!card) return notFound("Card not found.");

  // Change it at the card program (Lithic), then mirror the status locally.
  try {
    await setCardState(cardToken, state);
  } catch (err) {
    return serverError(
      `Failed to update card at Lithic: ${err instanceof Error ? err.message : "unknown error"}`,
    );
  }

  const { data: updated, error: updateErr } = await supabase
    .from("cards")
    .update({ status: STATE_TO_STATUS[state] })
    .eq("id", card.id)
    .select("*")
    .maybeSingle();

  if (updateErr) return serverError(updateErr.message);
  return json({ card: updated });
}
