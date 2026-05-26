export interface EmployeeSchedule {
  id:          number;
  user_id:     number;
  company_id:  number;
  check_in:    string;
  check_out:   string;
  break_start: string | null;
  break_end:   string | null;
  created_at:  string;
  updated_at:  string;

  // ── Relación eager loaded ─────────────────────────────────────────────
  user?: {
    id:    number;
    name:  string;
    email: string;
    phone?: string;
  };
}

export interface ScheduleResource {
  resource_id:       number;
  is_available:      boolean;
  theoretical_hours: number;
  details:           EmployeeSchedule | null;
}

export interface UpsertScheduleDto {
  check_in:     string;
  check_out:    string;
  break_start?: string;
  break_end?:   string;
}