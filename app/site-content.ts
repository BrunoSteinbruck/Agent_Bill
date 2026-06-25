export type LocaleCode = "en";

/** Icon keys for the security/trust cards; mapped to SVGs in the component. */
export type TrustIcon = "wallet" | "clean" | "shield";

type AlertCard = {
  /** Drives the accent color of the dot/label. */
  kind: "warn" | "stop" | "idle";
  label: string;
  time: string;
  title: string;
  /** Mono "ledger" line. `metaDim` renders muted, after a separator. */
  metaMain: string;
  metaDim?: string;
  body: string;
  primaryAction: string;
  secondaryAction: string;
  /** When true the primary action is the filled (accent) button. */
  primarySolid: boolean;
};

type Scenario = {
  kind: "warn" | "stop" | "idle";
  tag: string;
  title: string;
  text: string;
  footStrong: string;
  footRest: string;
};

type SiteCopy = {
  nav: {
    links: Array<{ label: string; href: string }>;
    signIn: string;
    apply: string;
  };
  hero: {
    eyebrow: string;
    titleTop: string;
    titleRest: string;
    titleEmphasis: string;
    sub: string;
    primaryCta: string;
    secondaryCta: string;
    note: string;
    alerts: AlertCard[];
  };
  // Commented out in the landing page for now (kept here as the template).
  features?: {
    eyebrow: string;
    titleTop: string;
    titleBottom: string;
    lead: string;
    items: Array<{ title: string; text: string }>;
  };
  scenarios?: {
    eyebrow: string;
    titleTop: string;
    titleBottom: string;
    items: Scenario[];
  };
  how: {
    eyebrow: string;
    titleTop: string;
    titleBottom: string;
    lead: string;
    steps: Array<{ number: string; title: string; text: string }>;
  };
  security: {
    eyebrow: string;
    titleTop: string;
    titleBottom: string;
    items: Array<{ title: string; text: string; icon: TrustIcon }>;
  };
  apply: {
    eyebrow: string;
    title: string;
    lead: string;
    emailPlaceholder: string;
    namePlaceholder: string;
    spendLabel: string;
    spendOptions: string[];
    submit: string;
    fine: string;
    success: string;
    error: string;
  };
  footer: {
    blurb: string;
    columns: Array<{ title: string; links: Array<{ label: string; href: string }> }>;
    copyright: string;
    tagline: string;
  };
};

export const siteCopy: Record<LocaleCode, SiteCopy> = {
  en: {
    nav: {
      links: [
        { label: "How it is", href: "#preview" },
        { label: "How it works", href: "#how" },
        { label: "Security", href: "#security" },
      ],
      signIn: "Sign in",
      apply: "Apply for access",
    },
    hero: {
      eyebrow: "Recurring-spend agent",
      titleTop: "Quiet watch on",
      titleRest: "every ",
      titleEmphasis: "charge.",
      sub: "Bill watches your virtual card for silent price hikes, charges that don't fit, and subscriptions you forgot.",
      primaryCta: "Apply for access",
      secondaryCta: "See how it works",
      note: "No card required to apply",
      alerts: [
        {
          kind: "warn",
          label: "Price change",
          time: "2m ago",
          title: "Notion raised your plan",
          metaMain: "$8.00 → $12.00 / mo",
          metaDim: "+50%",
          body: "Increased on your last renewal.",
          primaryAction: "Cancel",
          secondaryAction: "Keep",
          primarySolid: true,
        },
        {
          kind: "stop",
          label: "Charge held",
          time: "1h ago",
          title: "Unfamiliar charge stopped",
          metaMain: "GBL*DIGITAL · $89.90",
          body: "Doesn't match your usual merchants. Approve to let it through.",
          primaryAction: "Approve",
          secondaryAction: "Keep blocked",
          primarySolid: true,
        },    
        {
          kind: "idle",
          label: "Unused · 4mo",
          time: "Today",
          title: "Still paying for Adobe CC",
          metaMain: "$54.99 / mo",
          metaDim: "last used Feb",
          body: "No activity since February. Want to cancel it?",
          primaryAction: "Cancel",
          secondaryAction: "Keep",
          primarySolid: true,
        },
      ],
    },
    /*
    features: {
      
      eyebrow: "Less noise",
      titleTop: "Less monitoring,",
      titleBottom: "better decisions.",
      lead: "Bill does the watching so you don't have to.",
      items: [
        {
          title: "Speaks up only when it matters",
          text: "Normal spend stays silent. You hear from Bill when a charge breaks your pattern. Not before.",
        },
        {
          title: "Catches the silent stuff",
          text: "Creeping price hikes and renewals you forgot about, surfaced before they quietly hit your card.",
        },
        {
          title: "Recommends, never seizes",
          text: "Bill acts at the card level and always asks first. Your wallet stays yours, every step of the way.",
        },
      ],
    },
    
    scenarios: {
      eyebrow: "When Bill steps in",
      titleTop: "Three moments",
      titleBottom: "you won't have to catch.",
      items: [
        {
          kind: "warn",
          tag: "Price crept up",
          title: "The $8 app that's now $12",
          text: "A plan you've had for a year quietly raised its price. Bill flags the exact jump and offers a one-tap review.",
          footStrong: "+50%",
          footRest: "since the last renewal",
        },
        {
          kind: "stop",
          tag: "Charge looks wrong",
          title: "A merchant you don't recognize",
          text: "An unfamiliar name tries to pull $89.90. Bill holds it right at the card and waits for your call before anything moves.",
          footStrong: "Held",
          footRest: "· nothing left your wallet",
        },
        {
          kind: "idle",
          tag: "Forgotten subscription",
          title: "The one you stopped opening",
          text: "Four months without a single login, still billing every cycle. Bill surfaces it so you can cancel or keep — your choice.",
          footStrong: "$54.99/mo",
          footRest: "· last used in February",
        },
      ],
    },
    */
    how: {
      eyebrow: "How it works",
      titleTop: "Pattern in.",
      titleBottom: "Judgment out.",
      lead: "No dashboard to babysit. Bill works in the background and only reaches you when there's a real call to make.",
      steps: [
        {
          number: "01",
          title: "Detects patterns",
          text: "Bill learns what your recurring spend normally looks like across cards, merchants, and cycles.",
        },
        {
          number: "02",
          title: "Scores confidence & deviation",
          text: "Each charge is weighed for price drift, odd frequency, and how trustworthy the merchant is, based on your activity and every other user's.",
        },
        {
          number: "03",
          title: "Notifies or acts",
          text: "When something's off: Bill tells you, asks for a review, and recommends a next step.",
        },
      ],
    },
    security: {
      eyebrow: "Built to stay in your control",
      titleTop: "The agent acts.",
      titleBottom: "You stay in charge.",
      items: [
        {
          icon: "wallet",
          title: "Your wallet, your keys",
          text: "Bill never takes custody of your money. It works at the card level and only ever recommends actions, every other action is yours to confirm.",
        },
        {
          icon: "clean",
          title: "Clean amounts, no noise",
          text: "Settlement runs on a stablecoin stack underneath. On the surface you just see plain numbers — none of the technical detail.",
        },
        {
          icon: "shield",
          title: "Private by default",
          text: "Your spending stays yours. Bill reads only what it needs to watch your card, and never sells or shares your data.",
        },
      ],
    },
    apply: {
      eyebrow: "Early access",
      title: "Apply for access",
      lead: "We're onboarding a small group at a time. Tell us a little about your recurring spend and we'll be in touch.",
      emailPlaceholder: "Email address",
      namePlaceholder: "Name (optional)",
      spendLabel: "Monthly recurring spend",
      spendOptions: ["Under $50", "$50 – $200", "$200 – $1,000", "$1,000+"],
      submit: "Apply for access",
      fine: "No card required to apply · We'll never share your details",
      success: "Application received. We'll reach out as we open the next wave of access.",
      error: "We couldn't submit that just now. Please try again.",
    },
    footer: {
      blurb:
        "The calm watch over your recurring spend. Fewer surprises on the statement, without one more dashboard to check.",
      columns: [
        {
          title: "Product",
          links: [
            { label: "How it is", href: "#preview" },
            { label: "How it works", href: "#how" },
            { label: "Security", href: "#security" },
            { label: "Early access", href: "#apply" },
          ],
        },
        {
          title: "Company",
          links: [
            { label: "About", href: "#" },
            { label: "Careers", href: "#" },
            { label: "Contact", href: "#" },
          ],
        },
        {
          title: "Legal",
          links: [
            { label: "Privacy", href: "#" },
            { label: "Terms", href: "#" },
          ],
        },
      ],
      copyright: "© 2026 Bill",
      tagline: "A quiet watch on every charge",
    },
  },
};
