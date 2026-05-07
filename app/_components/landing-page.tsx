"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState, useTransition } from "react";
import { siteCopy, type LocaleCode } from "../site-content";
import styles from "./landing-page.module.css";

const storageKey = "bill-locale";
const heroImageSrc = "/images/subscription-scenarios-triptych.png";
const heroPosterSrc = "/images/hero-poster.webp";
const heroVideoMp4Src = "/videos/hero.mp4";
const heroVideoWebmSrc = "/videos/hero.webm";
const brandImageSrc = "/images/bill-favicon-max.png";
const scenarioImagePositions = ["14% center", "50% center", "86% center"] as const;
const featureMascotClasses = [
  "featureMascotSearch",
  "featureMascotNotebook",
  "featureMascotShield",
] as const;

function getBrowserLocale(): LocaleCode {
  if (typeof navigator === "undefined") {
    return "en";
  }

  const languages = navigator.languages ?? [navigator.language];
  return languages.some((language) => language.toLowerCase().startsWith("pt"))
    ? "pt"
    : "en";
}

export function LandingPage() {
  const [locale, setLocale] = useState<LocaleCode>("en");
  const [hasExplicitLocale, setHasExplicitLocale] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [shouldRenderHeroVideo, setShouldRenderHeroVideo] = useState(false);
  const [heroVideoFailed, setHeroVideoFailed] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const storedLocale = window.localStorage.getItem(storageKey);

    if (storedLocale === "en" || storedLocale === "pt") {
      setLocale(storedLocale);
      setHasExplicitLocale(true);
      return;
    }

    setLocale(getBrowserLocale());
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "pt" ? "pt-BR" : "en";

    if (hasExplicitLocale) {
      window.localStorage.setItem(storageKey, locale);
    }
  }, [hasExplicitLocale, locale]);

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

  const copy = siteCopy[locale];
  const showHeroVideo = shouldRenderHeroVideo && !heroVideoFailed;

  const handleLocaleChange = (nextLocale: LocaleCode) => {
    startTransition(() => {
      setLocale(nextLocale);
      setHasExplicitLocale(true);
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.currentTarget.reset();
    setSubmitted(true);
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
            <a href="#features">{copy.navigation.features}</a>
            <a href="#infrastructure">{copy.navigation.infrastructure}</a>
            <Link href="/docs/intro">{copy.navigation.docs}</Link>
          </nav>

          <div className={styles.headerActions}>
            <div className={styles.localeToggle} aria-label={copy.ui.localeLabel}>
              <button
                type="button"
                className={locale === "en" ? styles.localeActive : ""}
                aria-pressed={locale === "en"}
                onClick={() => handleLocaleChange("en")}
              >
                EN
              </button>
              <button
                type="button"
                className={locale === "pt" ? styles.localeActive : ""}
                aria-pressed={locale === "pt"}
                onClick={() => handleLocaleChange("pt")}
              >
                PT-BR
              </button>
            </div>

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

      <section id="features" className={styles.contentSection}>
        <div className={styles.sectionHeading}>
          <p className={styles.sectionKicker}>{copy.assistant.kicker}</p>
          <h2>{copy.assistant.title}</h2>
          <p>{copy.assistant.description}</p>
        </div>

        <div className={styles.featureGrid}>
          {copy.assistant.items.map((item, index) => (
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

        <div className={styles.sectionBlock}>
          <div className={styles.subsectionHeading}>
            <p className={styles.sectionKicker}>{copy.scenarios.kicker}</p>
            <h3>{copy.scenarios.title}</h3>
            <p>{copy.scenarios.description}</p>
          </div>

          <div className={styles.scenarioGrid}>
            {copy.scenarios.items.map((item, index) => (
              <article key={item.tag} className={styles.scenarioCard}>
                <div className={styles.scenarioImageFrame}>
                  <img
                    className={styles.scenarioImage}
                    src={heroImageSrc}
                    alt={item.tag}
                    style={{ objectPosition: scenarioImagePositions[index] }}
                  />
                </div>
                <div className={styles.scenarioTopline}>
                  <span>{item.tag}</span>
                  <strong>{item.amount}</strong>
                </div>
                <h3>{item.merchant}</h3>
                <p className={styles.scenarioMessage}>{item.message}</p>
                <p className={styles.scenarioContext}>{item.context}</p>
                <div className={styles.messageActions}>
                  <button type="button">{item.primaryAction}</button>
                  <button type="button">{item.secondaryAction}</button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className={styles.sectionBlock}>
          <div className={styles.subsectionHeading}>
            <p className={styles.sectionKicker}>{copy.how.kicker}</p>
            <h3>{copy.how.title}</h3>
            <p>{copy.how.description}</p>
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
        </div>
      </section>

      <section id="infrastructure" className={`${styles.contentSection} ${styles.infrastructureSection}`}>
        <div className={styles.sectionHeading}>
          <p className={styles.sectionKicker}>{copy.infrastructure.kicker}</p>
          <h2>{copy.infrastructure.title}</h2>
          <p>{copy.infrastructure.description}</p>
        </div>

        <div className={styles.infrastructureGrid}>
          <div className={styles.infrastructureLeadCard}>
            <div className={styles.cardHeader}>
              <span>{copy.infrastructure.panelTitle}</span>
              <div className={styles.headerPill}>{copy.ui.v1Scope}</div>
            </div>
            <p>{copy.infrastructure.panelCopy}</p>
            <ul className={styles.infrastructureList}>
              {copy.infrastructure.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
            <div className={styles.badgeRow}>
              {copy.infrastructure.badges.map((badge) => (
                <span key={badge}>{badge}</span>
              ))}
            </div>
          </div>

          <div className={styles.trustGrid}>
            {copy.infrastructure.items.map((item) => (
              <article key={item.title} className={styles.trustCard}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
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

          <button className={styles.primaryButton} type="submit">
            {copy.form.submit}
          </button>

          <p className={styles.formNote}>{copy.form.note}</p>
          {submitted ? <p className={styles.formSuccess}>{copy.form.success}</p> : null}
        </form>
      </section>

      <footer className={styles.footer}>
        <p>{copy.footer.summary}</p>
        <small>{copy.footer.rights}</small>
        {isPending ? <span className={styles.pendingHint}>{copy.ui.updatingLanguage}</span> : null}
      </footer>
    </main>
  );
}
