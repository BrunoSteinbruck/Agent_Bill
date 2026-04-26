"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import styles from "../product-app.module.css";

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

const primaryItems: NavItem[] = [
  {
    href: "/app",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className={styles.icon} aria-hidden="true">
        <path
          d="M4.75 5.75h5.5v5.5h-5.5zm9 0h5.5v8h-5.5zm-9 9h5.5v4.5h-5.5zm9 2.5h5.5v2h-5.5z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/app/card",
    label: "Card",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className={styles.icon} aria-hidden="true">
        <rect
          x="3.75"
          y="6.25"
          width="16.5"
          height="11.5"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path d="M3.75 10.25h16.5" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
];

const utilityItems: NavItem[] = [
  {
    href: "/app/settings",
    label: "Settings",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className={styles.icon} aria-hidden="true">
        <path
          d="M12 8.75a3.25 3.25 0 1 0 0 6.5 3.25 3.25 0 0 0 0-6.5Z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M5.8 13.55a1.35 1.35 0 0 1 0-3.1l.63-.18a6.28 6.28 0 0 1 .67-1.62l-.34-.56a1.35 1.35 0 0 1 1.1-2.02l.66.03c.47-.42 1-.78 1.57-1.06l.23-.64a1.35 1.35 0 0 1 2.56 0l.23.64c.57.28 1.1.64 1.57 1.06l.66-.03a1.35 1.35 0 0 1 1.1 2.02l-.34.56c.3.5.53 1.04.67 1.62l.63.18a1.35 1.35 0 0 1 0 3.1l-.63.18a6.28 6.28 0 0 1-.67 1.62l.34.56a1.35 1.35 0 0 1-1.1 2.02l-.66-.03a6.3 6.3 0 0 1-1.57 1.06l-.23.64a1.35 1.35 0 0 1-2.56 0l-.23-.64a6.3 6.3 0 0 1-1.57-1.06l-.66.03a1.35 1.35 0 0 1-1.1-2.02l.34-.56a6.28 6.28 0 0 1-.67-1.62l-.63-.18Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/app") {
    return pathname === "/app";
  }

  return pathname.startsWith(href);
}

export function ProductShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className={styles.appTheme}>
      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarTop}>
            <Link className={styles.brandLink} href="/">
              <span className={styles.brandMark} aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" className={styles.icon}>
                  <path
                    d="M6.5 8.5c0-2.76 2.74-5 6.12-5 1.63 0 3.11.52 4.2 1.38.72.56 1.08 1.51.94 2.41l-.34 2.18c-.14.86-.79 1.55-1.63 1.75l-2.46.58c-.87.2-1.78.2-2.65 0l-2.46-.58a2.1 2.1 0 0 1-1.63-1.75L6.5 8.5Z"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8.25 13.1c.58.93 1.93 1.65 3.75 1.65s3.17-.72 3.75-1.65M9.15 17.75c.72.49 1.73.8 2.85.8 1.12 0 2.13-.31 2.85-.8"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span className={styles.brandText}>
                <span className={styles.brandName}>Bill</span>
                <span className={styles.brandMeta}>Governed card console</span>
              </span>
            </Link>

            <nav className={styles.navList} aria-label="Primary">
              {primaryItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navLink} ${
                    isActive(pathname, item.href) ? styles.navLinkActive : ""
                  }`}
                >
                  {item.icon}
                  <span className={styles.navLabel}>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className={styles.sidebarBottom}>
            <div className={styles.utilityList}>
              {utilityItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.utilityLink} ${
                    isActive(pathname, item.href) ? styles.utilityLinkActive : ""
                  }`}
                >
                  {item.icon}
                  <span className={styles.navLabel}>{item.label}</span>
                </Link>
              ))}
            </div>

            <div className={styles.currencySwitch} aria-label="Preferred currency">
              <span className={`${styles.currencyPill} ${styles.currencyPillActive}`}>USD</span>
              <span className={styles.currencyPill}>BRL</span>
              <span className={styles.currencyPill}>BTC</span>
            </div>

            <button type="button" className={styles.logoutButton}>
              <svg viewBox="0 0 24 24" fill="none" className={styles.icon} aria-hidden="true">
                <path
                  d="M10 6.25H7.75A2.75 2.75 0 0 0 5 9v6a2.75 2.75 0 0 0 2.75 2.75H10M14 8.25l3.75 3.75L14 15.75M17.5 12H9.25"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className={styles.navLabel}>Log out</span>
            </button>
          </div>
        </aside>

        <main className={styles.content}>
          <div className={styles.contentInner}>{children}</div>
        </main>
      </div>
    </div>
  );
}
