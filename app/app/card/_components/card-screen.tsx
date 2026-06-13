"use client";

/**
 * Card screen tab shell. The virtual card + posture stay fixed at the top; the
 * Overview / Controls tabs swap only the panel below. Both panels are rendered
 * on the server and handed in as props — this client component just toggles
 * which one is visible.
 */

import { ReactNode, useState } from "react";
import styles from "../../product-app.module.css";

type Tab = "overview" | "controls";

export function CardScreen({
  cardRow,
  overview,
  controls,
}: {
  cardRow: ReactNode;
  overview: ReactNode;
  controls: ReactNode;
}) {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <>
      <div className={styles.viewHead}>
        <h1>Card</h1>
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${tab === "overview" ? styles.tabOn : ""}`}
            onClick={() => setTab("overview")}
          >
            Overview
          </button>
          <button
            type="button"
            className={`${styles.tab} ${tab === "controls" ? styles.tabOn : ""}`}
            onClick={() => setTab("controls")}
          >
            Controls
          </button>
        </div>
      </div>

      {cardRow}

      {tab === "overview" ? overview : controls}
    </>
  );
}
