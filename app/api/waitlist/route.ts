/**
 * POST /api/waitlist — capture an "apply for access" submission from the public
 * landing page. No auth: anyone can apply. We write with the admin client
 * because the waitlist table is RLS-locked (no public read/write); this route
 * is the only door in.
 *
 * Kept deliberately small. Real abuse protection (rate limiting / captcha) is a
 * follow-up before any heavy launch traffic.
 */

import { json, badRequest, serverError } from "../../../lib/api/http";
import { createAdminClient } from "../../../lib/supabase/server";

export const runtime = "nodejs";

const MAX = { name: 120, email: 200, country: 80, stack: 200, reason: 2000 };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(value: unknown, limit: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, limit);
}

export async function POST(request: Request): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return badRequest("Body must be valid JSON.");
  }

  const name = str(body.name, MAX.name);
  const email = str(body.email, MAX.email);

  if (!name) return badRequest("name is required.");
  if (!email || !EMAIL_RE.test(email)) {
    return badRequest("A valid email is required.");
  }

  const entry = {
    name,
    email: email.toLowerCase(),
    country: str(body.country, MAX.country),
    stack: str(body.stack, MAX.stack),
    reason: str(body.reason, MAX.reason),
    locale: str(body.locale, 8),
  };

  const db = createAdminClient();
  const { error } = await db.from("waitlist").insert(entry);

  if (error) {
    // Duplicate email (unique violation) — treat as success so we don't leak
    // who's already on the list and the UX stays clean.
    if (error.code === "23505") {
      return json({ ok: true, alreadyOnList: true });
    }
    return serverError(error.message);
  }

  return json({ ok: true }, 201);
}
