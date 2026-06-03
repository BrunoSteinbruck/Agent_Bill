/**
 * Lithic webhook → Bill.
 *
 * Lithic POSTs here on card transaction events. We verify the signature against
 * the raw body, pull the transaction out of the (possibly enveloped) event, and
 * hand it to the orchestrator, which runs Bill and records the decision.
 *
 * Always responds 200 for events we successfully process or safely ignore, and
 * 400 only when the signature is invalid (Lithic should not retry a forgery).
 * Unexpected server errors return 500 so Lithic retries delivery.
 */

import { verifyWebhook } from "../../../../lib/lithic/client";
import {
  processLithicTransaction,
  type LithicTransactionInput,
} from "../../../../lib/agent/orchestrator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Pull a transaction-shaped object out of whatever envelope Lithic sent. */
function extractTransaction(event: unknown): LithicTransactionInput | null {
  if (typeof event !== "object" || event === null) return null;

  const record = event as Record<string, unknown>;
  const candidate =
    "card_token" in record
      ? record
      : typeof record.payload === "object" && record.payload !== null
        ? (record.payload as Record<string, unknown>)
        : null;

  if (
    !candidate ||
    typeof candidate.token !== "string" ||
    typeof candidate.card_token !== "string" ||
    typeof candidate.amount !== "number" ||
    typeof candidate.status !== "string"
  ) {
    return null;
  }

  const merchant =
    typeof candidate.merchant === "object" && candidate.merchant !== null
      ? (candidate.merchant as LithicTransactionInput["merchant"])
      : null;

  return {
    token: candidate.token,
    card_token: candidate.card_token,
    amount: candidate.amount,
    status: candidate.status,
    created: typeof candidate.created === "string" ? candidate.created : null,
    merchant,
  };
}

export async function POST(request: Request): Promise<Response> {
  const rawBody = await request.text();
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  // 1. Verify the signature against the raw body. Invalid → 400, no retry.
  let event: unknown;
  try {
    event = verifyWebhook(rawBody, headers);
  } catch (err) {
    const message = err instanceof Error ? err.message : "invalid signature";
    return Response.json({ error: `Webhook verification failed: ${message}` }, {
      status: 400,
    });
  }

  // 2. Only transaction-shaped events are actionable; ack and ignore the rest.
  const txn = extractTransaction(event);
  if (!txn) {
    return Response.json({ handled: false, reason: "not_a_transaction_event" });
  }

  // 3. Run the pipeline. Unexpected failures → 500 so Lithic retries.
  try {
    const outcome = await processLithicTransaction(txn);
    return Response.json(outcome);
  } catch (err) {
    const message = err instanceof Error ? err.message : "processing error";
    return Response.json({ error: message }, { status: 500 });
  }
}
