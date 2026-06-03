"use client";

/**
 * Browser Supabase client — RLS-scoped to the signed-in user via the auth
 * cookie. Safe to use in client components for reads/writes the user owns.
 */

import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "../env";
import type { Database } from "./types";

let browserSingleton: ReturnType<typeof createBrowserClient<Database>> | null =
  null;

export function createClient() {
  if (browserSingleton) return browserSingleton;

  browserSingleton = createBrowserClient<Database>(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey,
  );

  return browserSingleton;
}
