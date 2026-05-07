import { settingsGroups } from "../mock-data";
import styles from "../product-app.module.css";

export default function SettingsPage() {
  return (
    <>
      <header className={styles.pageHeader}>
        <div>
          <h1>Settings</h1>
        </div>
      </header>

      <section className={styles.settingsGrid}>
        {settingsGroups.map((group) => (
          <article key={group.title} className={`${styles.panel} ${styles.settingsCard}`}>
            <p className={styles.panelEyebrow}>{group.title}</p>
            <div className={styles.settingsList}>
              {group.items.map((item) => (
                <div key={item.label} className={styles.settingsRow}>
                  <span className={styles.settingsLabel}>{item.label}</span>
                  <span className={styles.settingsValue}>{item.value}</span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
