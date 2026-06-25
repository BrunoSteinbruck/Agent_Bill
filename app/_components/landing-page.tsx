"use client";

import Link from "next/link";
import { FormEvent, PointerEvent as ReactPointerEvent, ReactNode, useEffect, useRef, useState } from "react";
import { siteCopy, type TrustIcon } from "../site-content";
import styles from "./landing-page.module.css";

type Offset = { x: number; y: number };

// Line icons (Lucide-style, 24px grid) for the security/trust cards. They
// inherit the purple accent through `stroke="currentColor"` + the .glyph color.
const trustIcons: Record<TrustIcon, ReactNode> = {
  wallet: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  ),
  clean: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9.94 14.06 8.5 14.5l-6.14-1.58a.5.5 0 0 1 0-.96L8.5 9.94 9.94 8.5l1.58-6.14a.5.5 0 0 1 .96 0L14.06 8.5l1.44 1.44 6.14 1.58a.5.5 0 0 1 0 .96L15.5 14.5l-1.44 1.56-1.58 6.14a.5.5 0 0 1-.96 0Z" />
      <path d="M20 3v4M22 5h-4M4 17v2M5 18H3" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
};

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

  // Drag-to-rearrange the floating alert cards. Each card keeps an (x, y)
  // offset applied on top of its CSS corner position via a transform.
  const [offsets, setOffsets] = useState<Record<number, Offset>>({});
  const drag = useRef<{
    index: number;
    startX: number;
    startY: number;
    origin: Offset;
  } | null>(null);

  const handleCardPointerDown =
    (index: number) => (event: ReactPointerEvent<HTMLElement>) => {
      // Ignore drags that start on the action buttons.
      if ((event.target as HTMLElement).closest(`.${styles.acBtn}`)) return;
      event.preventDefault();
      drag.current = {
        index,
        startX: event.clientX,
        startY: event.clientY,
        origin: offsets[index] ?? { x: 0, y: 0 },
      };
      event.currentTarget.setPointerCapture(event.pointerId);
    };

  const handleCardPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d) return;
    const next: Offset = {
      x: d.origin.x + (event.clientX - d.startX),
      y: d.origin.y + (event.clientY - d.startY),
    };
    setOffsets((prev) => ({ ...prev, [d.index]: next }));
  };

  const handleCardPointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    if (drag.current) {
      event.currentTarget.releasePointerCapture(event.pointerId);
      drag.current = null;
    }
  };

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

          <div className={styles.heroVisual} id="preview">
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
                className={`${styles.alertCard} ${alertKindClass[alert.kind]} ${alertSlotClass[index]} ${styles.draggable}`}
                style={
                  offsets[index]
                    ? {
                        transform: `translate(${offsets[index].x}px, ${offsets[index].y}px)`,
                      }
                    : undefined
                }
                onPointerDown={handleCardPointerDown(index)}
                onPointerMove={handleCardPointerMove}
                onPointerUp={handleCardPointerUp}
                onPointerCancel={handleCardPointerUp}
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

      {/*
      FEATURES — kept as template, not rendered for now.
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

      SCENARIOS — kept as template, not rendered for now.
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
      */}

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
                  <span className={styles.glyph}>{trustIcons[item.icon]}</span>{" "}
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
