/**
 * Admin · Waitlist — the private console for managing "apply for access".
 *
 * Access is gated twice: the proxy requires a signed-in user for /admin, and
 * this page (plus every action) requires the email to be on ADMIN_EMAILS. A
 * signed-in non-admin gets a 404 via `notFound()` — we don't reveal the page
 * exists.
 *
 * The list is read with the service-role client because `waitlist` is RLS-
 * locked (no public policies). Status is the source of truth; the invite email
 * is a best-effort side effect of flipping a row to 'invited'.
 */

import { notFound } from "next/navigation";
import { getAdminUser } from "../../../lib/auth/admin";
import { serverEnv } from "../../../lib/env";
import { createAdminClient } from "../../../lib/supabase/server";
import type { WaitlistEntry } from "../../../lib/supabase/types";
import { inviteAllPending, inviteOne, rejectOne, resetOne } from "../actions";
import styles from "./waitlist.module.css";

export const runtime = "nodejs";
// Always reflect the live list — never serve a cached snapshot of who applied.
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<WaitlistEntry["status"], string> = {
  pending: "Pending",
  invited: "Invited",
  rejected: "Rejected",
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function WaitlistAdminPage() {
  const admin = await getAdminUser();
  if (!admin) notFound();

  const db = createAdminClient();
  const { data, error } = await db
    .from("waitlist")
    .select(
      "id, name, email, country, stack, reason, locale, source, status, created_at",
    )
    .order("created_at", { ascending: false });

  const entries = (data ?? []) as WaitlistEntry[];
  const pending = entries.filter((e) => e.status === "pending").length;
  const invited = entries.filter((e) => e.status === "invited").length;
  const emailConfigured = serverEnv.resendApiKey !== null;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>Admin</p>
          <h1 className={styles.title}>Waitlist</h1>
          <p className={styles.subtitle}>
            {entries.length} total · {pending} pending · {invited} invited
          </p>
        </div>
        <form action={inviteAllPending}>
          <button
            type="submit"
            className={styles.primary}
            disabled={pending === 0}
          >
            Invite all pending ({pending})
          </button>
        </form>
      </header>

      {!emailConfigured && (
        <p className={styles.banner}>
          RESEND_API_KEY is not set — statuses still update, but no invite emails
          are sent. Copy the signup link manually until email is configured.
        </p>
      )}

      {error && (
        <p className={styles.bannerError}>
          Could not load the waitlist: {error.message}
        </p>
      )}

      {entries.length === 0 ? (
        <p className={styles.empty}>No applications yet.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Applied</th>
                <th>Name</th>
                <th>Email</th>
                <th>Country</th>
                <th>Stack</th>
                <th>Source</th>
                <th>Status</th>
                <th className={styles.actionsCol}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td className={styles.muted}>{formatDate(entry.created_at)}</td>
                  <td>{entry.name}</td>
                  <td>
                    <a className={styles.email} href={`mailto:${entry.email}`}>
                      {entry.email}
                    </a>
                  </td>
                  <td className={styles.muted}>{entry.country ?? "—"}</td>
                  <td className={styles.muted}>{entry.stack ?? "—"}</td>
                  <td className={styles.muted}>{entry.source ?? "—"}</td>
                  <td>
                    <span
                      className={`${styles.status} ${styles[`status_${entry.status}`]}`}
                    >
                      {STATUS_LABEL[entry.status]}
                    </span>
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      {entry.status !== "invited" && (
                        <form action={inviteOne}>
                          <input type="hidden" name="id" value={entry.id} />
                          <button type="submit" className={styles.invite}>
                            Invite
                          </button>
                        </form>
                      )}
                      {entry.status !== "rejected" && (
                        <form action={rejectOne}>
                          <input type="hidden" name="id" value={entry.id} />
                          <button type="submit" className={styles.reject}>
                            Reject
                          </button>
                        </form>
                      )}
                      {entry.status !== "pending" && (
                        <form action={resetOne}>
                          <input type="hidden" name="id" value={entry.id} />
                          <button type="submit" className={styles.ghost}>
                            Reset
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
