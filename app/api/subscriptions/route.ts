/**
 * GET /api/subscriptions — list the signed-in user's subscriptions.
 * RLS scopes the query to the caller automatically.
 */

import { getAuthUser } from "../../../lib/supabase/auth";
import { json, serverError, unauthorized } from "../../../lib/api/http";

export async function GET(): Promise<Response> {
  const { supabase, user } = await getAuthUser();
  if (!user) return unauthorized();

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return serverError(error.message);
  return json({ subscriptions: data });
}
