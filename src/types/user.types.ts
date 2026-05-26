import type { Role } from "./auth.types";

// ── Tipo base compartido entre User y Client ───────────────────────────────
interface PersonBase {
  id:              number;
  name:            string;
  email:           string | null;
  phone:           string | null;
  is_active:       boolean;
  company_id:      number;
  number_prefix:   string | null;
  type_document:   string | null;
  document_number: string | null;
  address:         string | null;
  city:            string | null;
  zip:             string | null;
  created_at:      string;
  updated_at:      string;
}

// ── Empleado / Usuario del sistema ────────────────────────────────────────
export interface Employee extends PersonBase {
  _type:     "employee";
  is_busy:   boolean;
  state?:    string | null;
  roles:     Role[];
}

// ── Cliente del salón ─────────────────────────────────────────────────────
export interface ClientProfile extends PersonBase {
  _type:   "client";
  notes:   string | null;
  user_id: number | null;
  appointments_count?: number;
  sales_count?:        number;
}

// ── Unión para cuando no sabes si es cliente o empleado ───────────────────
export type Person = Employee | ClientProfile;

// ── DTOs de actualización ─────────────────────────────────────────────────
export interface UpdatePersonDto {
  name?:            string;
  email?:           string;
  phone?:           string;
  password?:        string;
  type_document?:   string;
  document_number?: string;
  address?:         string;
  city?:            string;
  zip?:             string;
  number_prefix?:   string;
  is_active?:       boolean;
  // Solo para clientes
  notes?:           string;
}

// ── Filtros ───────────────────────────────────────────────────────────────
export interface PersonFilters {
  search?:   string;
  per_page?: number;
  page?:     number;
  role?:     string;
}

// ── Mantener compatibilidad con código existente ──────────────────────────
export type { Employee as User };
export interface UpdateEmployeeDto extends UpdatePersonDto {}
export interface EmployeeFilters extends PersonFilters {}