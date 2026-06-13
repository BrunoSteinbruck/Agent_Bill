"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { siteCopy } from "../site-content";
import styles from "./landing-page.module.css";

const brandImageSrc = "/images/bill-mark.png";
const dashboardImageSrc = "/images/dashboard-crop.png";

const alertKindClass = {
  warn: styles.acWarn,
  stop: styles.acStop,
  idle: styles.acIdle,
} as const;

const scenarioKindClass = {
  warn: styles.sWarn,
  stop: styles.sStop,
  idle: styles.sIdle,
} as const;

const alertSlotClass = [styles.c1, styles.c2, styles.c3] as const;

export function LandingPage() {
  const copy = siteCopy.en;

  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [source, setSource] = useState<string | null>(null);

  useEffect(() => {
    // Acquisition attribution: prefer utm_source, fall back to a ?ref= tag.
    const params = new URLSearchParams(window.location.search);
    setSource(params.get("utm_source") ?? params.get("ref"));
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setSubmitting(true);
    setSubmitError(false);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.get("email"),
          name: data.get("name"),
          // The lean design form swaps country/reason for a single spend band;
          // we store it in `stack` so the admin console still shows useful signal.
          stack: data.get("spend"),
          company: data.get("company"),
          locale: "en",
          source,
        }),
      });

      if (!response.ok) {
        throw new Error("waitlist submit failed");
      }

      form.reset();
      setSubmitted(true);
    } catch {
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* ============== NAV ============== */}
      <header className={styles.nav}>
        <div className={`${styles.wrap} ${styles.navInner}`}>
          <a className={styles.brand} href="#top" aria-label="Bill home">
            <img className={styles.mark} src={brandImageSrc} alt="" />
            <span>Bill</span>
          </a>
          <nav className={styles.navLinks}>
            {copy.nav.links.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
          <div className={styles.navRight}>
            <Link className={styles.login} href="/login">
              {copy.nav.signIn}
            </Link>
            <a className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`} href="#apply">
              {copy.nav.apply}
            </a>
          </div>
        </div>
      </header>

      {/* ============== HERO ============== */}
      <section className={styles.hero} id="top">
        <div className={styles.wrap}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>{copy.hero.eyebrow}</span>
            <h1 className={styles.heroTitle}>
              {copy.hero.titleTop}
              <br />
              {copy.hero.titleRest}
              <em>{copy.hero.titleEmphasis}</em>
            </h1>
            <p className={styles.heroSub}>{copy.hero.sub}</p>
            <div className={styles.heroCta}>
              <a className={`${styles.btn} ${styles.btnPrimary}`} href="#apply">
                {copy.hero.primaryCta} <span className={styles.arrow}>→</span>
              </a>
              <a className={`${styles.btn} ${styles.btnGhost}`} href="#how">
                {copy.hero.secondaryCta}
              </a>
            </div>
            <p className={styles.heroNote}>{copy.hero.note}</p>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.dashWindow}>
              <div className={styles.winBar}>
                <div className={styles.dots}>
                  <i />
                  <i />
                  <i />
                </div>
                <span className={styles.winTitle}>app.bill · dashboard</span>
              </div>
              <img
                className={styles.dashShot}
                src={dashboardImageSrc}
                alt="Bill dashboard — monthly spend and expenses"
              />
            </div>

            {copy.hero.alerts.map((alert, index) => (
              <article
                key={alert.title}
                className={`${styles.alertCard} ${alertKindClass[alert.kind]} ${alertSlotClass[index]}`}
              >
                <div className={styles.acTop}>
                  <span className={styles.acDot} />
                  <span className={styles.acLabel}>{alert.label}</span>
                  <span className={styles.acTime}>{alert.time}</span>
                </div>
                <h4>{alert.title}</h4>
                <div className={styles.acMeta}>
                  {alert.metaMain}
                  {alert.metaDim ? <span className={styles.dim}> · {alert.metaDim}</span> : null}
                </div>
                <p>{alert.body}</p>
                <div className={styles.acActions}>
                  <span
                    className={`${styles.acBtn} ${alert.primarySolid ? styles.solid : ""}`}
                  >
                    {alert.primaryAction}
                  </span>
                  <span className={styles.acBtn}>{alert.secondaryAction}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============== FEATURES ============== */}
      <section className={styles.section} id="features">
        <div className={styles.wrap}>
          <div className={styles.sectionHead}>
            <span className={styles.eyebrow}>{copy.features.eyebrow}</span>
            <h2 className={styles.sectionTitle}>
              {copy.features.titleTop}
              <br />
              {copy.features.titleBottom}
            </h2>
            <p className={styles.lead}>{copy.features.lead}</p>
          </div>
          <div className={styles.featuresGrid}>
            {copy.features.items.map((item) => (
              <div key={item.title} className={styles.feature}>
                <div className={styles.fIc}>
                  <span />
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== SCENARIOS ============== */}
      <section className={`${styles.section} ${styles.sectionTight}`} id="scenarios">
        <div className={styles.wrap}>
          <div className={styles.sectionHead}>
            <span className={styles.eyebrow}>{copy.scenarios.eyebrow}</span>
            <h2 className={styles.sectionTitle}>
              {copy.scenarios.titleTop}
              <br />
              {copy.scenarios.titleBottom}
            </h2>
          </div>
          <div className={styles.scnGrid}>
            {copy.scenarios.items.map((scn) => (
              <article key={scn.title} className={`${styles.scn} ${scenarioKindClass[scn.kind]}`}>
                <span className={styles.scnTag}>{scn.tag}</span>
                <h3>{scn.title}</h3>
                <p>{scn.text}</p>
                <div className={styles.scnFoot}>
                  <b>{scn.footStrong}</b> {scn.footRest}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============== HOW IT WORKS ============== */}
      <section className={styles.section} id="how">
        <div className={styles.wrap}>
          <div className={styles.sectionHead}>
            <span className={styles.eyebrow}>{copy.how.eyebrow}</span>
            <h2 className={styles.sectionTitle}>
              {copy.how.titleTop}
              <br />
              {copy.how.titleBottom}
            </h2>
            <p className={styles.lead}>{copy.how.lead}</p>
          </div>
          <div className={styles.steps}>
            {copy.how.steps.map((step) => (
              <div key={step.number} className={styles.step}>
                <span className={styles.stepN}>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== SECURITY / TRUST ============== */}
      <section className={`${styles.section} ${styles.infra}`} id="security">
        <div className={styles.wrap}>
          <div className={styles.sectionHead}>
            <span className={styles.eyebrow}>{copy.security.eyebrow}</span>
            <h2 className={styles.sectionTitle}>
              {copy.security.titleTop}
              <br />
              {copy.security.titleBottom}
            </h2>
          </div>
          <div className={styles.infraGrid}>
            {copy.security.items.map((item) => (
              <div key={item.title} className={styles.trust}>
                <h3>
                  <span className={styles.glyph}>
                    <i />
                  </span>{" "}
                  {item.title}
                </h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== APPLY ============== */}
      <section className={`${styles.section} ${styles.apply}`} id="apply">
        <div className={styles.wrap}>
          <div className={styles.applyCard}>
            <span className={styles.eyebrow}>{copy.apply.eyebrow}</span>
            <h2>{copy.apply.title}</h2>
            <p className={styles.lead}>{copy.apply.lead}</p>
            <form className={styles.applyForm} onSubmit={handleSubmit}>
              {/* Honeypot — hidden from humans, catches bots. Do not remove. */}
              <input
                className={styles.honeypot}
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />
              <input
                className={styles.field}
                type="email"
                name="email"
                placeholder={copy.apply.emailPlaceholder}
                autoComplete="email"
                required
              />
              <div className={styles.row}>
                <input
                  className={styles.field}
                  type="text"
                  name="name"
                  placeholder={copy.apply.namePlaceholder}
                  autoComplete="name"
                />
                <select
                  className={`${styles.field} ${styles.selectField}`}
                  name="spend"
                  defaultValue=""
                  aria-label={copy.apply.spendLabel}
                >
                  <option value="" disabled>
                    {copy.apply.spendLabel}
                  </option>
                  {copy.apply.spendOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </div>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                type="submit"
                disabled={submitting}
              >
                {copy.apply.submit}
              </button>
            </form>
            <p className={styles.applyFine}>{copy.apply.fine}</p>
            {submitted ? <p className={styles.formSuccess}>{copy.apply.success}</p> : null}
            {submitError ? <p className={styles.formError}>{copy.apply.error}</p> : null}
          </div>
        </div>
      </section>

      {/* ============== FOOTER ============== */}
      <footer className={styles.footer}>
        <div className={styles.wrap}>
          <div className={styles.footerTop}>
            <div className={styles.footerBrand}>
              <a className={styles.brand} href="#top">
                <img className={styles.mark} src={brandImageSrc} alt="" />
                <span>Bill</span>
              </a>
              <p>{copy.footer.blurb}</p>
            </div>
            <div className={styles.footerCols}>
              {copy.footer.columns.map((col) => (
                <div key={col.title} className={styles.fcol}>
                  <h5>{col.title}</h5>
                  {col.links.map((link, i) => (
                    <a key={`${link.label}-${i}`} href={link.href}>
                      {link.label}
                    </a>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className={styles.footerBottom}>
            <span>{copy.footer.copyright}</span>
            <span>{copy.footer.tagline}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
