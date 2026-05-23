import { api } from "@/lib/api/client";
import type { CreateSaleDto } from "@/types/pos.types";
import type { PaginatedResponse } from "@/types/api.types";
import type { Sale, SaleFilters } from "@/types/sale.types";

const BASE_URL = "/sales";

export const saleService = {
  processCheckout: (data: CreateSaleDto) => api.post<Sale>(BASE_URL, data),

  getAll: (filters?: SaleFilters) => {
    const params = new URLSearchParams();
    if (filters?.search) params.set("search", filters.search);
    if (filters?.per_page) params.set("per_page", String(filters.per_page));
    if (filters?.page) params.set("page", String(filters.page));
    if (filters?.type) params.set("type", filters.type); // ← nuevo
    const query = params.toString();
    return api.get<PaginatedResponse<Sale>>(
      `${BASE_URL}${query ? `?${query}` : ""}`,
    );
  },

  getById: (id: number) => api.get<Sale>(`${BASE_URL}/${id}`),

  // ── Actualizar estado de la venta (pending → processed → cancelled) ───
  updateStatus: (id: number, status: "pending" | "processed" | "cancelled") =>
    api.patch<Sale>(`${BASE_URL}/${id}/status`, { status }),

  // ── Actualizar estado de pago (pending → completed → failed) ──────────
  updatePaymentStatus: (
    id: number,
    payment_status: "pending" | "completed" | "failed",
  ) => api.patch<Sale>(`${BASE_URL}/${id}/payment-status`, { payment_status }),
};
