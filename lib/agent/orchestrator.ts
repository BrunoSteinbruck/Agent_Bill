/**
 * Transaction → Bill → audit pipeline.
 *
 * Called by the Lithic webhook for each card transaction event. It mirrors the
 * charge into Supabase, assembles the context Bill needs, asks Bill for a
 * decision, and records that decision for the audit log and the app UI.
 *
 * IMPORTANT — this pipeline is ADVISORY. It never freezes a card or cancels a
 * subscription on its own. Bill may *recommend* a card action, but executing it
 * is left to the user (via the action routes), honoring the rule that the agent
 * only acts on the card "if the user wishes." The user stays in control of their
 * money and account at all times.
 */

import { createAdminClient } from "../supabase/server";
import type { TransactionStatus } from "../supabase/types";
import { evaluate, fallbackResult } from "./evaluate";
import type { AgentContext, AgentResult } from "./types";

/** The subset of a Lithic transaction this pipeline reads. */
export interface LithicTransactionInput {
  token: string;
  card_token: string;
  /** Settled/authorized amount, minor units (cents). */
  amount: number;
  status: string; // PENDING | SETTLED | DECLINED | VOIDED | EXPIRED
  created?: string | null;
  merchant?: {
    descriptor?: string | null;
    mcc?: string | null;
    city?: string | null;
    country?: string | null;
  } | null;
}

export interface OrchestratorOutcome {
  handled: boolean;
  reason?: string;
  transactionId?: string;
  decision?: AgentResult["decision"];
}

function mapStatus(lithicStatus: string): TransactionStatus {
  switch (lithicStatus.toUpperCase()) {
    case "PENDING":
      return "pending";
    case "SETTLED":
      return "settled";
    case "DECLINED":
      return "declined";
    case "VOIDED":
    case "EXPIRED":
      return "reversed";
    default:
      return "pending";
  }
}

/** Case-insensitive "does the descriptor look like this pattern" check. */
function descriptorMatches(
  descriptor: string | null,
  merchantName: string,
  pattern: string | null,
): boolean {
  const needle = (pattern ?? merchantName).trim().toLowerCase();
  if (!needle) return false;
  const hay = `${descriptor ?? ""} ${merchantName}`.toLowerCase();
  return hay.includes(needle);
}

function startOfMonthISO(now = new Date()): string {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

export async function processLithicTransaction(
  txn: LithicTransactionInput,
): Promise<OrchestratorOutcome> {
  const db = createAdminClient();

  // 1. Resolve the card → owning user. Unknown cards aren't ours; ack & skip.
  const { data: card, error: cardErr } = await db
    .from("cards")
    .select(
      "id, user_id, currency, status, monthly_limit, new_merchant_cap, trusted_merchant_cap",
    )
    .eq("lithic_card_token", txn.card_token)
    .maybeSingle();

  if (cardErr) throw new Error(`Card lookup failed: ${cardErr.message}`);
  if (!card) {
    return { handled: false, reason: "card_not_tracked" };
  }

  const userId = card.user_id;
  const descriptor = txn.merchant?.descriptor?.trim() || null;
  const merchantName = descriptor ?? "Unknown merchant";
  const occurredAt = txn.created ?? new Date().toISOString();
  const status = mapStatus(txn.status);

  // 2. Load profile (currency/country) for context.
  const { data: profile } = await db
    .from("profiles")
    .select("currency, country")
    .eq("id", userId)
    .maybeSingle();

  // 3. Find a matching subscription, if any.
  const { data: subscriptions } = await db
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId);

  const matchedSubscription =
    (subscriptions ?? []).find((s) =>
      descriptorMatches(descriptor, s.merchant_name, s.descriptor_pattern),
    ) ?? null;

  // 4. Has this merchant charged before? (recurring heuristic) Only meaningful
  // when we actually have a descriptor to match on.
  let priorCount = 0;
  if (descriptor) {
    const { count } = await db
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("descriptor", descriptor)
      .neq("lithic_transaction_token", txn.token);
    priorCount = count ?? 0;
  }

  const isRecurring = matchedSubscription !== null || priorCount > 0;

  // 5. Mirror the transaction (idempotent on the Lithic token).
  const { data: txRow, error: txErr } = await db
    .from("transactions")
    .upsert(
      {
        user_id: userId,
        card_id: card.id,
        subscription_id: matchedSubscription?.id ?? null,
        lithic_transaction_token: txn.token,
        merchant_name: merchantName,
        descriptor,
        amount: txn.amount,
        currency: card.currency,
        status,
        is_recurring: isRecurring,
        occurred_at: occurredAt,
      },
      { onConflict: "lithic_transaction_token" },
    )
    .select("id")
    .single();

  if (txErr || !txRow) {
    throw new Error(`Transaction upsert failed: ${txErr?.message ?? "no row"}`);
  }

  // 6. Month-to-date spend on this card (counts toward the monthly cap).
  const { data: mtdRows } = await db
    .from("transactions")
    .select("amount")
    .eq("card_id", card.id)
    .gte("occurred_at", startOfMonthISO())
    .in("status", ["pending", "approved", "settled"]);

  const monthToDateSpendCents = (mtdRows ?? []).reduce(
    (sum, r) => sum + r.amount,
    0,
  );

  // 7. Recent transactions + rules for context.
  const [{ data: recent }, { data: rules }] = await Promise.all([
    db
      .from("transactions")
      .select("merchant_name, amount, currency, status, is_recurring, occurred_at")
      .eq("user_id", userId)
      .order("occurred_at", { ascending: false })
      .limit(10),
    db.from("user_rules").select("*").eq("user_id", userId),
  ]);

  // 8. Ask Bill. Fail safe to "review" if the model call errors.
  const context: AgentContext = {
    profile: {
      currency: profile?.currency ?? card.currency,
      country: profile?.country ?? null,
    },
    card: {
      currency: card.currency,
      status: card.status,
      monthly_limit: card.monthly_limit,
      new_merchant_cap: card.new_merchant_cap,
      trusted_merchant_cap: card.trusted_merchant_cap,
    },
    transaction: {
      merchantName,
      descriptor,
      amountCents: txn.amount,
      currency: card.currency,
      isRecurring,
      status,
      occurredAt,
    },
    matchedSubscription,
    rules: rules ?? [],
    monthToDateSpendCents,
    recentTransactions: recent ?? [],
  };

  let result: AgentResult;
  try {
    result = await evaluate(context);
  } catch (err) {
    result = fallbackResult(err instanceof Error ? err.message : "unknown error");
  }

  // 9. Record the decision (audit log + what the app surfaces to the user).
  await db.from("agent_decisions").insert({
    user_id: userId,
    transaction_id: txRow.id,
    decision: result.decision,
    reasoning: result.reasoning,
    confidence: result.confidence,
    model: result.model,
    user_message: result.userMessage,
    recommended_action: result.recommendedAction,
  });

  return {
    handled: true,
    transactionId: txRow.id,
    decision: result.decision,
  };
}
