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
    ...dashboardSummary.history.map((point) => point.spend),
  );

  return (
    <>
      <header className={styles.pageHeader}>
        <div>
          <h1>Dashboard</h1>
        </div>

        <div className={styles.pageMeta}>
          <span className={styles.metaDot} aria-hidden="true" />
          <span>{dashboardSummary.monthLabel}</span>
        </div>
      </header>

      <section className={styles.summaryGrid}>
        <article className={styles.panel}>
          <p className={styles.panelEyebrow}>Monthly spend</p>
          <p className={styles.heroValue}>{currency(dashboardSummary.monthlyCardSpend)}</p>
        </article>

        <article className={`${styles.panel} ${styles.panelSecondary}`}>
          <p className={styles.panelEyebrow}>Spendable now</p>
          <p className={`${styles.statValue} ${styles.statValuePositive}`}>
            {currency(dashboardSummary.spendableNow)}
          </p>
        </article>
      </section>

      <section className={`${styles.panel} ${styles.chartPanel}`}>
        <div className={styles.pageHeader}>
          <div>
            <p className={styles.panelEyebrow}>Expenses</p>
          </div>
        </div>

        <div className={styles.chartFrame}>
          {dashboardSummary.history.map((point) => (
            <div key={point.month} className={styles.chartColumn}>
              <div className={styles.chartBars}>
                <span
                  className={styles.chartValue}
                  style={{ bottom: `calc(${(point.spend / maxHistoryValue) * 100}% + 0.7rem)` }}
                >
                  {currency(point.spend)}
                </span>
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

      </section>
    </>
  );
}
