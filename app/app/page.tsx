import { getAccountView } from "../../lib/data/account";
import { DemoBanner } from "./_components/demo-banner";
import styles from "./product-app.module.css";

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

const BAR_MAX_PX = 210;

export default async function AppDashboardPage() {
  const { dashboard, live } = await getAccountView();
  const maxSpend = Math.max(1, ...dashboard.history.map((point) => point.spend));

  return (
    <>
      {!live ? <DemoBanner /> : null}

      <div className={styles.viewHead}>
        <h1>Dashboard</h1>
        <span className={styles.when}>
          <span className={styles.dot} aria-hidden="true" />
          {dashboard.monthLabel}
        </span>
      </div>

      <div className={styles.kpiRow}>
        <div className={`${styles.card} ${styles.kpi}`}>
          <span className={styles.cardLabel}>Monthly spend</span>
          <div className={styles.statNum}>{currency(dashboard.monthlyCardSpend)}</div>
        </div>
        <div className={`${styles.card} ${styles.kpi} ${styles.kpiTinted}`}>
          <span className={styles.cardLabel}>Spendable now</span>
          <div className={styles.statNum}>{currency(dashboard.spendableNow)}</div>
        </div>
      </div>

      <div className={`${styles.card} ${styles.chartCard}`}>
        <span className={styles.cardLabel}>Expenses</span>
        <div className={styles.bars}>
          {dashboard.history.map((point) => (
            <div key={point.month} className={styles.barCol}>
              <span className={styles.bval}>{currency(point.spend)}</span>
              <div
                className={styles.bar}
                style={{
                  height: `${Math.max(8, Math.round((point.spend / maxSpend) * BAR_MAX_PX))}px`,
                }}
              />
              <span className={styles.blabel}>{point.month}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
