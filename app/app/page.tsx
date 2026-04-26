import { dashboardSummary } from "./mock-data";
import styles from "./product-app.module.css";

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AppDashboardPage() {
  const maxHistoryValue = Math.max(
    ...dashboardSummary.history.flatMap((point) => [point.funding, point.spend]),
  );

  return (
    <>
      <header className={styles.pageHeader}>
        <div>
          <h1>Dashboard</h1>
          <p>Clean operating view for monthly spend, wallet funding, and high-signal alerts.</p>
        </div>

        <div className={styles.pageMeta}>
          <span className={styles.metaDot} aria-hidden="true" />
          <span>{dashboardSummary.monthLabel}</span>
        </div>
      </header>

      <section className={styles.summaryGrid}>
        <article className={styles.panel}>
          <p className={styles.panelEyebrow}>Monthly card spend</p>
          <p className={styles.heroValue}>{currency(dashboardSummary.monthlyCardSpend)}</p>
          <div className={styles.heroMeta}>
            <span>
              Projected renewals <strong>{currency(dashboardSummary.projectedRenewals)}</strong>
            </span>
            <span>
              Spendable now <strong>{currency(dashboardSummary.spendableNow)}</strong>
            </span>
          </div>
          <p className={styles.panelNote}>
            Settled card activity for the active month, with recurring renewals kept in view.
          </p>
        </article>

        <article className={`${styles.panel} ${styles.panelSecondary}`}>
          <p className={styles.panelEyebrow}>Wallet funding total</p>
          <p className={`${styles.statValue} ${styles.statValuePositive}`}>
            {currency(dashboardSummary.walletFundingTotal)}
          </p>
          <p className={styles.panelNote}>
            Current linked wallet value across the assets used to support card funding.
          </p>
        </article>

        <article className={`${styles.panel} ${styles.panelSecondary}`}>
          <p className={styles.panelEyebrow}>Funding runway</p>
          <p className={styles.statValue}>{dashboardSummary.fundingCoverageDays} days</p>
          <p className={styles.panelNote}>
            Estimated coverage based on expected renewals and recent card activity.
          </p>
        </article>
      </section>

      <section className={`${styles.panel} ${styles.chartPanel}`}>
        <div className={styles.pageHeader}>
          <div>
            <p className={styles.panelEyebrow}>Funding vs spend</p>
            <h1>Four-month view</h1>
          </div>
        </div>

        <div className={styles.chartFrame}>
          {dashboardSummary.history.map((point) => (
            <div key={point.month} className={styles.chartColumn}>
              <div className={styles.chartBars}>
                <div
                  className={styles.chartBar}
                  style={{ height: `${(point.funding / maxHistoryValue) * 100}%` }}
                  title={`Funding ${currency(point.funding)}`}
                />
                <div
                  className={`${styles.chartBar} ${styles.chartBarSpend}`}
                  style={{ height: `${(point.spend / maxHistoryValue) * 100}%` }}
                  title={`Spend ${currency(point.spend)}`}
                />
              </div>
              <span className={styles.chartMonth}>{point.month}</span>
            </div>
          ))}
        </div>

        <div className={styles.chartLegend}>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: "var(--chart-funding)" }} />
            Funding
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: "var(--chart-spend)" }} />
            Spend
          </span>
        </div>
      </section>

      <section className={styles.alertsGrid}>
        {dashboardSummary.topAlerts.map((alert) => (
          <article key={alert.title} className={`${styles.panel} ${styles.alertCard}`}>
            <span
              className={`${styles.alertTone} ${
                alert.tone === "positive"
                  ? styles.alertPositive
                  : alert.tone === "warning"
                    ? styles.alertWarning
                    : styles.alertNeutral
              }`}
            >
              {alert.tone === "positive"
                ? "Healthy"
                : alert.tone === "warning"
                  ? "Review"
                  : "Quiet"}
            </span>
            <h2 className={styles.alertTitle}>{alert.title}</h2>
            <p className={styles.alertDetail}>{alert.detail}</p>
          </article>
        ))}
      </section>
    </>
  );
}
