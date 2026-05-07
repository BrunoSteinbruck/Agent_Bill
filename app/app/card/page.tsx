import { cardSummary, controls, monthlySpending, subscriptions } from "../mock-data";
import styles from "../product-app.module.css";

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CardPage() {
  const maxSpend = Math.max(...monthlySpending.map((item) => item.total));

  return (
    <>
      <header className={styles.pageHeader}>
        <div>
          <h1>Card</h1>
        </div>

        <div className={styles.tabBar}>
          <a className={styles.tabLink} href="#overview">
            Overview
          </a>
          <a className={styles.tabLink} href="#spending">
            Spending
          </a>
          <a className={styles.tabLink} href="#subscriptions">
            Subscriptions
          </a>
          <a className={styles.tabLink} href="#controls">
            Controls
          </a>
        </div>
      </header>

      <div className={styles.sectionStack}>
        <section id="overview" className={styles.cardHero}>
          <article className={styles.cardVisual}>
            <div className={styles.cardVisualTop}>
              <span className={styles.cardVisualBrand}>Bill virtual card</span>
              <div className={styles.cardChip} aria-hidden="true" />
            </div>

            <p className={styles.cardNumber}>•••• •••• •••• {cardSummary.last4}</p>
            <p className={styles.cardHolder}>{cardSummary.holder}</p>

            <div className={styles.cardVisualBottom}>
              <span>{cardSummary.network}</span>
              <span>{cardSummary.status}</span>
            </div>
          </article>

          <article className={`${styles.panel} ${styles.panelSecondary}`}>
            <p className={styles.panelEyebrow}>Card posture</p>
            <div className={styles.infoGrid}>
              <div className={styles.infoCard}>
                <span className={styles.infoLabel}>Available balance</span>
                <strong className={styles.statValue}>{currency(cardSummary.spendableNow)}</strong>
              </div>
              <div className={styles.infoCard}>
                <span className={styles.infoLabel}>Total balance</span>
                <strong className={`${styles.statValue} ${styles.statValuePositive}`}>
                  {currency(cardSummary.walletLinkedValue)}
                </strong>
              </div>
              <div className={styles.infoCard}>
                <span className={styles.infoLabel}>Next renewal</span>
                <strong className={styles.statValue}>{cardSummary.nextRenewal}</strong>
              </div>
            </div>
          </article>
        </section>

        <section id="spending" className={`${styles.panel} ${styles.sectionStack}`}>
          <div>
            <p className={styles.panelEyebrow}>Monthly spending</p>
          </div>

          <div className={styles.stackedChart}>
            {monthlySpending.map((month) => (
              <div key={month.month} className={styles.stackedColumn}>
                <div className={styles.stackedBar}>
                  {month.segments.map((segment) => (
                    <div
                      key={segment.label}
                      className={styles.stackedSegment}
                      style={{
                        height: `${(segment.amount / maxSpend) * 100}%`,
                        background: segment.color,
                      }}
                    />
                  ))}
                </div>
                <span className={styles.chartMonth}>{month.month.replace(" 2026", "")}</span>
              </div>
            ))}
          </div>

          <div className={styles.tagList}>
            {monthlySpending[3].segments.map((segment) => (
              <span key={segment.label} className={styles.tagItem}>
                <span className={styles.tagSwatch} style={{ background: segment.color }} />
                {segment.label}
              </span>
            ))}
          </div>

          <div className={styles.sectionStack}>
            {monthlySpending
              .slice()
              .reverse()
              .map((month) => (
                <article key={month.month} className={styles.monthCard}>
                  <div className={styles.monthCardHeader}>
                    <strong className={styles.listTitle}>{month.month}</strong>
                    <span className={styles.listValue}>{currency(month.total)}</span>
                  </div>
                  <div className={styles.tagList}>
                    {month.segments.map((segment) => (
                      <span key={segment.label} className={styles.tagItem}>
                        <span className={styles.tagSwatch} style={{ background: segment.color }} />
                        {segment.label} {currency(segment.amount)}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
          </div>
        </section>

        <section id="subscriptions" className={`${styles.panel} ${styles.sectionStack}`}>
          <div>
            <p className={styles.panelEyebrow}>Subscriptions</p>
            <h2 className={styles.alertTitle}>Recurring merchants with per-subscription limits</h2>
          </div>

          <div className={styles.list}>
            {subscriptions.map((subscription) => (
              <article key={subscription.merchant} className={styles.listRow}>
                <div className={styles.listMeta}>
                  <h3 className={styles.listTitle}>{subscription.merchant}</h3>
                  <span className={styles.listSubtle}>
                    Next charge {subscription.nextCharge} · {subscription.cyclesPaid} successful
                    cycles
                  </span>
                </div>
                <span className={styles.listValue}>{currency(subscription.amount)}</span>
                <span className={styles.listSubtle}>Max {currency(subscription.maxAmount)}</span>
                <span
                  className={`${styles.statusPill} ${
                    subscription.status === "Healthy"
                      ? styles.statusHealthy
                      : subscription.status === "Observed"
                        ? styles.statusObserved
                        : styles.statusReview
                  }`}
                >
                  {subscription.status}
                </span>
              </article>
            ))}
          </div>
        </section>

        <section id="controls" className={styles.controlsGrid}>
          {controls.map((control) => (
            <article key={control.label} className={`${styles.panel} ${styles.settingsCard}`}>
              <p className={styles.panelEyebrow}>{control.label}</p>
              <p className={styles.controlValue}>{control.value}</p>
            </article>
          ))}

          <article className={`${styles.panel} ${styles.settingsCard}`}>
            <p className={styles.panelEyebrow}>Actions</p>
            <p className={styles.controlValue}>Manage live posture</p>
            <div className={styles.controlActions}>
              <button type="button" className={styles.primaryAction}>
                Review limits
              </button>
              <button type="button" className={styles.secondaryAction}>
                Freeze card
              </button>
            </div>
          </article>
        </section>
      </div>
    </>
  );
}
