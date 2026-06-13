import { getAccountView } from "../../../lib/data/account";
import { DemoBanner } from "../_components/demo-banner";
import styles from "../product-app.module.css";
import { CardActions } from "./_components/card-actions";
import { CardScreen } from "./_components/card-screen";

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function subscriptionTagClass(status: string): string {
  switch (status) {
    case "Needs review":
      return styles.tagpReview;
    case "Healthy":
      return styles.tagpHealthy;
    default:
      return styles.tagpObserved;
  }
}

/** Short month label for the bars: "January 2026" -> "January". */
function shortMonth(month: string): string {
  return month.replace(/\s+\d{4}$/, "");
}

const MS_BAR_MAX_PX = 120;

export default async function CardPage() {
  const { card, cardToken, live } = await getAccountView();
  const { monthlySpending, subscriptions, controls } = card;

  const maxTotal = Math.max(1, ...monthlySpending.map((m) => m.total));

  // Legend = the distinct spend segments present, in first-seen order. Mock data
  // carries the full Subscriptions/Tools/Travel/Ops breakdown; live data has a
  // single "Spend" segment — both render correctly from this.
  const legend: { label: string; color: string }[] = [];
  for (const month of monthlySpending) {
    for (const segment of month.segments) {
      if (!legend.some((l) => l.label === segment.label)) {
        legend.push({ label: segment.label, color: segment.color });
      }
    }
  }

  const cardRow = (
    <div className={styles.cardRow}>
      <div className={styles.vcard}>
        <div className={styles.vcTop}>
          <span className={styles.vcLabel}>{card.label}</span>
          <span className={styles.chip} aria-hidden="true" />
        </div>
        <div className={styles.vcNum}>
          ●●●● ●●●● ●●●● <b>{card.last4}</b>
        </div>
        <div className={styles.vcMeta}>
          <div className={styles.vcName}>{card.holder}</div>
          <div className={styles.vcBottom}>
            <span className={styles.vcBrand}>{card.network}</span>
            <span className={styles.vcActive}>{card.status}</span>
          </div>
        </div>
      </div>

      <div className={`${styles.card} ${styles.posture}`}>
        <span className={styles.cardLabel}>Card posture</span>
        <div className={styles.postureGrid}>
          <div>
            <div className={styles.pl}>Available balance</div>
            <div className={styles.pv}>{currency(card.spendableNow)}</div>
          </div>
          <div>
            <div className={styles.pl}>Total balance</div>
            <div className={styles.pv}>{currency(card.walletLinkedValue)}</div>
          </div>
          <div>
            <div className={styles.pl}>Next renewal</div>
            <div className={`${styles.pv} ${styles.pvDate}`}>{card.nextRenewal}</div>
          </div>
        </div>
      </div>
    </div>
  );

  const overview = (
    <>
      <div className={`${styles.card} ${styles.ms} ${styles.sectionGap}`}>
        <span className={styles.cardLabel}>Monthly spending</span>
        <div className={styles.msBars}>
          {monthlySpending.map((month) => (
            <div key={month.month} className={styles.mb}>
              <div
                className={styles.mbBar}
                style={{ height: `${Math.max(10, Math.round((month.total / maxTotal) * MS_BAR_MAX_PX))}px` }}
              />
              <span className={styles.mbL}>{shortMonth(month.month)}</span>
            </div>
          ))}
        </div>
        <div className={styles.msLegend}>
          {legend.map((item) => (
            <span key={item.label}>
              <i style={{ background: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
        <div className={styles.brk}>
          {monthlySpending
            .slice()
            .reverse()
            .map((month) => (
              <div key={month.month} className={styles.brkRow}>
                <div className={styles.bl}>
                  <b>{month.month}</b>
                  <p>
                    {month.segments
                      .map((segment) => `${segment.label} ${currency(segment.amount)}`)
                      .join(" · ")}
                  </p>
                </div>
                <div className={styles.ba}>{currency(month.total)}</div>
              </div>
            ))}
        </div>
      </div>

      <div className={`${styles.card} ${styles.subs} ${styles.sectionGap}`}>
        <div className={styles.subHead}>
          <span className={styles.cardLabel}>Subscriptions</span>
          <h3>Recurring merchants with per-subscription limits</h3>
        </div>
        {subscriptions.map((subscription) => (
          <div key={subscription.merchant} className={styles.subRow}>
            <div className={styles.sl}>
              <b>{subscription.merchant}</b>
              <p>
                Next charge {subscription.nextCharge} · {subscription.cyclesPaid} successful cycles
              </p>
            </div>
            <div className={styles.sr}>
              <span className={styles.amt}>{currency(subscription.amount)}</span>
              <span className={styles.max}>Max {currency(subscription.maxAmount)}</span>
              <span className={`${styles.tagp} ${subscriptionTagClass(subscription.status)}`}>
                {subscription.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  const controlsPanel = (
    <>
      <div className={styles.ctrlGrid}>
        {controls.map((control) => (
          <div key={control.label} className={`${styles.card} ${styles.ctrl}`}>
            <div className={styles.pl}>{control.label}</div>
            <div className={`${styles.pv} ${control.label === "Card state" ? styles.pvSmall : ""}`}>
              {control.value}
            </div>
          </div>
        ))}
      </div>

      <div className={`${styles.card} ${styles.actions}`}>
        <span className={styles.cardLabel}>Actions</span>
        <h3 className={styles.actionsTitle}>Manage live posture</h3>
        <CardActions cardToken={cardToken} frozen={card.status === "Frozen"} />
      </div>
    </>
  );

  return (
    <>
      {!live ? <DemoBanner /> : null}
      <CardScreen cardRow={cardRow} overview={overview} controls={controlsPanel} />
    </>
  );
}
