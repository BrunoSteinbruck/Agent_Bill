/**
 * Types for "Bill" — the agent that watches a user's virtual-card transactions.
 *
 * Bill is EVENT-DRIVEN, not a long-running process. It wakes on each Lithic
 * transaction event, is handed an `AgentContext` assembled from Supabase, and
 * returns an `AgentResult` describing what it thinks and what (if anything) the
 * app should do about it.
 *
 * NON-CUSTODIAL BOUNDARY: Bill never moves money and never touches the user's
 * wallet funds. Its only levers are card-level: it can *recommend* freezing the
 * card or cancelling a subscription renewal. The user always stays in control.
 *
 * All monetary amounts are integers in MINOR units (cents), matching the DB.
 */

import type { Card, Subscription, Transaction, UserRule } from "../supabase/types";

/** The transaction Bill is being asked to evaluate (the triggering event). */
export interface EvaluationTransaction {
  merchantName: string | null;
  descriptor: string | null;
  /** Minor units (cents). */
  amountCents: number;
  currency: string;
  isRecurring: boolean;
  /** Lithic-derived lifecycle state, e.g. "pending" | "settled". */
  status: Transaction["status"];
  /** ISO timestamp of when the charge occurred. */
  occurredAt: string;
}

/**
 * Everything Bill needs to reason about a single transaction. The caller (the
 * webhook handler) assembles this from Supabase before invoking the agent.
 */
export interface AgentContext {
  profile: {
    currency: string;
    country: string | null;
  };
  /** The card the charge hit, with its user-configured guardrails. */
  card: Pick<
    Card,
    | "currency"
    | "status"
    | "monthly_limit"
    | "new_merchant_cap"
    | "trusted_merchant_cap"
  >;
  transaction: EvaluationTransaction;
  /** The subscription this charge matches, if Bill's caller found one. */
  matchedSubscription: Subscription | null;
  /** Explicit user rules (merchant pattern → action). These override judgment. */
  rules: UserRule[];
  /** Spend already booked this billing cycle, minor units. */
  monthToDateSpendCents: number;
  /** A few recent transactions for pattern context, most recent first. */
  recentTransactions: Array<
    Pick<
      Transaction,
      | "merchant_name"
      | "amount"
      | "currency"
      | "status"
      | "is_recurring"
      | "occurred_at"
    >
  >;
}

/** Mirrors the `decision_type` enum in the database. */
export type AgentDecisionType = "approve" | "block" | "notify" | "review";

/**
 * A concrete card-level lever Bill can *recommend*. The app — or the user —
 * decides whether to act. Bill never moves wallet funds, so none of these touch
 * custody; they only affect the card and future renewals.
 */
export type RecommendedAction =
  | "none"
  | "freeze_card"
  | "flag_subscription"
  | "cancel_renewal";

/** The structured output Bill must return for every transaction. */
export interface AgentResult {
  decision: AgentDecisionType;
  /** Bill's rationale, for the audit log (agent_decisions.reasoning). */
  reasoning: string;
  /** 0..1 certainty. */
  confidence: number;
  /** A short, friendly note to the user. Null when decision is "approve". */
  userMessage: string | null;
  recommendedAction: RecommendedAction;
  /** The model that produced this decision (audit trail). */
  model: string;
}
