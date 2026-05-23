import type { Product } from "@/types/product.types";
import type { Client } from "@/types/client.types";
import type { Service } from "./services.types";

// ── Cada item del carrito puede tener su propio ejecutor ──────────────────
export interface CartItem {
  product:    Product | null;
  service:    Service | null;
  quantity:   number;
  price:      number;
  employeeId: number | null; // ← ejecutor específico de este item
}

export interface CreateSaleDto {
  type:           "product" | "service";
  client_id?:     number | null;
  total:          number;
  tax:            number;
  payment_method: string;
  notes?:         string | null;
  items:          SaleItemPayload[];
}

export interface SaleItemPayload {
  product_id?:     number;
  service_id?:     number;
  quantity:        number;
  price:           number;
  status?:         string;
  performance_id?: number | null;
}