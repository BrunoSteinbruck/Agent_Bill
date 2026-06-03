/**
 * Server-side Supabase clients.
 *
 * - `createServerClient()` is RLS-scoped to the signed-in user (reads the auth
 *   cookie). Use it in server components, route handlers, and server actions
 *   for anything the *user* is doing.
 *
 * - `createAdminClient()` uses the service-role key and BYPASSES RLS. Use it
 *   only in trusted backend paths — webhooks and the agent — never in response
 *   to unauthenticated input without your own authorization checks.
 */

import { createServerClient as createSSRClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { publicEnv, serverEnv } from "../env";
import type { Database } from "./types";

export async function createServerClient() {
  const cookieStore = await cookies();

  return createSSRClient<Database>(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // `setAll` is called from a Server Component — safe to ignore when
            // middleware is responsible for refreshing the session.
          }
        },
      },
    },
  );
}

let adminSingleton: ReturnType<typeof createClient<Database>> | null = null;

export function createAdminClient() {
  if (adminSingleton) return adminSingleton;

  adminSingleton = createClient<Database>(
    publicEnv.supabaseUrl,
    serverEnv.supabaseServiceRoleKey,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );

  return adminSingleton;
}
