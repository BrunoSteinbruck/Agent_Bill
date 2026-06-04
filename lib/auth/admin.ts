/**
 * Admin gate for the /admin area (waitlist management).
 *
 * "Admin" is just an email allowlist (ADMIN_EMAILS) — there is no admin role in
 * the database. This keeps the surface tiny: a single env var decides who can
 * read the (RLS-locked) waitlist and flip statuses. The check runs server-side
 * only; the service-role key is never reachable from the browser.
 *
 * Every privileged path (the page render AND each server action) must call
 * `requireAdmin()` itself — never trust that an earlier check already ran.
 */

import type { User } from "@supabase/supabase-js";
import { serverEnv } from "../env";
import { createServerClient } from "../supabase/server";

/** True if `email` is on the ADMIN_EMAILS allowlist (case-insensitive). */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return serverEnv.adminEmails.includes(email.trim().toLowerCase());
}

/**
 * Returns the signed-in user if they're an admin, otherwise `null`. Use this in
 * server components to decide between rendering the admin UI and `notFound()`.
 */
export async function getAdminUser(): Promise<User | null> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) return null;
  return user;
}

/**
 * Like `getAdminUser` but throws when the caller is not an admin. Use this in
 * server actions, where the right response to "not allowed" is to fail loudly
 * rather than render anything.
 */
export async function requireAdmin(): Promise<User> {
  const user = await getAdminUser();
  if (!user) throw new Error("Not authorized.");
  return user;
}
