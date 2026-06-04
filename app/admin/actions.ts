"use server";

/**
 * Waitlist management actions, callable only by an admin (ADMIN_EMAILS).
 *
 * Every action re-verifies admin via `requireAdmin()` — never assume the page
 * already checked. Reads/writes use the admin (service-role) client because the
 * waitlist table is RLS-locked with no policies.
 *
 * Status is the source of truth (pending → invited → rejected). The invite
 * email is a best-effort side effect: we flip status to 'invited' first, then
 * try to send. A send failure does NOT undo the status change — the admin can
 * always copy the signup link by hand.
 */

import { revalidatePath } from "next/cache";
import { requireAdmin } from "../../lib/auth/admin";
import { sendWaitlistInvite } from "../../lib/email/invite";
import { createAdminClient } from "../../lib/supabase/server";
import type { WaitlistEntry } from "../../lib/supabase/types";

const ADMIN_PATH = "/admin/waitlist";

/** Flip one entry to `invited` and send the invite email (best-effort). */
export async function inviteOne(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const db = createAdminClient();
  const { data, error } = await db
    .from("waitlist")
    .update({ status: "invited" })
    .eq("id", id)
    .select("email, name, locale")
    .single();

  if (error || !data) {
    revalidatePath(ADMIN_PATH);
    return;
  }

  await sendWaitlistInvite({
    email: data.email,
    name: data.name,
    locale: data.locale,
  });

  revalidatePath(ADMIN_PATH);
}

/** Mark one entry as `rejected`. No email is sent. */
export async function rejectOne(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const db = createAdminClient();
  await db.from("waitlist").update({ status: "rejected" }).eq("id", id);

  revalidatePath(ADMIN_PATH);
}

/** Move one entry back to `pending` (undo an invite/reject). No email. */
export async function resetOne(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const db = createAdminClient();
  await db.from("waitlist").update({ status: "pending" }).eq("id", id);

  revalidatePath(ADMIN_PATH);
}

/**
 * Invite everyone still `pending` in one shot: flip them all to `invited`, then
 * fan out the emails. This is the "open it up to the whole list" lever — run it
 * when you're ready to let the current waitlist in.
 */
export async function inviteAllPending(): Promise<void> {
  await requireAdmin();

  const db = createAdminClient();
  const { data: pending, error } = await db
    .from("waitlist")
    .select("id, email, name, locale")
    .eq("status", "pending");

  if (error || !pending || pending.length === 0) {
    revalidatePath(ADMIN_PATH);
    return;
  }

  const ids = pending.map((row) => row.id);
  await db.from("waitlist").update({ status: "invited" }).in("id", ids);

  // Send sequentially to stay friendly to Resend's rate limits. Failures are
  // swallowed per-recipient so one bad address doesn't stop the rest.
  for (const row of pending as Pick<
    WaitlistEntry,
    "id" | "email" | "name" | "locale"
  >[]) {
    await sendWaitlistInvite({
      email: row.email,
      name: row.name,
      locale: row.locale,
    });
  }

  revalidatePath(ADMIN_PATH);
}
