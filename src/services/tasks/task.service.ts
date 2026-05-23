import { api } from "@/lib/api/client";
import type { Task, TaskStatus } from "@/types/task.types";
import type { PaginatedResponse } from "@/types/api.types";

export const taskService = {
  // ── Tareas activas — devuelve paginación, sacamos solo .data ──────────
  getActive: async (): Promise<Task[]> => {
    const result = await api.get<PaginatedResponse<Task>>("tasks");
    return result.data; // ← el array de items dentro de la paginación
  },

  // ── Tareas completadas ────────────────────────────────────────────────
  getCompleted: (params?: {
    search?:   string;
    per_page?: number;
    page?:     number;
  }) => {
    const p = new URLSearchParams();
    if (params?.search)   p.set("search",   params.search);
    if (params?.per_page) p.set("per_page", String(params.per_page));
    if (params?.page)     p.set("page",     String(params.page));
    const query = p.toString();
    return api.get<PaginatedResponse<Task>>(
      `tasks/completed${query ? `?${query}` : ""}`
    );
  },

  // ── Iniciar cronómetro ─────────────────────────────────────────────────
  start: (id: number) =>
    api.patch<Task>(`tasks/${id}/start`, {}),

  // ── Cambiar estado — devuelve el item actualizado ──────────────────────
  updateStatus: async (id: number, status: TaskStatus): Promise<Task> => {
    const result = await api.patch<Task | PaginatedResponse<Task>>(
      `tasks/${id}/status`,
      { status }
    );

    // Guardia: si el backend devuelve paginación en vez del item solo
    if (result && "data" in result && Array.isArray((result as PaginatedResponse<Task>).data)) {
      const list = (result as PaginatedResponse<Task>).data;
      const found = list.find((t) => t.id === id);
      if (found) return found;
      throw new Error("Item no encontrado en la respuesta");
    }

    return result as Task;
  },
};