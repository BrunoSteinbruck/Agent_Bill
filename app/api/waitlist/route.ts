/**
 * POST /api/waitlist — capture an "apply for access" submission from the public
 * landing page. No auth: anyone can apply. We write with the admin client
 * because the waitlist table is RLS-locked (no public read/write); this route
 * is the only door in.
 *
 * Light abuse protection:
 *   - Honeypot: a hidden `company` field real users never fill. If it's set, we
 *     pretend success and drop the row (bots think they won).
 *   - Rate limit: a simple per-IP fixed window. In-memory, so it's per server
 *     instance — enough friction pre-launch; swap for a shared store (KV/DB)
 *     before serious traffic.
 */

import { json, badRequest, serverError } from "../../../lib/api/http";
import { createAdminClient } from "../../../lib/supabase/server";

export const runtime = "nodejs";

const MAX = { name: 120, email: 200, country: 80, stack: 200, reason: 2000, source: 120 };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// --- Per-IP fixed-window rate limit ----------------------------------------
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now > rec.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  rec.count += 1;
  return rec.count > MAX_PER_WINDOW;
}

function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function str(value: unknown, limit: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, limit);
}

export async function POST(request: Request): Promise<Response> {
  if (rateLimited(clientIp(request))) {
    return json({ ok: false, error: "Too many requests." }, 429);
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return badRequest("Body must be valid JSON.");
  }

  // Honeypot: a real user leaves `company` empty. If it's filled, silently
  // accept (no insert) so the bot doesn't learn it was caught.
  if (str(body.company, 200)) {
    return json({ ok: true });
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
    source: str(body.source, MAX.source),
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
