export type TaskStatus = "pending" | "in_progress" | "paused" | "completed" | "cancelled";

export interface Task {
  id:               number;
  sale_id:          number;
  service_id:       number | null;
  performance_id:   number | null;
  quantity:         number;
  unit_price:       string;
  subtotal:         string;
  status:           TaskStatus;
  started_at:       string | null; // ISO timestamp del servidor
  finished_at:      string | null;
  duration_seconds: number;        // segundos acumulados (sin contar tramo actual)
  performer_name:   string;        // viene del JOIN en el backend

  // Relaciones
  service?: {
    id:   number;
    name: string;
  };
  sale?: {
    id:     number;
    client?: {
      id:   number;
      name: string;
    };
  };
}