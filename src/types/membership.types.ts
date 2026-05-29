// Tipo de beneficio del plan
export type BenefitType = "credits" | "discount" | "both";

// Ciclo de facturación
export type BillingCycle = "monthly" | "yearly";

// Estado de la suscripción
export type SubscriptionStatus =
  | "active"
  | "paused"
  | "cancelled"
  | "past_due"
  | "expired";

// Tipo de cobro
export type BillingType = "automatic" | "manual";

// ── Plan de membresía ──────────────────────────────────────────────────────
export interface MembershipPlan {
  id: number;
  company_id: number;
  name: string;
  description: string | null;
  price: string;
  benefit_type: BenefitType;
  credits_per_month: number | null;
  discount_percent: string | null;
  billing_cycle: BillingCycle;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // Conteo de suscripciones activas
  active_subscriptions_count?: number;
}

// ── Suscripción de cliente ─────────────────────────────────────────────────
export interface MembershipSubscription {
  id: number;
  company_id: number;
  client_id: number;
  membership_plan_id: number;
  status: SubscriptionStatus;
  billing_type: BillingType;
  credits_available: number;
  credits_used: number;
  started_at: string;
  next_billing_date: string | null;
  cancelled_at: string | null;
  stripe_subscription_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Relaciones
  client?: {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
  };
  plan?: MembershipPlan;
}

// ── Log de créditos ────────────────────────────────────────────────────────
export interface CreditLog {
  id: number;
  membership_subscription_id: number;
  type: "credit" | "debit" | "reset";
  amount: number;
  description: string | null;
  sale_id: number | null;
  performed_by: number | null;
  created_at: string;
  performer?: { id: number; name: string };
  sale?: { id: number; total: string };
}

// ── DTOs ──────────────────────────────────────────────────────────────────
export interface CreatePlanDto {
  name: string;
  description?: string;
  price: number;
  benefit_type: BenefitType;
  credits_per_month?: number;
  discount_percent?: number;
  billing_cycle: BillingCycle;
  is_active?: boolean;
  sort_order?: number;
}

export interface CreateSubscriptionDto {
  client_id: number;
  membership_plan_id: number;
  billing_type: BillingType;
  started_at?: string;
  notes?: string;
}

// ── Factura de membresía ───────────────────────────────────────────────────
export interface MembershipInvoice {
  id: number;
  company_id: number;
  membership_subscription_id: number;
  sale_id: number | null;
  amount: string;
  status: "pending" | "paid" | "failed" | "cancelled";
  period_start: string;
  period_end: string;
  due_date: string;
  paid_at: string | null;
  payment_method: string | null;
  stripe_payment_intent_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Relaciones
  subscription?: {
    id: number;
    client?: { id: number; name: string; phone: string | null };
    plan?: { id: number; name: string; price: string };
  };
  sale?: { id: number; total: string };
}
