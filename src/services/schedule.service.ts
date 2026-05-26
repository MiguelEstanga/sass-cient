import { api } from "@/lib/api/client";
import type {
  EmployeeSchedule,
  ScheduleResource,
  UpsertScheduleDto,
} from "@/types/schedule.types";
import type { PaginatedResponse } from "@/types/api.types";
const enpoint = "/employee-schedules"; 
export const scheduleService = {
  // ── Lista paginada con relación user ──────────────────────────────────
  getAll: (params?: {
    search?:   string;
    per_page?: number;
    page?:     number;
  }) => {
    const p = new URLSearchParams();
    if (params?.search)   p.set("search",   params.search);
    if (params?.per_page) p.set("per_page", String(params.per_page));
    if (params?.page)     p.set("page",     String(params.page));
    const query = p.toString();
    return api.get<PaginatedResponse<EmployeeSchedule>>(
      `${enpoint}${query ? `?${query}` : ""}`
    );
  },

  // ── IDs de empleados que ya tienen horario asignado ───────────────────
  getAssignedIds: () =>
    api.get<number[]>( `${enpoint}/assigned-ids`),

  // ── Horario de un empleado ────────────────────────────────────────────
  getByEmployee: (userId: number) =>
    api.get<ScheduleResource>(`${enpoint}/${userId}`),

  // ── Crear o actualizar ────────────────────────────────────────────────
  upsert: (userId: number, data: UpsertScheduleDto) =>
    api.post<EmployeeSchedule>(`${enpoint}/${userId}`, data),

  // ── Eliminar horario ──────────────────────────────────────────────────
  delete: (id: number) =>
    api.delete(`${enpoint}/${id}`),
};