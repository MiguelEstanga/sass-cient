import type { Product } from "@/types/product.types";
import type { Client } from "@/types/client.types";
import { Service } from "./services.types";

export interface CartItem {
  product: Product | null;
  service: Service | null;
  quantity: number;
  price: number; // Se usa al calcular el total (viene del producto o servicio elegido)
}

export interface CreateSaleDto {
  type: 'product' | 'service';
  client_id?: number | null;
  total: number;
  tax: number;
  payment_method: string;
  notes?: string | null;
  items: SaleItemPayload[];
}

export interface SaleItemPayload {
  product_id?: number;
  service_id?: number;
  quantity: number;
  price: number;
  status?: string;
  performance_id?: number;
}