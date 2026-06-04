/**
 * Account data layer — turns the user's real Supabase rows into the view shapes
 * the dashboard / card / settings pages render.
 *
 * Everything here reads through the RLS-scoped server client, so a page only
 * ever sees the signed-in user's own data. Money is stored in minor units
 * (cents) and converted to whole-currency numbers here, because the UI's
 * formatter renders without decimals.
 *
 * Graceful degradation: a freshly-signed-up user whose provisioning hasn't
 * landed yet (no card row) gets the mock view so the product still looks alive
 * instead of rendering empty panels. Once real rows exist they take over.
 */

import {
  cardSummary as mockCard,
  controls as mockControls,
  dashboardSummary as mockDashboard,
  monthlySpending as mockMonthlySpending,
  settingsGroups as mockSettings,
  subscriptions as mockSubscriptions,
} from "../../app/app/mock-data";
import { getWalletBalances } from "../crossmint/client";
import { getAuthUser } from "../supabase/auth";
import type { SubscriptionStatus, TransactionStatus } from "../supabase/types";

const SPEND_COLOR = "#8b5cf6";
/** Statuses that count as money committed against the card this cycle. */
const SPENDING_STATUSES: TransactionStatus[] = ["pending", "approved", "settled"];

export interface SpendSegment {
  label: string;
  amount: number;
  color: string;
}

export interface MonthlySpend {
  month: string;
  total: number;
  segments: SpendSegment[];
}

export interface SubscriptionView {
  merchant: string;
  nextCharge: string;
  amount: number;
  maxAmount: number;
  usageScore: number | null;
  cyclesPaid: number;
  status: string;
}

export interface ControlView {
  label: string;
  value: string;
  note: string;
}

export interface AccountView {
  /** True when this view came from real data (not the mock fallback). */
  live: boolean;
  cardToken: string | null;
  dashboard: {
    monthLabel: string;
    monthlyCardSpend: number;
    spendableNow: number;
    history: { month: string; spend: number }[];
  };
  card: {
    label: string;
    holder: string;
    last4: string;
    network: string;
    status: string;
    spendableNow: number;
    walletLinkedValue: number;
    nextRenewal: string;
    nextRenewalAmount: number;
    monthlySpending: MonthlySpend[];
    subscriptions: SubscriptionView[];
    controls: ControlView[];
  };
  settings: { title: string; items: { label: string; value: string }[] }[];
}

const dollars = (cents: number): number => Math.round(cents) / 100;

function money(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(dollars(cents));
}

const LONG_MONTH = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});
const SHORT_MONTH = new Intl.DateTimeFormat("en-US", { month: "short" });
const DAY_MONTH = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
});

function cardStatusLabel(status: string): string {
  switch (status) {
    case "frozen":
      return "Frozen";
    case "terminated":
      return "Terminated";
    default:
      return "Active";
  }
}

function cardStateLabel(status: string): string {
  switch (status) {
    case "frozen":
      return "Frozen";
    case "terminated":
      return "Terminated";
    default:
      return "Unfrozen";
  }
}

function subscriptionStatusLabel(status: SubscriptionStatus): string {
  switch (status) {
    case "healthy":
      return "Healthy";
    case "observed":
      return "Observed";
    case "needs_review":
      return "Needs review";
    case "cancelled":
      return "Cancelled";
    default:
      return "Observed";
  }
}

/** The first day of each of the last `count` calendar months, oldest first. */
function monthWindow(count: number, now = new Date()): Date[] {
  const months: Date[] = [];
  for (let i = count - 1; i >= 0; i--) {
    months.push(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1)));
  }
  return months;
}

function sameMonth(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth()
  );
}

/** Assemble the mock-backed fallback view (used before provisioning lands). */
function mockView(): AccountView {
  return {
    live: false,
    cardToken: null,
    dashboard: {
      monthLabel: mockDashboard.monthLabel,
      monthlyCardSpend: mockDashboard.monthlyCardSpend,
      spendableNow: mockDashboard.spendableNow,
      history: mockDashboard.history.map((h) => ({
        month: h.month,
        spend: h.spend,
      })),
    },
    card: {
      label: mockCard.label,
      holder: mockCard.holder,
      last4: mockCard.last4,
      network: mockCard.network,
      status: mockCard.status,
      spendableNow: mockCard.spendableNow,
      walletLinkedValue: mockCard.walletLinkedValue,
      nextRenewal: mockCard.nextRenewal,
      nextRenewalAmount: mockCard.nextRenewalAmount,
      monthlySpending: mockMonthlySpending,
      subscriptions: mockSubscriptions.map((s) => ({
        merchant: s.merchant,
        nextCharge: s.nextCharge,
        amount: s.amount,
        maxAmount: s.maxAmount,
        usageScore: s.usageScore,
        cyclesPaid: s.cyclesPaid,
        status: s.status,
      })),
      controls: mockControls.map((c) => ({ ...c })),
    },
    settings: mockSettings.map((g) => ({
      title: g.title,
      items: g.items.map((i) => ({ ...i })),
    })),
  };
}

/**
 * Build the account view for the signed-in user. Falls back to the mock view
 * when there's no user or no provisioned card yet.
 */
export async function getAccountView(): Promise<AccountView> {
  const { supabase, user } = await getAuthUser();
  if (!user) return mockView();

  const [
    { data: profile },
    { data: card },
    { data: wallet },
    { data: subscriptions },
    { data: transactions },
  ] = await Promise.all([
    supabase.from("profiles").select("full_name, currency").eq("id", user.id).maybeSingle(),
    supabase
      .from("cards")
      .select(
        "lithic_card_token, last_four, network, status, currency, monthly_limit, new_merchant_cap, trusted_merchant_cap",
      )
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("wallets")
      .select("crossmint_wallet_id")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("next_charge_date", { ascending: true }),
    supabase
      .from("transactions")
      .select("amount, status, occurred_at")
      .eq("user_id", user.id)
      .order("occurred_at", { ascending: false })
      .limit(500),
  ]);

  // No card yet → provisioning hasn't completed. Keep the UI alive with mock.
  if (!card) return mockView();

  const currency = card.currency ?? profile?.currency ?? "USD";
  const holder = profile?.full_name ?? user.email ?? "Card holder";

  // --- Spend aggregation --------------------------------------------------
  const spendable = (transactions ?? []).filter((t) =>
    SPENDING_STATUSES.includes(t.status),
  );

  const window = monthWindow(4);
  const monthlyTotalsCents = window.map((monthStart) =>
    spendable
      .filter((t) => sameMonth(new Date(t.occurred_at), monthStart))
      .reduce((sum, t) => sum + t.amount, 0),
  );

  const currentMonthCents = monthlyTotalsCents[monthlyTotalsCents.length - 1] ?? 0;

  const monthlySpending: MonthlySpend[] = window.map((monthStart, i) => ({
    month: LONG_MONTH.format(monthStart),
    total: dollars(monthlyTotalsCents[i] ?? 0),
    segments: [
      { label: "Spend", amount: dollars(monthlyTotalsCents[i] ?? 0), color: SPEND_COLOR },
    ],
  }));

  const history = window.map((monthStart, i) => ({
    month: SHORT_MONTH.format(monthStart),
    spend: dollars(monthlyTotalsCents[i] ?? 0),
  }));

  // --- Wallet balance (best-effort; never blocks the page) ----------------
  let walletBalanceCents = 0;
  if (wallet?.crossmint_wallet_id) {
    try {
      const balances = await getWalletBalances(wallet.crossmint_wallet_id);
      const usdc = balances
        .filter((b) => b.token.toLowerCase() === "usdc")
        .reduce((sum, b) => sum + Number.parseFloat(b.amount || "0"), 0);
      walletBalanceCents = Math.round(usdc * 100);
    } catch (err) {
      console.error("Wallet balance fetch failed:", err);
    }
  }

  const monthlyLimitCents = card.monthly_limit ?? walletBalanceCents;
  const spendableNowCents = Math.max(0, monthlyLimitCents - currentMonthCents);

  // --- Subscriptions ------------------------------------------------------
  const subscriptionViews: SubscriptionView[] = (subscriptions ?? []).map((s) => {
    const maxCents = s.max_amount ?? s.suggested_max_amount ?? s.amount;
    return {
      merchant: s.merchant_name,
      nextCharge: s.next_charge_date
        ? DAY_MONTH.format(new Date(s.next_charge_date))
        : "—",
      amount: dollars(s.amount),
      maxAmount: dollars(maxCents),
      usageScore: s.usage_score,
      cyclesPaid: s.cycles_paid,
      status: subscriptionStatusLabel(s.status),
    };
  });

  const nextRenewal = (subscriptions ?? []).find((s) => s.next_charge_date) ?? null;

  // --- Card controls ------------------------------------------------------
  const controls: ControlView[] = [
    {
      label: "Monthly card limit",
      value: card.monthly_limit != null ? money(card.monthly_limit, currency) : "—",
      note: "Hard stop for total card spending in the active cycle.",
    },
    {
      label: "New merchant cap",
      value: card.new_merchant_cap != null ? money(card.new_merchant_cap, currency) : "—",
      note: "New merchants stay small until history and credibility improve.",
    },
    {
      label: "Trusted merchant cap",
      value:
        card.trusted_merchant_cap != null ? money(card.trusted_merchant_cap, currency) : "—",
      note: "Known recurring merchants can stay frictionless inside this band.",
    },
    {
      label: "Card state",
      value: cardStateLabel(card.status),
      note: "The card is live with active renewal rules.",
    },
  ];

  return {
    live: true,
    cardToken: card.lithic_card_token,
    dashboard: {
      monthLabel: LONG_MONTH.format(window[window.length - 1]),
      monthlyCardSpend: dollars(currentMonthCents),
      spendableNow: dollars(spendableNowCents),
      history,
    },
    card: {
      label: "Bill virtual card",
      holder,
      last4: card.last_four,
      network: card.network,
      status: cardStatusLabel(card.status),
      spendableNow: dollars(spendableNowCents),
      walletLinkedValue: dollars(walletBalanceCents),
      nextRenewal: nextRenewal?.next_charge_date
        ? DAY_MONTH.format(new Date(nextRenewal.next_charge_date))
        : "—",
      nextRenewalAmount: nextRenewal ? dollars(nextRenewal.amount) : 0,
      monthlySpending,
      subscriptions: subscriptionViews,
      controls,
    },
    settings: [
      {
        title: "Display",
        items: [
          { label: "Currency", value: currency },
          { label: "Language", value: "English" },
          { label: "Theme", value: "Obsidian purple" },
        ],
      },
      {
        title: "Notifications",
        items: [
          { label: "Price changes", value: "Immediate" },
          { label: "Funding suggestions", value: "Daily digest" },
          { label: "Subscription reviews", value: "7 days before renewal" },
        ],
      },
      {
        title: "Behavior",
        items: [
          { label: "New merchant posture", value: "Cautious" },
          { label: "Over-limit after 3 cycles", value: "Approve and alert" },
          { label: "Wallet movement", value: "Manual only" },
        ],
      },
    ],
  };
}
