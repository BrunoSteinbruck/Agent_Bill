/**
 * Waitlist invite emails, sent through Resend (https://resend.com).
 *
 * Design choice: email is a BEST-EFFORT side effect, never a gate. The source
 * of truth for "who's invited" is the `waitlist.status` column. So:
 *   - If RESEND_API_KEY is unset, `sendWaitlistInvite` returns `{ sent: false }`
 *     without throwing — the admin can still flip statuses and copy the signup
 *     link by hand. This keeps local/dev usable with zero email config.
 *   - A send failure is returned, not thrown, so a bad email never rolls back a
 *     status change the admin meant to make.
 *
 * The invite links to /signup with the address prefilled, so the person lands
 * exactly where they need to create the account they applied with.
 */

import { publicEnv, serverEnv } from "../env";

export interface InviteResult {
  sent: boolean;
  /** Present when sending was attempted and failed (or was skipped). */
  error?: string;
}

interface InviteCopy {
  subject: string;
  heading: string;
  body: string;
  cta: string;
  signoff: string;
}

function copyFor(locale: string | null, name: string | null): InviteCopy {
  const firstName = name?.split(/\s+/)[0]?.trim() || null;

  if (locale === "pt" || locale === "pt-BR") {
    return {
      subject: "Seu acesso ao Bill está liberado",
      heading: firstName ? `Oi, ${firstName}!` : "Boas notícias!",
      body: "Seu lugar na lista de espera do Bill foi liberado. Você já pode criar sua conta e configurar seu cartão e sua carteira — você mantém 100% do controle, o Bill só te ajuda a cuidar dos gastos.",
      cta: "Criar minha conta",
      signoff: "Até já,\nEquipe Bill",
    };
  }

  return {
    subject: "Your Bill access is ready",
    heading: firstName ? `Hi, ${firstName}!` : "Good news!",
    body: "Your spot on the Bill waitlist is open. You can create your account now and set up your card and wallet — you keep 100% of the control; Bill just helps you watch the spend.",
    cta: "Create my account",
    signoff: "See you soon,\nThe Bill team",
  };
}

function signupUrl(email: string): string {
  const url = new URL("/signup", publicEnv.appUrl);
  url.searchParams.set("email", email);
  return url.toString();
}

function renderHtml(copy: InviteCopy, link: string): string {
  const paragraphs = copy.signoff
    .split("\n")
    .map((line) => `<p style="margin:0;color:#a7a3b3;">${escapeHtml(line)}</p>`)
    .join("");

  return `<!doctype html>
<html>
  <body style="margin:0;background:#0b0814;padding:32px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#14101f;border:1px solid #2a2438;border-radius:12px;padding:32px;">
            <tr><td style="color:#f4f2f8;font-size:20px;font-weight:700;padding-bottom:12px;">${escapeHtml(copy.heading)}</td></tr>
            <tr><td style="color:#c9c5d6;font-size:15px;line-height:1.6;padding-bottom:24px;">${escapeHtml(copy.body)}</td></tr>
            <tr>
              <td style="padding-bottom:24px;">
                <a href="${escapeHtml(link)}" style="display:inline-block;background:#8b5cf6;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:8px;">${escapeHtml(copy.cta)}</a>
              </td>
            </tr>
            <tr><td style="color:#6f6a80;font-size:13px;line-height:1.6;padding-bottom:20px;word-break:break-all;">${escapeHtml(link)}</td></tr>
            <tr><td style="border-top:1px solid #2a2438;padding-top:20px;">${paragraphs}</td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function renderText(copy: InviteCopy, link: string): string {
  return `${copy.heading}\n\n${copy.body}\n\n${copy.cta}: ${link}\n\n${copy.signoff}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Send the "you're in" invite. Returns `{ sent }` rather than throwing so the
 * caller (an admin action) can flip status regardless of email delivery.
 */
export async function sendWaitlistInvite(params: {
  email: string;
  name: string | null;
  locale: string | null;
}): Promise<InviteResult> {
  const apiKey = serverEnv.resendApiKey;
  if (!apiKey) {
    return { sent: false, error: "RESEND_API_KEY not configured." };
  }

  const copy = copyFor(params.locale, params.name);
  const link = signupUrl(params.email);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: serverEnv.waitlistFromEmail,
        to: [params.email],
        subject: copy.subject,
        html: renderHtml(copy, link),
        text: renderText(copy, link),
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      return { sent: false, error: `Resend ${res.status}: ${detail}` };
    }

    return { sent: true };
  } catch (err) {
    return { sent: false, error: err instanceof Error ? err.message : String(err) };
  }
}
