/**
 * Bill's decision call.
 *
 * Given an assembled AgentContext, ask Claude for a structured approve / notify
 * / review / block decision. This runs on the transaction *event* (a webhook),
 * not in the synchronous card-authorization path, so it can afford to think.
 *
 * Design choices, per the project conventions:
 * - Model `claude-opus-4-7`.
 * - Adaptive thinking — Claude decides how much to reason about each charge.
 * - Structured outputs (`output_config.format`) so the reply is always a
 *   schema-valid decision object; no brittle free-text parsing.
 * - Prompt caching on the stable system prompt (the volatile per-transaction
 *   data lives in the user message, after the cache breakpoint).
 */

import Anthropic from "@anthropic-ai/sdk";
import { serverEnv } from "../env";
import { SYSTEM_PROMPT, buildContextMessage } from "./prompt";
import type {
  AgentContext,
  AgentDecisionType,
  AgentResult,
  RecommendedAction,
} from "./types";

export const AGENT_MODEL = "claude-opus-4-7";

let client: Anthropic | null = null;

function anthropic(): Anthropic {
  if (client) return client;
  client = new Anthropic({ apiKey: serverEnv.anthropicApiKey });
  return client;
}

/**
 * JSON schema for Bill's decision. With structured outputs in strict mode every
 * property must be listed in `required` and `additionalProperties` must be
 * false; nullable fields use a `["string", "null"]` union.
 */
const DECISION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    decision: {
      type: "string",
      enum: ["approve", "block", "notify", "review"],
      description: "What the app should do about this charge.",
    },
    reasoning: {
      type: "string",
      description: "One or two sentences explaining the call, for the audit log.",
    },
    confidence: {
      type: "number",
      minimum: 0,
      maximum: 1,
      description: "Certainty in the decision, 0 to 1.",
    },
    userMessage: {
      type: ["string", "null"],
      description:
        "Short friendly note to the user. Null only when decision is 'approve'.",
    },
    recommendedAction: {
      type: "string",
      enum: ["none", "freeze_card", "flag_subscription", "cancel_renewal"],
      description: "A card-level lever to recommend. 'none' unless warranted.",
    },
  },
  required: [
    "decision",
    "reasoning",
    "confidence",
    "userMessage",
    "recommendedAction",
  ],
} as const;

interface RawDecision {
  decision: AgentDecisionType;
  reasoning: string;
  confidence: number;
  userMessage: string | null;
  recommendedAction: RecommendedAction;
}

/**
 * A conservative fail-safe used when the model call errors or returns something
 * unusable. We surface to the user ("review") rather than silently approving —
 * failing safe means never auto-blessing a charge we couldn't actually judge.
 */
export function fallbackResult(reason: string): AgentResult {
  return {
    decision: "review",
    reasoning: `Bill could not evaluate this charge automatically (${reason}). Surfacing it for manual review.`,
    confidence: 0,
    userMessage:
      "I couldn't automatically review this charge, so I'm flagging it for you to check.",
    recommendedAction: "none",
    model: AGENT_MODEL,
  };
}

/** Run Bill over a single transaction. Throws on API/parse failure. */
export async function evaluate(context: AgentContext): Promise<AgentResult> {
  const message = await anthropic().messages.create({
    model: AGENT_MODEL,
    max_tokens: 4096,
    thinking: { type: "adaptive" },
    output_config: {
      format: {
        type: "json_schema",
        schema: DECISION_SCHEMA as unknown as Record<string, unknown>,
      },
    },
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        // Stable prefix → cache it. The per-transaction context that follows in
        // the user message is what varies, so the cache hits on every call.
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: buildContextMessage(context) }],
  });

  const text = message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();

  if (!text) {
    throw new Error("Bill returned no text content to parse.");
  }

  const raw = JSON.parse(text) as RawDecision;

  return {
    decision: raw.decision,
    reasoning: raw.reasoning,
    confidence: raw.confidence,
    userMessage: raw.userMessage,
    recommendedAction: raw.recommendedAction,
    model: AGENT_MODEL,
  };
}
