export type DocSection = {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
  callout?: string;
};

export type DocPage = {
  slug: string[];
  href: string;
  group: string;
  navLabel: string;
  title: string;
  deck: string;
  intro: string[];
  sections: DocSection[];
};

type DocNavGroup = {
  title: string;
  items: Array<Pick<DocPage, "href" | "navLabel">>;
};

const docsPages: DocPage[] = [
  {
    slug: ["intro"],
    href: "/docs/intro",
    group: "Overview",
    navLabel: "What is Bill?",
    title: "What is Bill?",
    deck:
      "Bill is a subscription assistant for governed recurring spend. It watches billing patterns, highlights the moments that deserve a decision, and stays quiet when behavior remains normal.",
    intro: [
      "Bill is designed for people who already manage money digitally, but do not want to manually monitor every subscription, every month, forever.",
      "The product story starts with subscription management, not infrastructure. The infrastructure matters, but it exists to support calm decisions around recurring spend.",
    ],
    sections: [
      {
        id: "why-bill",
        title: "Why start with subscriptions",
        paragraphs: [
          "Recurring spend is where silent drift happens. Prices increase, descriptors change, renewals keep firing, and people usually notice only after enough charges have accumulated.",
          "Bill turns that background noise into a small set of high-signal decisions: what changed, why it matters, and what action is available now.",
        ],
      },
      {
        id: "who-its-for",
        title: "Who Bill is for",
        paragraphs: [
          "The first audience is digitally fluent users with meaningful recurring digital spend and an interest in more modern payment rails.",
          "That includes stablecoin-curious users, early adopters of card-backed spending power, and people who simply want fewer surprise charges without living inside another finance dashboard.",
        ],
        bullets: [
          "People with recurring software, media, cloud, or creator subscriptions",
          "Users exploring stablecoin-backed spending",
          "Early adopters who value control without operational overhead",
        ],
      },
      {
        id: "v1-promise",
        title: "The V1 promise",
        paragraphs: [
          "Bill does not promise autonomous wallet movement in V1. The wallet remains user-controlled and the assistant focuses on governing the card layer.",
          "That means Bill can review changes, surface prompts, support rules, and improve decision quality without overclaiming custody or autonomous funding capabilities.",
        ],
        callout:
          "V1 is intentionally narrow: review recurring spend well, ask at the right moments, and keep custody in the user's hands.",
      },
    ],
  },
  {
    slug: ["features", "subscription-assistant"],
    href: "/docs/features/subscription-assistant",
    group: "Features",
    navLabel: "Subscription Assistant",
    title: "Subscription Assistant",
    deck:
      "Bill watches recurring spend for quiet drift, stale approvals, and changes that deserve a clear yes-or-no decision.",
    intro: [
      "The assistant layer exists to reduce mental load. Bill is not trying to create more dashboards or more tabs to check.",
      "Instead, it focuses on identifying recurring merchants, learning normal bands, and escalating only when the charge or merchant behavior stops looking routine.",
    ],
    sections: [
      {
        id: "price-drift",
        title: "Price increase detection",
        paragraphs: [
          "Bill compares each recurring charge against prior amounts, merchant history, and user-defined guardrails when those exist.",
          "If a trusted merchant suddenly charges above the user's normal band, Bill can present that price drift as a decision instead of letting it pass unnoticed.",
        ],
      },
      {
        id: "old-subscriptions",
        title: "Review prompts for long-running subscriptions",
        paragraphs: [
          "Some subscriptions are not fraudulent or unusual. They are simply old, unreviewed, and still pulling from the card month after month.",
          "Bill can surface these with context such as months active, recent prompts, and the next renewal moment so the user can renew intentionally or stop at the next cycle.",
        ],
      },
      {
        id: "abnormal-recurring",
        title: "Abnormal recurring charge handling",
        paragraphs: [
          "Recurring spend should not be treated as automatically safe. Descriptor changes, amount jumps, and unfamiliar timing can all signal something worth checking.",
          "Bill uses merchant history and charge patterns to distinguish quiet normal behavior from recurring behavior that should be blocked or reviewed.",
        ],
        bullets: [
          "Descriptor changed from the usual merchant pattern",
          "Amount drift moved outside the user's historical band",
          "A new recurring pattern appeared without prior trust",
        ],
      },
    ],
  },
  {
    slug: ["features", "decision-prompts"],
    href: "/docs/features/decision-prompts",
    group: "Features",
    navLabel: "Decision Prompts",
    title: "Decision Prompts",
    deck:
      "Bill uses concise prompts to bring recurring spend decisions back to the user with enough context to act quickly and calmly.",
    intro: [
      "The goal of a prompt is not to explain the entire system. It is to provide enough context for a confident decision in a low-friction channel.",
      "In the Bill V1 story, WhatsApp is a notification and decision surface. The app remains the system of record, but WhatsApp is where time-sensitive prompts can feel natural.",
    ],
    sections: [
      {
        id: "whatsapp-channel",
        title: "WhatsApp as a decision channel",
        paragraphs: [
          "Bill can use WhatsApp to notify the user that something changed and ask whether to approve, keep blocked, or revisit a subscription.",
          "This makes the experience feel immediate without forcing every decision to happen inside a full dashboard workflow.",
        ],
      },
      {
        id: "prompt-types",
        title: "Prompt types",
        paragraphs: [
          "Not every alert should feel identical. A price increase, a suspicious recurring attempt, and a stale subscription review each deserve different framing.",
          "Bill keeps prompts short, but still includes the merchant, the change, and the most relevant action choices for that moment.",
        ],
        bullets: [
          "Price drift: keep subscription or keep current rule",
          "Suspicious recurrence: keep blocked or allow once",
          "Long-running renewal: keep for a limited period or cancel at renewal",
        ],
      },
      {
        id: "quiet-by-default",
        title: "What stays quiet",
        paragraphs: [
          "Bill is built around balanced intervention. Trusted recurring behavior within expected bands should pass quietly so the product does not become another source of noise.",
          "The prompt layer matters because it is selective. Users should feel that if Bill surfaced something, it is probably worth looking at.",
        ],
        callout:
          "Good prompts are sparse. Bill should feel quiet most of the time and precise when it interrupts.",
      },
    ],
  },
  {
    slug: ["infrastructure"],
    href: "/docs/infrastructure",
    group: "Infrastructure",
    navLabel: "Infrastructure",
    title: "Infrastructure",
    deck:
      "Bill uses practical card and wallet rails to support the assistant experience without turning infrastructure into the headline.",
    intro: [
      "Infrastructure credibility matters because users need to trust the system around the assistant. But the infrastructure layer is a support beam, not the story itself.",
      "Bill is framed as stablecoin-first, wallet user-controlled, and aligned with the real issuance and authorization path under consideration.",
    ],
    sections: [
      {
        id: "wallet-control",
        title: "Wallet control model",
        paragraphs: [
          "V1 keeps the wallet user-controlled. Bill does not autonomously move funds and does not take custody.",
          "The agent governs card behavior and decision prompts, while the wallet remains the user's domain.",
        ],
      },
      {
        id: "issuance-path",
        title: "Card path and partners",
        paragraphs: [
          "The intended path stays aligned with Crossmint and Rain for wallet and card flow compatibility.",
          "This keeps the project grounded in a real operational model rather than a speculative placeholder stack.",
        ],
      },
      {
        id: "balanced-risk",
        title: "Balanced-risk decisioning",
        paragraphs: [
          "Bill does not aim for maximum friction or maximum permissiveness. It aims for balanced risk: approve normal recurring behavior, scrutinize meaningful changes, and block hard-rule or clearly suspicious events.",
          "That policy is what allows the assistant to feel calm rather than either reckless or constantly alarming.",
        ],
      },
    ],
  },
  {
    slug: ["v1-scope"],
    href: "/docs/v1-scope",
    group: "Infrastructure",
    navLabel: "V1 Scope",
    title: "V1 Scope",
    deck:
      "Bill V1 is intentionally narrow: govern subscription-related card behavior well, keep the wallet user-controlled, and avoid claiming automation that is not there yet.",
    intro: [
      "The project becomes stronger when the scope is honest. Bill V1 should solve one category of problem clearly before expanding into broader automation.",
      "This page summarizes what Bill can do now, what is only advisory, and what remains intentionally out of scope for the first version.",
    ],
    sections: [
      {
        id: "what-bill-does",
        title: "What Bill does in V1",
        paragraphs: [
          "Bill can identify recurring merchants, evaluate recurring amount drift, surface prompts for review, and support balanced-risk decisions on the card layer.",
          "It can also produce advisory funding suggestions based on expected obligations and available spending power.",
        ],
        bullets: [
          "Catch quiet subscription increases",
          "Block or review abnormal recurring charges",
          "Ask for renewal decisions when subscriptions become stale",
          "Suggest manual funding when projected obligations are approaching",
        ],
      },
      {
        id: "what-bill-does-not-do",
        title: "What Bill does not do yet",
        paragraphs: [
          "Bill V1 does not autonomously move funds from the wallet, does not claim full concierge cancellation workflows, and does not pretend to be a custody product.",
          "Those future capabilities may be explored later, but they are intentionally outside the promise of the first version.",
        ],
      },
      {
        id: "advisory-funding",
        title: "Funding remains advisory",
        paragraphs: [
          "Funding suggestions are part of the intelligence layer, not an execution layer. Bill can estimate future recurring obligations and recommend a manual top-up when needed.",
          "That keeps the product useful without crossing the line into autonomous wallet movement before the system is ready for it.",
        ],
        callout:
          "If Bill recommends funding in V1, it is a suggestion for the user to act on manually, not an automated transfer.",
      },
    ],
  },
];

export const docsNavigation: DocNavGroup[] = [
  {
    title: "What is Bill?",
    items: docsPages
      .filter((page) => page.group === "Overview")
      .map((page) => ({ href: page.href, navLabel: page.navLabel })),
  },
  {
    title: "Features",
    items: docsPages
      .filter((page) => page.group === "Features")
      .map((page) => ({ href: page.href, navLabel: page.navLabel })),
  },
  {
    title: "Infrastructure",
    items: docsPages
      .filter((page) => page.group === "Infrastructure")
      .map((page) => ({ href: page.href, navLabel: page.navLabel })),
  },
];

export function getDocsPageBySlug(slug: string[]): DocPage | undefined {
  const key = slug.join("/");
  return docsPages.find((page) => page.slug.join("/") === key);
}

export function getDocsNeighbors(slug: string[]) {
  const key = slug.join("/");
  const index = docsPages.findIndex((page) => page.slug.join("/") === key);

  if (index === -1) {
    return { previous: undefined, next: undefined };
  }

  return {
    previous: index > 0 ? docsPages[index - 1] : undefined,
    next: index < docsPages.length - 1 ? docsPages[index + 1] : undefined,
  };
}

export function getAllDocSlugs() {
  return docsPages.map((page) => ({ slug: page.slug }));
}
