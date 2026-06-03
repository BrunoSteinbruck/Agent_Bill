/**
 * GET  /api/rules — list the user's merchant rules.
 * POST /api/rules — create a rule Bill consults before deciding.
 *
 * Rules are explicit user intent ("always approve Spotify", "block this MCC")
 * and override Bill's own judgment. RLS scopes everything to the caller.
 */

import { getAuthUser } from "../../../lib/supabase/auth";
import {
  badRequest,
  json,
  serverError,
  unauthorized,
} from "../../../lib/api/http";
import type { RuleAction } from "../../../lib/supabase/types";

const ACTIONS: RuleAction[] = ["approve", "block", "notify"];

export async function GET(): Promise<Response> {
  const { supabase, user } = await getAuthUser();
  if (!user) return unauthorized();

  const { data, error } = await supabase
    .from("user_rules")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return serverError(error.message);
  return json({ rules: data });
}

export async function POST(request: Request): Promise<Response> {
  const { supabase, user } = await getAuthUser();
  if (!user) return unauthorized();

  let body: {
    merchant_pattern?: unknown;
    action?: unknown;
    threshold_amount?: unknown;
    note?: unknown;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return badRequest("Body must be valid JSON.");
  }

  if (typeof body.merchant_pattern !== "string" || !body.merchant_pattern.trim()) {
    return badRequest("merchant_pattern is required.");
  }
  if (
    typeof body.action !== "string" ||
    !ACTIONS.includes(body.action as RuleAction)
  ) {
    return badRequest(`action must be one of: ${ACTIONS.join(", ")}.`);
  }
  if (
    body.threshold_amount !== undefined &&
    body.threshold_amount !== null &&
    (typeof body.threshold_amount !== "number" ||
      !Number.isInteger(body.threshold_amount))
  ) {
    return badRequest("threshold_amount must be an integer (minor units) or null.");
  }
  if (body.note !== undefined && body.note !== null && typeof body.note !== "string") {
    return badRequest("note must be a string or null.");
  }

  const { data, error } = await supabase
    .from("user_rules")
    .insert({
      user_id: user.id,
      merchant_pattern: body.merchant_pattern.trim(),
      action: body.action as RuleAction,
      threshold_amount: (body.threshold_amount as number | null | undefined) ?? null,
      note: (body.note as string | null | undefined) ?? null,
    })
    .select("*")
    .single();

  if (error) return serverError(error.message);
  return json({ rule: data }, 201);
}
