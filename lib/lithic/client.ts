/**
 * Lithic — virtual card issuance + transaction stream.
 *
 * Start in `sandbox` (free, instant API key). When Rain access is approved you
 * swap this module's implementation for the Rain SDK; the rest of the app talks
 * only to the thin interface exported here, so nothing else changes.
 *
 * Docs: https://docs.lithic.com
 */

import Lithic from "lithic";
import { serverEnv } from "../env";

let singleton: Lithic | null = null;

export function lithic(): Lithic {
  if (singleton) return singleton;
  singleton = new Lithic({
    apiKey: serverEnv.lithicApiKey,
    environment: serverEnv.lithicEnvironment, // 'sandbox' | 'production'
  });
  return singleton;
}

export interface IssueCardParams {
  /** Memo shown in the Lithic dashboard, e.g. the user's email. */
  memo: string;
  /** Spend ceiling in minor units (cents). Optional — the agent also gates. */
  spendLimitCents?: number;
  /** 'MONTHLY' | 'TRANSACTION' | 'ANNUALLY' | 'FOREVER'. */
  spendLimitDuration?: "MONTHLY" | "TRANSACTION" | "ANNUALLY" | "FOREVER";
}

export interface IssuedCard {
  token: string;
  lastFour: string;
  state: string;
}

/** Create a single virtual card for a user. */
export async function issueVirtualCard(
  params: IssueCardParams,
): Promise<IssuedCard> {
  const card = await lithic().cards.create({
    type: "VIRTUAL",
    memo: params.memo,
    spend_limit: params.spendLimitCents,
    spend_limit_duration: params.spendLimitDuration ?? "MONTHLY",
  });

  return {
    token: card.token,
    lastFour: card.last_four,
    state: card.state,
  };
}

/** Freeze (PAUSED) / unfreeze (OPEN) / terminate (CLOSED) a card. */
export async function setCardState(
  cardToken: string,
  state: "OPEN" | "PAUSED" | "CLOSED",
): Promise<void> {
  await lithic().cards.update(cardToken, { state });
}

/** List recent transactions for a card. */
export async function listCardTransactions(cardToken: string) {
  const page = await lithic().transactions.list({ card_token: cardToken });
  return page.data;
}

/**
 * Verify + parse an inbound Lithic webhook. Throws if the signature is invalid.
 * `rawBody` MUST be the unparsed request body string.
 */
export function verifyWebhook(
  rawBody: string,
  headers: Record<string, string>,
) {
  return lithic().webhooks.unwrap(rawBody, headers, serverEnv.lithicWebhookSecret);
}
