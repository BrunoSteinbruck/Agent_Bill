import Link from "next/link";
import {
  docsNavigation,
  getDocsNeighbors,
  type DocPage,
} from "../docs-content";
import styles from "./docs-shell.module.css";

type DocsShellProps = {
  page: DocPage;
};

export function DocsShell({ page }: DocsShellProps) {
  const { previous, next } = getDocsNeighbors(page.slug);

  return (
    <main className={styles.page}>
      <div className={styles.backgroundAura} />

      <header className={styles.topBar}>
        <Link className={styles.brand} href="/">
          <span className={styles.brandMark} aria-hidden="true">
            <img
              className={styles.brandMarkImage}
              src="/images/bill-favicon-max.png"
              alt=""
            />
          </span>
          <span className={styles.brandText}>
            <span className={styles.brandName}>Bill</span>
            <small>Project docs</small>
          </span>
        </Link>

        <div className={styles.topBarActions}>
          <span className={styles.topBarBadge}>EN only</span>
          <Link className={styles.backLink} href="/">
            Back to landing
          </Link>
        </div>
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          {docsNavigation.map((group) => (
            <section key={group.title} className={styles.sidebarGroup}>
              <h2>{group.title}</h2>
              <nav className={styles.sidebarNav}>
                {group.items.map((item) => {
                  const isActive = item.href === page.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={isActive ? styles.sidebarLinkActive : styles.sidebarLink}
                    >
                      {item.navLabel}
                    </Link>
                  );
                })}
              </nav>
            </section>
          ))}
        </aside>

        <article className={styles.article}>
          <div className={styles.breadcrumbs}>
            <Link href="/">Bill</Link>
            <span>/</span>
            <span>Docs</span>
            <span>/</span>
            <span>{page.group}</span>
          </div>

          <header className={styles.articleHeader}>
            <p className={styles.eyebrow}>{page.group}</p>
            <h1>{page.title}</h1>
            <p className={styles.deck}>{page.deck}</p>
          </header>

          <div className={styles.intro}>
            {page.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className={styles.content}>
            {page.sections.map((section) => (
              <section key={section.id} id={section.id} className={styles.docSection}>
                <h2>{section.title}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.bullets ? (
                  <ul className={styles.bulletList}>
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
                {section.callout ? <div className={styles.callout}>{section.callout}</div> : null}
              </section>
            ))}
          </div>

          <nav className={styles.pager}>
            {previous ? (
              <Link className={styles.pagerCard} href={previous.href}>
                <span>Previous</span>
                <strong>{previous.navLabel}</strong>
              </Link>
            ) : <div />}

            {next ? (
              <Link className={styles.pagerCard} href={next.href}>
                <span>Next</span>
                <strong>{next.navLabel}</strong>
              </Link>
            ) : <div />}
          </nav>
        </article>

        <aside className={styles.toc}>
          <div className={styles.tocCard}>
            <p>On this page</p>
            <nav className={styles.tocNav}>
              {page.sections.map((section) => (
                <a key={section.id} href={`#${section.id}`}>
                  {section.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>
      </div>
    </main>
  );
}
