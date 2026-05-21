import { api } from "@/lib/api/client";
import type {
  Employee,
  UpdateEmployeeDto,
  EmployeeFilters,
} from "@/types/user.types";
import type { PaginatedResponse } from "@/types/api.types";

export const userService = {
  getAll: (filters?: EmployeeFilters) => {
    const params = new URLSearchParams();
    if (filters?.search) params.set("search", filters.search);
    if (filters?.per_page) params.set("per_page", String(filters.per_page));
    if (filters?.page) params.set("page", String(filters.page));
    if (filters?.role) params.set("role", filters.role);
    console.log(filters?.role)
    const query = params.toString();
    const res = api.get<PaginatedResponse<Employee>>(
      `users${query ? `?${query}` : ""}`
    );
    
    return res;
  },

  getById: (id: number) => api.get<Employee>(`users/${id}`),

  update: (id: number, data: UpdateEmployeeDto) =>
    api.put<Employee>(`users/${id}`, data),

  create: (data: UpdateEmployeeDto) => api.post<Employee>("users", data),
};