import { api } from "@/lib/api/client";
import type { Client, CreateClientDto, UpdateClientDto, ClientFilters } from "@/types/client.types";
import type { PaginatedResponse } from "@/types/api.types";

export const clientService = {
  getAll: (filters?: ClientFilters) => {
    const params = new URLSearchParams();
    if (filters?.search) params.set("search", filters.search);
    if (filters?.per_page) params.set("per_page", String(filters.per_page));
    if (filters?.page) params.set("page", String(filters.page));
    const query = params.toString();
    return api.get<PaginatedResponse<Client>>(
      `clients${query ? `?${query}` : ""}`
    );
  },

  getById: (id: number) =>
    api.get<Client>(`clients/${id}`),

  create: (data: CreateClientDto) =>
    api.post<Client>("clients", data),

  update: (id: number, data: UpdateClientDto) =>
    api.put<Client>(`clients/${id}`, data),

  delete: (id: number) =>
    api.delete(`clients/${id}`),
};