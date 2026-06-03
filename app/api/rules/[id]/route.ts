/**
 * DELETE /api/rules/:id — remove a user rule. RLS ensures the user can only
 * delete their own.
 */

import { getAuthUser } from "../../../../lib/supabase/auth";
import {
  json,
  notFound,
  serverError,
  unauthorized,
} from "../../../../lib/api/http";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { supabase, user } = await getAuthUser();
  if (!user) return unauthorized();

  const { id } = await params;

  const { data, error } = await supabase
    .from("user_rules")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) return serverError(error.message);
  if (!data) return notFound("Rule not found.");
  return json({ deleted: true, id: data.id });
}
