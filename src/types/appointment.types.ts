export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "completed"
  | "in_progress"
  | "cancelled";

export interface Appointment {
  id:            number;
  title:         string;
  start:         string;
  end:           string;
  status:        AppointmentStatus;
  client_id:     number;
  client_name:   string;
  employee_id:   number;
  employee_name: string;
  service_id:    number;
  service_name:  string;
}

export interface CreateAppointmentDto {
  client_id:  number;
  user_id:    number;
  service_id: number;
  start_time: string;
}

export interface UpdateAppointmentDto {
  start_time?: string;
  end_time?:   string;
  status?:     AppointmentStatus;
}

export interface CalendarConfig {
  startHour: number; // ej: 8 → 08:00
  endHour:   number; // ej: 20 → 20:00
  slotMins:  number; // ej: 15
}

export interface AppointmentFormValues {
  client_id:  number;
  user_id:    number;
  service_id: number;
  start_time: string;
}