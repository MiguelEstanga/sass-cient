import { api } from "@/lib/api/client";
import type {
  Appointment,
  CreateAppointmentDto,
  UpdateAppointmentDto,
} from "@/types/appointment.types";

// ── Normalizar campos start_time/end_time → start/end ─────────────────────
function normalize(a: any): Appointment {
  return {
    ...a,
    start: a.start ?? a.start_time,
    end:   a.end   ?? a.end_time,
  };
}

export const appointmentService = {
  getAll: async (start: string, end: string): Promise<Appointment[]> => {
    const params = new URLSearchParams({ start, end });
    const result = await api.get<any>(`appointments?${params}`);
    const list   = Array.isArray(result) ? result : [];
    return list.map(normalize);
  },

  create: async (data: CreateAppointmentDto): Promise<Appointment> => {
    const result = await api.post<any>("appointments", data);
    return normalize(result);
  },

  update: async (id: number, data: UpdateAppointmentDto): Promise<Appointment> => {
    const result = await api.patch<any>(`appointments/${id}`, data);
    return normalize(result);
  },

  changeStatus: async (id: number, status: string): Promise<Appointment> => {
    const result = await api.patch<any>(`appointments/${id}/status`, { status });
    return normalize(result);
  },
};