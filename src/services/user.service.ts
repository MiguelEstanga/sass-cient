import { api } from "@/lib/api/client";
import type {
  Employee,
  UpdatePersonDto,
  PersonFilters,
} from "@/types/user.types";
import type { Client } from "@/types/client.types";
import type { PaginatedResponse } from "@/types/api.types";

export const userService = {
  // ── Empleados ─────────────────────────────────────────────────────────
  getAll: (filters?: PersonFilters) => {
    const p = new URLSearchParams();
    if (filters?.search) p.set("search", filters.search);
    if (filters?.per_page) p.set("per_page", String(filters.per_page));
    if (filters?.page) p.set("page", String(filters.page));
    if (filters?.role) p.set("role", filters.role);
    const query = p.toString();
    return api.get<PaginatedResponse<Employee>>(
      `users${query ? `?${query}` : ""}`,
    );
  },
  // Agregar en userService
  create: (data: any) => api.post<Employee>("users", data),
  // ── Actualizar empleado → PUT /users/{id} ─────────────────────────────
  updateEmployee: (id: number, data: UpdatePersonDto) =>
    api.put<Employee>(`users/${id}`, data),

  // ── Actualizar cliente → PUT /clients/{id} ────────────────────────────
  updateClient: (id: number, data: UpdatePersonDto) =>
    api.put<Client>(`clients/${id}`, data),

  // ── Método genérico — decide endpoint según _type ─────────────────────
  update: (id: number, data: UpdatePersonDto, type: "employee" | "client") =>
    type === "client"
      ? userService.updateClient(id, data)
      : userService.updateEmployee(id, data),
};
