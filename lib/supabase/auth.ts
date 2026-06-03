/**
 * Helper for route handlers: get the signed-in user together with an
 * RLS-scoped Supabase client. Every query made through the returned client is
 * automatically constrained to this user's own rows.
 */

import type { User } from "@supabase/supabase-js";
import { createServerClient } from "./server";

export async function getAuthUser(): Promise<{
  supabase: Awaited<ReturnType<typeof createServerClient>>;
  user: User | null;
}> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}
