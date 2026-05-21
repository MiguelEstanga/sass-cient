import type { Role } from "./auth.types";

export interface Employee {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  is_busy: boolean;
  company_id: number;
  number_prefix: string | null;
  type_document: string | null;
  document_number: string | null;
  address: string | null;
  city: string | null;
  zip: string | null;
  roles: Role[];
  created_at: string;
  updated_at: string;
}

export interface UpdateEmployeeDto {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  type_document?: string;
  document_number?: string;
  address?: string;
  city?: string;
  zip?: string;
  number_prefix?: string;
  is_active?: boolean;
}

export interface EmployeeFilters {
  search?: string;
  per_page?: number;
  page?: number;
  role?: string;
}