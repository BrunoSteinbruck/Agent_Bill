export type LocaleCode = "en";

type SiteCopy = {
  ui: {
    brandDescriptor: string;
    localeLabel: string;
    v1Scope: string;
    updatingLanguage: string;
  };
  navigation: {
    features: string;
    infrastructure: string;
    docs: string;
    apply: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCta: string;
    supportEyebrow: string;
    supportRows: Array<{
      symbol: string;
      merchant: string;
      note: string;
      amount: string;
      time: string;
    }>;
    reviewCount: string;
    reviewEyebrow: string;
    reviewTitle: string;
    reviewDescription: string;
  };
  assistant: {
    kicker: string;
    title: string;
    description: string;
    items: Array<{ title: string; text: string }>;
  };
  scenarios: {
    kicker: string;
    title: string;
    description: string;
    items: Array<{
      tag: string;
      merchant: string;
      amount: string;
      message: string;
      context: string;
      primaryAction: string;
      secondaryAction: string;
    }>;
  };
  how: {
    kicker: string;
    title: string;
    description: string;
    steps: Array<{ number: string; title: string; text: string }>;
  };
  infrastructure: {
    kicker: string;
    title: string;
    description: string;
    bullets: string[];
    panelTitle: string;
    panelCopy: string;
    badges: string[];
    items: Array<{ title: string; text: string }>;
  };
  form: {
    kicker: string;
    title: string;
    description: string;
    fields: {
      name: string;
      email: string;
      country: string;
      stack: string;
      reason: string;
    };
    placeholders: {
      name: string;
      email: string;
      country: string;
      stack: string;
      reason: string;
    };
    submit: string;
    success: string;
    note: string;
    asideTitle: string;
    asideItems: string[];
  };
  footer: {
    summary: string;
    rights: string;
  };
};

export const siteCopy: Record<LocaleCode, SiteCopy> = {
  en: {
    ui: {
      brandDescriptor: "Your personal subscription agent",
      localeLabel: "Locale selector",
      v1Scope: "V1 scope",
      updatingLanguage: "Updating language...",
    },
    navigation: {
      features: "Features",
      infrastructure: "Infrastructure",
      docs: "Docs",
      apply: "Apply",
    },
    hero: {
      eyebrow: "Calm control for recurring spend",
      title: "All your subscriptions.\nYour Agent looking for you.",
      description: "An easier way to keep control of your subscriptions",
      primaryCta: "Apply for access",
      supportEyebrow: "Bill assistant notifications",
      supportRows: [
        {
          symbol: "A",
          merchant: "Adobe Creative Cloud Pro",
          note: "Price change detected",
          amount: "$71.00",
          time: "1 min ago",
        },
        {
          symbol: "N",
          merchant: "Netflixx",
          note: "Suspicious charge blocked",
          amount: "$69.00",
          time: "3 min ago",
        },
        {
          symbol: "D",
          merchant: "DaVinci Resolve",
          note: "9 months active",
          amount: "Review",
          time: "Today",
        },
      ],
      reviewCount: "3",
      reviewEyebrow: "Decision ready",
      reviewTitle: "Review recurring spend with context.",
      reviewDescription: "Price drift, anomalies, and renewals in one calm layer.",
    },
    assistant: {
      kicker: "Features",
      title: "Less monitoring. Better decisions at the moments that matter.",
      description:
        "Bill is not another dashboard asking for constant attention. It is a subscription assistant that stays quiet until recurring spend changes, drifts, or stops making sense.",
      items: [
        {
          title: "Catch quiet price increases",
          text: "Spot changes before they settle quietly into your monthly spend.",
        },
        {
          title: "Review old subscriptions",
          text: "Prompt for a decision when you have been paying for too long on autopilot.",
        },
        {
          title: "Flag abnormal recurring charges",
          text: "Block or review the charges that no longer fit the merchant or your pattern.",
        },
      ],
    },
    scenarios: {
      kicker: "Scenarios",
      title: "Concrete decisions, presented with calm instead of noise.",
      description:
        "Bill keeps recurring spend short and clear: what changed, why it matters, and what you can do next.",
      items: [
        {
          tag: "Price change detected",
          merchant: "Z Cloud",
          amount: "$24 -> $31",
          message:
            "Your plan increased above the range you usually approve for this merchant.",
          context: "Merchant trust is strong. Amount drift is not.",
          primaryAction: "Approve price",
          secondaryAction: "Keep current rule",
        },
        {
          tag: "Blocked as unusual",
          merchant: "Streamline Media",
          amount: "$89 attempt",
          message:
            "We blocked a recurring charge attempt that does not match your history for this merchant.",
          context: "Descriptor changed. Amount is outside your historical band.",
          primaryAction: "Keep blocked",
          secondaryAction: "Allow once",
        },
        {
          tag: "Time to review",
          merchant: "Design Vault",
          amount: "$19 / month",
          message:
            "You have been paying for this subscription for 9 months. Keep it or cancel at renewal?",
          context: "No recent approval prompt. Ongoing spend without a fresh decision.",
          primaryAction: "Keep for 30 days",
          secondaryAction: "Cancel at renewal",
        },
      ],
    },
    how: {
      kicker: "How it works",
      title: "Bill reviews recurring payments in three clear layers.",
      description:
        "The system stays quiet for normal behavior and only asks for attention when a merchant, amount, or pattern moves outside expectations.",
      steps: [
        {
          number: "01",
          title: "Detect billing patterns",
          text: "Recognize recurring merchants, descriptor patterns, amount bands, and renewal cadence.",
        },
        {
          number: "02",
          title: "Evaluate trust and drift",
          text: "Compare the charge against merchant history, your rules, and what usually happens.",
        },
        {
          number: "03",
          title: "Notify and suggest rules",
          text: "Send a clear prompt, a recommendation, or a quiet approval when behavior stays normal.",
        },
      ],
    },
    infrastructure: {
      kicker: "Infrastructure",
      title: "Control without surrender, built on practical rails.",
      description:
        "Bill is designed for the V1 reality: user-controlled funds, balanced-risk card decisions, and no autonomous wallet movement behind the scenes.",
      bullets: [
        "Your wallet stays user-controlled.",
        "The agent handles card spending, not custody.",
        "Funding suggestions stay advisory in V1.",
      ],
      panelTitle: "What Bill can do now",
      panelCopy:
        "Approve normal recurring behavior, hold suspicious changes, and bring important subscription decisions back to you with context.",
      badges: [
        "User-controlled wallet",
        "Balanced-risk approvals",
        "Funding suggestions only",
      ],
      items: [
        {
          title: "Crossmint + Rain path",
          text: "The planned card path stays aligned with the official wallet and issuance flow.",
        },
        {
          title: "Brazil-first rollout",
          text: "The first rollout stays local while the product language remains clear.",
        },
        {
          title: "Stablecoin-first stack",
          text: "Designed for modern spending rails without forcing protocol jargon into the product story.",
        },
        {
          title: "Balanced-risk decisioning",
          text: "Trusted recurring behavior should pass quietly. Unusual behavior should earn scrutiny.",
        },
      ],
    },
    form: {
      kicker: "Apply for access",
      title: "Early access is curated.",
      description:
        "Tell us how you pay today, how close you are to stablecoin spending, and where a subscription assistant would matter most.",
      fields: {
        name: "Name",
        email: "Email",
        country: "Country",
        stack: "Current payment stack",
        reason: "Why Bill now",
      },
      placeholders: {
        name: "Your name",
        email: "name@example.com",
        country: "Brazil, United States, ...",
        stack: "Apple Pay, bank transfer, card, stablecoins ...",
        reason: "What recurring spend do you want an assistant to watch?",
      },
      submit: "Submit application",
      success:
        "Application received. We will use it to shape the first wave of early access.",
      note: "No autonomous wallet movement is promised in V1.",
      asideTitle: "Who we are prioritizing",
      asideItems: [
        "Users with meaningful recurring digital spend",
        "People already testing stablecoin-backed spending",
        "Early adopters who want fewer surprise charges, not more dashboards",
      ],
    },
    footer: {
      summary: "Bill is a subscription assistant for recurring spend.",
      rights: "Designed for the V1 reality.",
    },
  },
};
