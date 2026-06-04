import Link from "next/link";
import { signUp } from "../actions";
import styles from "../auth.module.css";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className={styles.screen}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <img className={styles.brandMark} src="/images/bill-favicon-max.png" alt="" />
          <span className={styles.brandName}>Bill</span>
        </div>

        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.subtitle}>
          We&apos;ll set up your wallet and virtual card automatically.
        </p>

        {error ? <p className={styles.error}>{error}</p> : null}

        <form className={styles.form} action={signUp}>
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
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          <button className={styles.submit} type="submit">
            Create account
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account?{" "}
          <Link className={styles.footerLink} href="/login">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
