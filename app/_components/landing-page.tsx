"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { siteCopy } from "../site-content";
import styles from "./landing-page.module.css";

const heroPosterSrc = "/images/hero-poster.webp";
const heroVideoMp4Src = "/videos/hero.mp4";
const heroVideoWebmSrc = "/videos/hero.webm";
const brandImageSrc = "/images/bill-logo.png";
const featureMascotClasses = [
  "featureMascotSearch",
  "featureMascotNotebook",
  "featureMascotShield",
] as const;

export function LandingPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [shouldRenderHeroVideo, setShouldRenderHeroVideo] = useState(false);
  const [heroVideoFailed, setHeroVideoFailed] = useState(false);
  const [source, setSource] = useState<string | null>(null);

  useEffect(() => {
    // Acquisition attribution: prefer utm_source, fall back to a ?ref= tag.
    const params = new URLSearchParams(window.location.search);
    setSource(params.get("utm_source") ?? params.get("ref"));
  }, []);

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const syncHeroMotion = () => {
      const isDesktopViewport = window.innerWidth > 920;
      setShouldRenderHeroVideo(isDesktopViewport && !reducedMotionQuery.matches);
    };

    syncHeroMotion();

    reducedMotionQuery.addEventListener("change", syncHeroMotion);
    window.addEventListener("resize", syncHeroMotion);

    return () => {
      reducedMotionQuery.removeEventListener("change", syncHeroMotion);
      window.removeEventListener("resize", syncHeroMotion);
    };
  }, []);

  const copy = siteCopy.en;
  const showHeroVideo = shouldRenderHeroVideo && !heroVideoFailed;

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
          name: data.get("name"),
          email: data.get("email"),
          country: data.get("country"),
          stack: data.get("stack"),
          reason: data.get("reason"),
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
    <main className={styles.page}>
      <div className={styles.backgroundAura} />

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <a className={styles.brand} href="#top">
            <span className={styles.brandMark} aria-hidden="true">
              <img className={styles.brandMarkImage} src={brandImageSrc} alt="" />
            </span>
            <span className={styles.brandText}>
              <span className={styles.brandName}>Bill</span>
              <small>{copy.ui.brandDescriptor}</small>
            </span>
          </a>

          <nav className={styles.nav}>
            <a href="#problem">{copy.navigation.problem}</a>
            <a href="#how">{copy.navigation.how}</a>
            <Link href="/docs/intro">{copy.navigation.docs}</Link>
          </nav>

          <div className={styles.headerActions}>
            <a className={styles.headerCta} href="#apply">
              {copy.navigation.apply}
            </a>
          </div>
        </div>
      </header>

      <section id="top" className={styles.heroSection}>
        <div className={styles.heroMediaLayer} aria-hidden="true">
          <img className={styles.heroPoster} src={heroPosterSrc} alt="" />
          {showHeroVideo ? (
            <video
              className={styles.heroVideo}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster={heroPosterSrc}
              onError={() => setHeroVideoFailed(true)}
            >
              <source src={heroVideoWebmSrc} type="video/webm" />
              <source src={heroVideoMp4Src} type="video/mp4" />
            </video>
          ) : null}
        </div>

        <div className={styles.heroShade} />
        <div className={styles.heroGloss} />

        <div className={styles.heroLayout}>
          <div className={styles.heroCard}>
            <p className={styles.heroCardEyebrow}>{copy.hero.eyebrow}</p>
            <h1 className={styles.heroCardTitle}>{copy.hero.title}</h1>
            <p className={styles.heroCardDescription}>{copy.hero.description}</p>

            <div className={styles.heroActions}>
              <a className={styles.primaryButton} href="#apply">
                {copy.hero.primaryCta}
              </a>
            </div>
          </div>

          <div className={styles.heroSupportRail} aria-hidden="true">
            <div className={`${styles.heroSupportSlot} ${styles.heroSupportSlotTop}`}>
              <div className={`${styles.heroSupportCard} ${styles.heroMerchantCard}`}>
                <p className={styles.heroSupportEyebrow}>{copy.hero.supportEyebrow}</p>

                <div className={styles.heroMerchantStack}>
                  {copy.hero.supportRows.map((row) => (
                    <div key={row.merchant} className={styles.heroMerchantRow}>
                      <span className={styles.heroMerchantSymbol}>{row.symbol}</span>
                      <div className={styles.heroMerchantBody}>
                        <strong>{row.merchant}</strong>
                        <span>{row.note}</span>
                      </div>
                      <div className={styles.heroMerchantMeta}>
                        <strong>{row.amount}</strong>
                        <span>{row.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="problem" className={styles.contentSection}>
        <div className={styles.sectionHeading}>
          <p className={styles.sectionKicker}>{copy.problem.kicker}</p>
          <h2>{copy.problem.title}</h2>
        </div>

        <div className={styles.featureGrid}>
          {copy.problem.items.map((item, index) => (
            <article key={item.title} className={styles.featureCard}>
              <div className={styles.featureIcon} aria-hidden="true">
                <span
                  className={`${styles.featureMascot} ${styles[featureMascotClasses[index]]}`}
                />
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how" className={styles.contentSection}>
        <div className={styles.sectionHeading}>
          <p className={styles.sectionKicker}>{copy.how.kicker}</p>
          <h2>{copy.how.title}</h2>
        </div>

        <div className={styles.stepsGrid}>
          {copy.how.steps.map((step) => (
            <article key={step.number} className={styles.stepCard}>
              <span className={styles.stepNumber}>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="control"
        className={`${styles.contentSection} ${styles.infrastructureSection}`}
      >
        <div className={styles.sectionHeading}>
          <p className={styles.sectionKicker}>{copy.control.kicker}</p>
          <h2>{copy.control.title}</h2>
        </div>

        <div className={styles.trustGrid}>
          {copy.control.points.map((point) => (
            <article key={point} className={styles.trustCard}>
              <h3>{point}</h3>
            </article>
          ))}
        </div>
      </section>

      <section id="apply" className={`${styles.contentSection} ${styles.formSection}`}>
        <div className={styles.formIntro}>
          <p className={styles.sectionKicker}>{copy.form.kicker}</p>
          <h2>{copy.form.title}</h2>
          <p>{copy.form.description}</p>
          <div className={styles.formAside}>
            <h3>{copy.form.asideTitle}</h3>
            <ul>
              {copy.form.asideItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <form className={styles.applicationForm} onSubmit={handleSubmit}>
          {/* Honeypot — hidden from humans, catches bots. Do not remove. */}
          <input
            className={styles.honeypot}
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          <label>
            <span>{copy.form.fields.name}</span>
            <input name="name" placeholder={copy.form.placeholders.name} required />
          </label>

          <label>
            <span>{copy.form.fields.email}</span>
            <input
              name="email"
              type="email"
              placeholder={copy.form.placeholders.email}
              required
            />
          </label>

          <label>
            <span>{copy.form.fields.country}</span>
            <input name="country" placeholder={copy.form.placeholders.country} required />
          </label>

          <label>
            <span>{copy.form.fields.stack}</span>
            <input name="stack" placeholder={copy.form.placeholders.stack} required />
          </label>

          <label>
            <span>{copy.form.fields.reason}</span>
            <textarea
              name="reason"
              rows={5}
              placeholder={copy.form.placeholders.reason}
              required
            />
          </label>

          <button className={styles.primaryButton} type="submit" disabled={submitting}>
            {copy.form.submit}
          </button>

          <p className={styles.formNote}>{copy.form.note}</p>
          {submitted ? <p className={styles.formSuccess}>{copy.form.success}</p> : null}
          {submitError ? (
            <p className={styles.formNote}>
              We couldn&apos;t submit that just now. Please try again.
            </p>
          ) : null}
        </form>
      </section>

      <footer className={styles.footer}>
        <p>{copy.footer.summary}</p>
        <small>{copy.footer.rights}</small>
      </footer>
    </main>
  );
}
