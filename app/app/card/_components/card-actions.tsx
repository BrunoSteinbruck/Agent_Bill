"use client";

/**
 * Live card controls. "Freeze"/"Unfreeze" hits the card-state route (which the
 * RLS layer scopes to the owner) and then refreshes the server-rendered page so
 * the new posture shows immediately. Acting on the card is the one thing Bill
 * does on the user's behalf — and only because the user clicked it.
 */

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "../../product-app.module.css";

export function CardActions({
  cardToken,
  frozen,
}: {
  cardToken: string | null;
  frozen: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disabled = !cardToken || pending;

  async function toggleFreeze() {
    if (!cardToken) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/cards/${encodeURIComponent(cardToken)}/state`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: frozen ? "OPEN" : "PAUSED" }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Could not update the card.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the card.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={styles.controlActions}>
      <a className={styles.primaryAction} href="#controls">
        Review limits
      </a>
      <button
        type="button"
        className={styles.secondaryAction}
        onClick={toggleFreeze}
        disabled={disabled}
      >
        {pending ? "Working…" : frozen ? "Unfreeze card" : "Freeze card"}
      </button>
      {error ? (
        <span role="alert" className={styles.actionError}>
          {error}
        </span>
      ) : null}
    </div>
  );
}
