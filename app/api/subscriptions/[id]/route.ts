/**
 * PATCH /api/subscriptions/:id — update a subscription's status or ceiling.
 *
 * This is how the user acts on a renewal — e.g. setting status to "cancelled"
 * to stop watching/approving it, or raising max_amount. RLS ensures the user
 * can only touch their own subscription. Note this records the user's intent in
 * Bill's ledger; it does not itself contact the merchant.
 */

import { getAuthUser } from "../../../../lib/supabase/auth";
import {
  badRequest,
  json,
  notFound,
  serverError,
  unauthorized,
} from "../../../../lib/api/http";
import type { SubscriptionStatus } from "../../../../lib/supabase/types";

const STATUSES: SubscriptionStatus[] = [
  "healthy",
  "observed",
  "needs_review",
  "cancelled",
];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { supabase, user } = await getAuthUser();
  if (!user) return unauthorized();

  const { id } = await params;

  let body: { status?: unknown; max_amount?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return badRequest("Body must be valid JSON.");
  }

  const patch: { status?: SubscriptionStatus; max_amount?: number } = {};

  if (body.status !== undefined) {
    if (
      typeof body.status !== "string" ||
      !STATUSES.includes(body.status as SubscriptionStatus)
    ) {
      return badRequest(`status must be one of: ${STATUSES.join(", ")}.`);
    }
    patch.status = body.status as SubscriptionStatus;
  }

  if (body.max_amount !== undefined) {
    if (typeof body.max_amount !== "number" || !Number.isInteger(body.max_amount)) {
      return badRequest("max_amount must be an integer (minor units).");
    }
    patch.max_amount = body.max_amount;
  }

  if (Object.keys(patch).length === 0) {
    return badRequest("Provide at least one of: status, max_amount.");
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .update(patch)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) return serverError(error.message);
  if (!data) return notFound("Subscription not found.");
  return json({ subscription: data });
}
