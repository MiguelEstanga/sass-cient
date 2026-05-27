import type { Product }              from "@/types/product.types";
import type { Client }               from "@/types/client.types";
import type { Service }              from "./services.types";
import type { MembershipSubscription } from "./membership.types";

export interface CartItem {
  product:    Product | null;
  service:    Service | null;
  quantity:   number;
  price:      number;
  employeeId: number | null;
}

// ── Descuento aplicado por membresía ──────────────────────────────────────
export interface MembershipDiscount {
  type:         "credits" | "discount" | "both";
  creditsUsed:  number;
  discountPct:  number;
  discountAmt:  number;
  finalTotal:   number;
}

export interface CreateSaleDto {
  type:                    "product" | "service";
  client_id?:              number | null;
  total:                   number;
  tax:                     number;
  payment_method:          string;
  notes?:                  string | null;
  items:                   SaleItemPayload[];
   
  membership_subscription_id?: number | null;
  credits_used?:               number | null;
  discount_applied?:           number | null;
}

export interface SaleItemPayload {
  product_id?:     number;
  service_id?:     number;
  quantity:        number;
  price:           number;
  status?:         string;
  performance_id?: number | null;
}