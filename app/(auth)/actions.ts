"use server";

/**
 * Email + password auth, implemented as Server Actions so the forms work with
 * or without JavaScript. On success we set the Supabase session cookie (via the
 * cookie-bound server client) and redirect into the app.
 *
 * Provisioning (wallet + card) happens at the first CONFIRMED, authenticated
 * session — not at raw signup. So:
 *   - If email confirmation is required, signup creates no financial resources;
 *     the user confirms, signs in, and provisioning lands on that sign-in.
 *   - If email confirmation is disabled, signup returns a session immediately
 *     (the account is already usable) and we provision right then.
 * This guarantees we never issue a card or wallet for an unconfirmed email.
 *
 * Provisioning is best-effort and idempotent: a provider hiccup never blocks
 * auth, and a later sign-in (or the `/api/provision` backstop) fills any gap.
 */

import { redirect } from "next/navigation";
import { ensureUserProvisioned } from "../../lib/provisioning/provision";
import { createServerClient } from "../../lib/supabase/server";

function readCredentials(formData: FormData): {
  email: string;
  password: string;
} {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };
}

function back(page: "login" | "signup", message: string): never {
  redirect(`/${page}?error=${encodeURIComponent(message)}`);
}

/**
 * Provision the user's wallet + card. Best-effort: swallows provider errors so
 * authentication is never blocked, and is idempotent so calling it on every
 * sign-in is a no-op (two cheap reads) once the user is already set up.
 */
async function provisionQuietly(
  userId: string | undefined,
  email: string,
): Promise<void> {
  if (!userId) return;
  try {
    await ensureUserProvisioned(userId, email);
  } catch (err) {
    console.error("Provisioning failed:", err);
  }
}

export async function signIn(formData: FormData): Promise<void> {
  const { email, password } = readCredentials(formData);
  if (!email || !password) {
    back("login", "Informe e-mail e senha.");
  }

  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    back("login", error.message);
  }

  // Only confirmed users reach this point, so this is the right moment to
  // provision (the first sign-in lands the wallet + card).
  await provisionQuietly(data.user?.id, data.user?.email ?? email);

  redirect("/app");
}

export async function signUp(formData: FormData): Promise<void> {
  const { email, password } = readCredentials(formData);
  if (!email || !password) {
    back("signup", "Informe e-mail e senha.");
  }
  if (password.length < 8) {
    back("signup", "A senha precisa ter ao menos 8 caracteres.");
  }

  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    back("signup", error.message);
  }

  // Email confirmation required → no session yet. Do NOT provision: the wallet
  // and card are created only once the user confirms and signs in.
  if (!data.session) {
    redirect("/login?check=email");
  }

  // Confirmation disabled → the account is already usable; provision now.
  await provisionQuietly(data.user?.id, email);

  redirect("/app");
}

export async function signOut(): Promise<void> {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
