export interface Client {
  id: number;
  company_id: number;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  is_active: boolean;
  type_document: string | null;
  document_number: string | null;
  address: string | null;
  city: string | null;
  number_prefix: string | null;
  zip: string | null;
  user_id: number | null;
  appointments_count?: number;
  sales_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateClientDto {
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
  type_document?: string;
  document_number?: string;
  address?: string;
  city?: string;
  number_prefix?: string;
}

export interface UpdateClientDto extends Partial<CreateClientDto> {}

export interface ClientFilters {
  search?: string;
  per_page?: number;
  page?: number;
}