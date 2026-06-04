/**
 * Provisioning — give a brand-new user the two things Bill needs to work:
 *
 *   1. A non-custodial wallet (Crossmint). The user owns it; Bill only ever
 *      reads its balance for funding context. We never move its funds.
 *   2. A virtual card (Lithic). This is what Bill watches and — only if the
 *      user wishes — freezes or limits. The user stays in control of the money.
 *
 * Runs once, at signup ("no cadastro"), but is written to be **idempotent**: we
 * gate every external call on whether we already persisted that resource for
 * the user. So a retry (or a second signup attempt) never double-issues a card
 * or spins up a second wallet — it just fills in whatever is missing.
 *
 * This uses the *admin* Supabase client (service role, bypasses RLS) because it
 * runs in a trusted server path and writes rows on behalf of the user. Every
 * query is explicitly scoped to `userId` so we never touch another user's data.
 */

import { createWallet } from "../crossmint/client";
import { issueVirtualCard } from "../lithic/client";
import { createAdminClient } from "../supabase/server";
import type { Card, Wallet } from "../supabase/types";

/** Spend posture a freshly issued card starts with (minor units / cents). */
const DEFAULT_MONTHLY_LIMIT_CENTS = 150_000; // $1,500
const DEFAULT_NEW_MERCHANT_CAP_CENTS = 3_500; // $35
const DEFAULT_TRUSTED_MERCHANT_CAP_CENTS = 15_000; // $150

export interface ProvisionResult {
  wallet: Pick<Wallet, "id" | "address" | "chain" | "crossmint_wallet_id">;
  card: Pick<Card, "id" | "lithic_card_token" | "last_four" | "status">;
  /** True when we created at least one resource on this call. */
  created: boolean;
}

/**
 * Ensure the user has a wallet and a card. Safe to call repeatedly.
 *
 * @param userId  The auth.users id (also the profiles primary key).
 * @param email   Used only as a human-readable memo on the card / wallet link.
 */
export async function ensureUserProvisioned(
  userId: string,
  email: string,
): Promise<ProvisionResult> {
  const db = createAdminClient();
  let created = false;

  // --- Wallet -------------------------------------------------------------
  const { data: existingWallet, error: walletReadErr } = await db
    .from("wallets")
    .select("id, address, chain, crossmint_wallet_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (walletReadErr) {
    throw new Error(`Wallet lookup failed: ${walletReadErr.message}`);
  }

  let wallet = existingWallet;
  if (!wallet) {
    const crossmintWallet = await createWallet({
      linkedUser: `userId:${userId}`,
    });

    const { data: insertedWallet, error: walletInsertErr } = await db
      .from("wallets")
      .insert({
        user_id: userId,
        crossmint_wallet_id: crossmintWallet.id,
        address: crossmintWallet.address,
        chain: crossmintWallet.chain,
      })
      .select("id, address, chain, crossmint_wallet_id")
      .single();

    if (walletInsertErr || !insertedWallet) {
      throw new Error(
        `Wallet insert failed: ${walletInsertErr?.message ?? "no row"}`,
      );
    }

    wallet = insertedWallet;
    created = true;
  }

  // --- Card ---------------------------------------------------------------
  const { data: existingCard, error: cardReadErr } = await db
    .from("cards")
    .select("id, lithic_card_token, last_four, status")
    .eq("user_id", userId)
    .maybeSingle();

  if (cardReadErr) {
    throw new Error(`Card lookup failed: ${cardReadErr.message}`);
  }

  let card = existingCard;
  if (!card) {
    const issued = await issueVirtualCard({
      memo: email,
      spendLimitCents: DEFAULT_MONTHLY_LIMIT_CENTS,
      spendLimitDuration: "MONTHLY",
    });

    const { data: insertedCard, error: cardInsertErr } = await db
      .from("cards")
      .insert({
        user_id: userId,
        lithic_card_token: issued.token,
        last_four: issued.lastFour,
        network: "Visa",
        status: "active",
        currency: "USD",
        monthly_limit: DEFAULT_MONTHLY_LIMIT_CENTS,
        new_merchant_cap: DEFAULT_NEW_MERCHANT_CAP_CENTS,
        trusted_merchant_cap: DEFAULT_TRUSTED_MERCHANT_CAP_CENTS,
      })
      .select("id, lithic_card_token, last_four, status")
      .single();

    if (cardInsertErr || !insertedCard) {
      throw new Error(
        `Card insert failed: ${cardInsertErr?.message ?? "no row"}`,
      );
    }

    card = insertedCard;
    created = true;
  }

  return { wallet, card, created };
}
