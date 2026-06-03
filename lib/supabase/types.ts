/**
 * Database types — hand-written to match supabase/migrations/0001_initial_schema.sql.
 *
 * Once the schema is live you can regenerate this with:
 *   npx supabase gen types typescript --project-id <id> > lib/supabase/types.ts
 */

export type CardStatus = "active" | "frozen" | "terminated";
export type SubscriptionStatus =
  | "healthy"
  | "observed"
  | "needs_review"
  | "cancelled";
export type TransactionStatus =
  | "pending"
  | "approved"
  | "declined"
  | "settled"
  | "reversed";
export type DecisionType = "approve" | "block" | "notify" | "review";
export type RuleAction = "approve" | "block" | "notify";
export type RecommendedAction =
  | "none"
  | "freeze_card"
  | "flag_subscription"
  | "cancel_renewal";

type Timestamps = { created_at: string; updated_at: string };

// NOTE: these row shapes are declared as `type` aliases (not `interface`) on
// purpose. supabase-js requires each table's Row/Insert/Update to be assignable
// to `Record<string, unknown>`, and TypeScript only treats object *type aliases*
// — not interfaces — as satisfying an index signature. Using `interface` here
// silently collapses every typed query to `never`.
export type Profile = Timestamps & {
  id: string;
  full_name: string | null;
  country: string | null;
  currency: string;
};

export type Wallet = Timestamps & {
  id: string;
  user_id: string;
  crossmint_wallet_id: string;
  address: string;
  chain: string;
};

export type Card = Timestamps & {
  id: string;
  user_id: string;
  lithic_card_token: string;
  last_four: string;
  network: string;
  status: CardStatus;
  currency: string;
  monthly_limit: number | null;
  new_merchant_cap: number | null;
  trusted_merchant_cap: number | null;
};

export type Subscription = Timestamps & {
  id: string;
  user_id: string;
  merchant_name: string;
  descriptor_pattern: string | null;
  amount: number;
  max_amount: number | null;
  suggested_max_amount: number | null;
  currency: string;
  next_charge_date: string | null;
  cycles_paid: number;
  usage_score: number | null;
  status: SubscriptionStatus;
};

export type UserRule = Timestamps & {
  id: string;
  user_id: string;
  merchant_pattern: string;
  action: RuleAction;
  threshold_amount: number | null;
  note: string | null;
};

export type Transaction = {
  id: string;
  user_id: string;
  card_id: string | null;
  subscription_id: string | null;
  lithic_transaction_token: string;
  merchant_name: string | null;
  descriptor: string | null;
  amount: number;
  currency: string;
  status: TransactionStatus;
  is_recurring: boolean;
  occurred_at: string;
  created_at: string;
};

export type AgentDecision = {
  id: string;
  user_id: string;
  transaction_id: string | null;
  decision: DecisionType;
  reasoning: string | null;
  confidence: number | null;
  model: string | null;
  user_message: string | null;
  recommended_action: RecommendedAction;
  created_at: string;
};

/**
 * Minimal shape compatible with supabase-js generics. Each table lists Row /
 * Insert / Update; Insert makes server-defaulted columns optional.
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Timestamps> & Pick<Profile, "id"> & Partial<Profile>;
        Update: Partial<Profile>;
        Relationships: [];
      };
      wallets: {
        Row: Wallet;
        Insert: Omit<Wallet, "id" | keyof Timestamps> & Partial<Timestamps> & { id?: string };
        Update: Partial<Wallet>;
        Relationships: [];
      };
      cards: {
        Row: Card;
        Insert: Omit<Card, "id" | keyof Timestamps> & Partial<Timestamps> & { id?: string };
        Update: Partial<Card>;
        Relationships: [];
      };
      subscriptions: {
        Row: Subscription;
        Insert: Omit<Subscription, "id" | keyof Timestamps> &
          Partial<Timestamps> & { id?: string };
        Update: Partial<Subscription>;
        Relationships: [];
      };
      user_rules: {
        Row: UserRule;
        Insert: Omit<UserRule, "id" | keyof Timestamps> &
          Partial<Timestamps> & { id?: string };
        Update: Partial<UserRule>;
        Relationships: [];
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Transaction>;
        Relationships: [];
      };
      agent_decisions: {
        Row: AgentDecision;
        Insert: Omit<AgentDecision, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<AgentDecision>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      card_status: CardStatus;
      subscription_status: SubscriptionStatus;
      transaction_status: TransactionStatus;
      decision_type: DecisionType;
      rule_action: RuleAction;
      recommended_action: RecommendedAction;
    };
  };
}
