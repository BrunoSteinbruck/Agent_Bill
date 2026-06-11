import styles from "../product-app.module.css";

/**
 * Shown on dashboard/card pages when the account view is the mock fallback
 * (`AccountView.live === false`) — i.e. the user has no real card yet. Makes it
 * unmistakable that the numbers are illustrative, so nobody mistakes the demo
 * balance for real money.
 */
export function DemoBanner() {
  return (
    <div className={styles.demoBanner} role="status">
      <span className={styles.demoBannerTag}>Demo data</span>
      <span>
        These numbers are a preview. Your real card and balance appear here once
        your account is fully set up.
      </span>
    </div>
  );
}
