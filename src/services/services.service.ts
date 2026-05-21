import { api } from "@/lib/api/client";
 import type { PaginatedResponse } from "@/types/api.types";
import { CreateServiceDto, Service, ServiceFilters, UpdateServiceDto } from "@/types/services.types";


const BASE_URL = "/services";

export const serviceService = {
  getAll: (filters?: ServiceFilters) => {
    const params = new URLSearchParams();
    if (filters?.search) params.set("search", filters.search);
    if (filters?.per_page) params.set("per_page", String(filters.per_page));
    if (filters?.page) params.set("page", String(filters.page));
    if (filters?.is_active !== undefined) params.set("is_active", String(filters.is_active));
    const query = params.toString();
    return api.get<PaginatedResponse<Service>>(
      `services${query ? `?${query}` : ""}`
    );
  },

  getById: (id: number) =>
    api.get<Service>(`services/${id}`),

  create: (data: CreateServiceDto) =>
    api.post<Service>("services", data),

  update: (id: number, data: UpdateServiceDto) =>
    api.put<Service>(`services/${id}`, data),

  delete: (id: number) =>
    api.delete(`services/${id}`),
};