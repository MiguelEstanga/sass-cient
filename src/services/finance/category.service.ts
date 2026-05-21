import { api } from "@/lib/api/client";
import type { FinanceCategory, CreateFinanceCategoryDto, UpdateFinanceCategoryDto, FinanceCategoryFilters } from "@/types/finance/category.types";
import type { PaginatedResponse } from "@/types/api.types";

const BASE_URL = "/finance/categories";

export const financeCategoryService = {
  getAll: (filters?: FinanceCategoryFilters) => {
    const params = new URLSearchParams();
    if (filters?.search) params.set("search", filters.search);
    if (filters?.type) params.set("type", filters.type);
    if (filters?.is_active !== undefined) params.set("is_active", String(filters.is_active));
    if (filters?.per_page) params.set("per_page", String(filters.per_page));
    if (filters?.page) params.set("page", String(filters.page));
    const query = params.toString();
    return api.get<PaginatedResponse<FinanceCategory>>(`${BASE_URL}${query ? `?${query}` : ""}`);
  },

  getById: (id: number) => api.get<FinanceCategory>(`${BASE_URL}/${id}`),
  
  create: (data: CreateFinanceCategoryDto) => api.post<FinanceCategory>(BASE_URL, data),
  
  update: (id: number, data: UpdateFinanceCategoryDto) => 
    api.put<FinanceCategory>(`${BASE_URL}/${id}`, data),

  delete: (id: number) => api.delete(`${BASE_URL}/${id}`),
};