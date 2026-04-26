export type DashboardHistoryPoint = {
  month: string;
  funding: number;
  spend: number;
};

export type AlertTone = "positive" | "warning" | "neutral";

export const dashboardSummary = {
  monthLabel: "April 2026",
  monthlyCardSpend: 642,
  walletFundingTotal: 2860,
  spendableNow: 1180,
  projectedRenewals: 214,
  fundingCoverageDays: 18,
  topAlerts: [
    {
      title: "Adobe moved above its usual range",
      detail: "Next renewal is forecast at US$89, above your US$72 subscription limit.",
      tone: "warning" as const,
    },
    {
      title: "Funding is healthy for the next 18 days",
      detail: "Projected renewals remain covered with room for day-to-day card usage.",
      tone: "positive" as const,
    },
    {
      title: "Figma looks quiet",
      detail: "No recent usage was detected. Review before the April 29 renewal.",
      tone: "neutral" as const,
    },
  ],
  history: [
    { month: "Jan", funding: 2400, spend: 510 },
    { month: "Feb", funding: 2680, spend: 590 },
    { month: "Mar", funding: 2750, spend: 448 },
    { month: "Apr", funding: 2860, spend: 642 },
  ] satisfies DashboardHistoryPoint[],
};

export const cardSummary = {
  label: "Bill virtual card",
  holder: "Bruno Steinbruck",
  last4: "1836",
  network: "Visa",
  status: "Active",
  spendableNow: 1180,
  walletLinkedValue: 2860,
  nextRenewal: "Apr 29",
  nextRenewalAmount: 89,
};

export const spendingCategories = [
  { key: "subscriptions", label: "Subscriptions", amount: 252, color: "#27423a" },
  { key: "tools", label: "Tools", amount: 138, color: "#95aaa1" },
  { key: "travel", label: "Travel", amount: 144, color: "#688179" },
  { key: "ops", label: "Ops", amount: 108, color: "#cdd8d2" },
] as const;

export const monthlySpending = [
  {
    month: "January 2026",
    total: 488,
    segments: [
      { label: "Subscriptions", amount: 188, color: "#27423a" },
      { label: "Tools", amount: 110, color: "#95aaa1" },
      { label: "Travel", amount: 120, color: "#688179" },
      { label: "Ops", amount: 70, color: "#cdd8d2" },
    ],
  },
  {
    month: "February 2026",
    total: 612,
    segments: [
      { label: "Subscriptions", amount: 212, color: "#27423a" },
      { label: "Tools", amount: 170, color: "#95aaa1" },
      { label: "Travel", amount: 140, color: "#688179" },
      { label: "Ops", amount: 90, color: "#cdd8d2" },
    ],
  },
  {
    month: "March 2026",
    total: 448,
    segments: [
      { label: "Subscriptions", amount: 198, color: "#27423a" },
      { label: "Tools", amount: 104, color: "#95aaa1" },
      { label: "Travel", amount: 82, color: "#688179" },
      { label: "Ops", amount: 64, color: "#cdd8d2" },
    ],
  },
  {
    month: "April 2026",
    total: 642,
    segments: [
      { label: "Subscriptions", amount: 252, color: "#27423a" },
      { label: "Tools", amount: 138, color: "#95aaa1" },
      { label: "Travel", amount: 144, color: "#688179" },
      { label: "Ops", amount: 108, color: "#cdd8d2" },
    ],
  },
];

export const subscriptions = [
  {
    merchant: "Adobe Creative Cloud",
    nextCharge: "Apr 29",
    amount: 89,
    maxAmount: 72,
    cyclesPaid: 11,
    status: "Needs review",
  },
  {
    merchant: "Figma Professional",
    nextCharge: "May 03",
    amount: 19,
    maxAmount: 24,
    cyclesPaid: 8,
    status: "Observed",
  },
  {
    merchant: "Notion AI",
    nextCharge: "May 05",
    amount: 12,
    maxAmount: 18,
    cyclesPaid: 4,
    status: "Healthy",
  },
];

export const controls = [
  {
    label: "Monthly card limit",
    value: "US$1,500",
    note: "Hard stop for total card spending in the active cycle.",
  },
  {
    label: "New merchant cap",
    value: "US$35",
    note: "New merchants stay small until history and credibility improve.",
  },
  {
    label: "Trusted merchant cap",
    value: "US$150",
    note: "Known recurring merchants can stay frictionless inside this band.",
  },
  {
    label: "Card state",
    value: "Unfrozen",
    note: "The card is live and governed by balanced-risk rules.",
  },
];

export const settingsGroups = [
  {
    title: "Display",
    items: [
      { label: "Currency", value: "USD" },
      { label: "Language", value: "English" },
      { label: "Theme", value: "Paper green" },
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
];
