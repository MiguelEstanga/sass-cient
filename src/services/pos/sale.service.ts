import { api } from "@/lib/api/client";
// <-- ASEGÚRATE DE IMPORTAR DESDE pos.types
import type { CreateSaleDto, SaleItemPayload } from "@/types/pos.types";

import type { PaginatedResponse } from "@/types/api.types";
import { Sale, SaleFilters } from "@/types/sale.types";

const BASE_URL = "/sales";

export const saleService = {
  processCheckout: (data: CreateSaleDto) => api.post<Sale>(BASE_URL, data),

  

  getAll: (filters?: SaleFilters) => {
    const params = new URLSearchParams();
    if (filters?.search) params.set("search", filters.search);
    if (filters?.per_page) params.set("per_page", String(filters.per_page));
    if (filters?.page) params.set("page", String(filters.page));
    const query = params.toString();
    return api.get<PaginatedResponse<Sale>>(
      `${BASE_URL}${query ? `?${query}` : ""}`,
    );
  },

  getById: (id: number) => api.get<Sale>(`${BASE_URL}/${id}`),
};
