/**
 * Centralized, validated environment access.
 *
 * Server-only secrets are read lazily through getters so that importing this
 * module in a client component never throws — only *reading* a server secret
 * on the client would. Public values (NEXT_PUBLIC_*) are safe everywhere.
 */

function required(name: string, value: string | undefined): string {
  if (!value || value.length === 0) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Copy .env.example to .env.local and fill it in.`,
    );
  }
  return value;
}

/** Public values — safe to read in the browser. */
export const publicEnv = {
  supabaseUrl: required(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  ),
  supabaseAnonKey: required(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ),
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
};

/**
 * Server-only secrets. Accessing any property throws if the code path runs in
 * the browser, preventing accidental secret exposure.
 */
export const serverEnv = {
  get supabaseServiceRoleKey() {
    assertServer("SUPABASE_SERVICE_ROLE_KEY");
    return required(
      "SUPABASE_SERVICE_ROLE_KEY",
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
  },
  get lithicApiKey() {
    assertServer("LITHIC_API_KEY");
    return required("LITHIC_API_KEY", process.env.LITHIC_API_KEY);
  },
  get lithicEnvironment(): "sandbox" | "production" {
    return process.env.LITHIC_ENVIRONMENT === "production"
      ? "production"
      : "sandbox";
  },
  get lithicWebhookSecret() {
    assertServer("LITHIC_WEBHOOK_SECRET");
    return required("LITHIC_WEBHOOK_SECRET", process.env.LITHIC_WEBHOOK_SECRET);
  },
  get crossmintApiKey() {
    assertServer("CROSSMINT_API_KEY");
    return required("CROSSMINT_API_KEY", process.env.CROSSMINT_API_KEY);
  },
  get crossmintEnvironment(): "staging" | "production" {
    return process.env.CROSSMINT_ENVIRONMENT === "production"
      ? "production"
      : "staging";
  },
  get anthropicApiKey() {
    assertServer("ANTHROPIC_API_KEY");
    return required("ANTHROPIC_API_KEY", process.env.ANTHROPIC_API_KEY);
  },

  // --- Waitlist invites (optional) -----------------------------------------
  // Resend powers the "you're in" invite emails. Optional on purpose: with no
  // key set, the admin page still works and status flips still persist — the
  // email step just degrades to a no-op (see lib/email/invite.ts).
  get resendApiKey(): string | null {
    assertServer("RESEND_API_KEY");
    return process.env.RESEND_API_KEY?.trim() || null;
  },
  // The From address for invite emails. Resend's shared sandbox sender works
  // out of the box; swap for a verified domain before real sends.
  get waitlistFromEmail(): string {
    assertServer("WAITLIST_FROM_EMAIL");
    return (
      process.env.WAITLIST_FROM_EMAIL?.trim() || "Bill <onboarding@resend.dev>"
    );
  },
  // Comma-separated allowlist of emails that may reach /admin. Compared
  // case-insensitively. Empty → nobody is an admin (the page 404s for all).
  get adminEmails(): string[] {
    assertServer("ADMIN_EMAILS");
    return (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean);
  },
};

function assertServer(name: string) {
  if (typeof window !== "undefined") {
    throw new Error(
      `Attempted to read server-only secret "${name}" in the browser. ` +
        `This value must only be used in server components, route handlers, or actions.`,
    );
  }
}
