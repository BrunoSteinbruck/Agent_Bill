import Link from "next/link";
import { signIn } from "../actions";
import styles from "../auth.module.css";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; check?: string }>;
}) {
  const { error, check } = await searchParams;

  return (
    <main className={styles.screen}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <img className={styles.brandMark} src="/images/bill-favicon-max.png" alt="" />
          <span className={styles.brandName}>Bill</span>
        </div>

        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Sign in to your card and wallet dashboard.</p>

        {check === "email" ? (
          <p className={styles.notice}>
            Confirme seu e-mail para ativar a conta, depois faça login.
          </p>
        ) : null}
        {error ? <p className={styles.error}>{error}</p> : null}

        <form className={styles.form} action={signIn}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              Email
            </label>
            <input
              className={styles.input}
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <input
              className={styles.input}
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          <button className={styles.submit} type="submit">
            Sign in
          </button>
        </form>

        <p className={styles.footer}>
          Don&apos;t have an account?{" "}
          <Link className={styles.footerLink} href="/signup">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
