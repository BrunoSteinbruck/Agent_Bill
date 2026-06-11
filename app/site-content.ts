export type LocaleCode = "en";

type SiteCopy = {
  ui: {
    brandDescriptor: string;
  };
  navigation: {
    problem: string;
    how: string;
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
  };
  problem: {
    kicker: string;
    title: string;
    items: Array<{ title: string; text: string }>;
  };
  how: {
    kicker: string;
    title: string;
    steps: Array<{ number: string; title: string; text: string }>;
  };
  control: {
    kicker: string;
    title: string;
    points: string[];
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
    },
    navigation: {
      problem: "Why Bill",
      how: "How it works",
      docs: "Docs",
      apply: "Apply",
    },
    hero: {
      eyebrow: "Calm control for recurring spend",
      title: "All your subscriptions.\nYour Agent looking for you.",
      description:
        "Bill watches every recurring charge and only reaches out when something needs you — a price jump, a forgotten plan, a charge that doesn't fit.",
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
    },
    problem: {
      kicker: "Why Bill",
      title: "Subscriptions drain you quietly.",
      items: [
        {
          title: "Silent price hikes",
          text: "A $9 plan slips to $14 and nothing flags it.",
        },
        {
          title: "Forgotten plans",
          text: "You keep paying for tools you stopped opening months ago.",
        },
        {
          title: "Charges that don't fit",
          text: "A recurring charge sneaks through that never matched your history.",
        },
      ],
    },
    how: {
      kicker: "How it works",
      title: "It watches, so you don't have to.",
      steps: [
        {
          number: "01",
          title: "Learns your normal",
          text: "Bill maps your recurring merchants, amounts, and renewal dates.",
        },
        {
          number: "02",
          title: "Watches every charge",
          text: "Each charge is checked against your history and your rules.",
        },
        {
          number: "03",
          title: "Asks only when it matters",
          text: "Normal spend passes quietly. Anything off comes to you with context.",
        },
      ],
    },
    control: {
      kicker: "Your money stays yours",
      title: "Bill never moves your money.",
      points: [
        "Non-custodial — you hold your own funds.",
        "Bill acts on the card, not your wallet.",
        "Every action waits for your yes.",
      ],
    },
    form: {
      kicker: "Apply for access",
      title: "Be one of the first.",
      description:
        "We're letting people in a few at a time. Tell us how you spend, and we'll reach out.",
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
        country: "United States, United Kingdom, ...",
        stack: "Apple Pay, bank transfer, card, stablecoins ...",
        reason: "What recurring spend do you want an agent to watch?",
      },
      submit: "Submit application",
      success:
        "Application received. We'll reach out as we open the next wave of access.",
      note: "No autonomous wallet movement. Ever.",
      asideTitle: "Who we're prioritizing",
      asideItems: [
        "People with real recurring digital spend",
        "Anyone tired of surprise charges and price creep",
        "Early adopters who want an agent, not another dashboard",
      ],
    },
    footer: {
      summary: "Bill — a calm agent for recurring spend.",
      rights: "Built for the V1 reality.",
    },
  },
};
