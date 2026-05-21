export interface Service {
  id: number;
  company_id: number;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateServiceDto {
  name: string;
  description?: string | null;
  duration_minutes: number;
  price: number;
  is_active?: boolean;
}

export interface UpdateServiceDto extends Partial<CreateServiceDto> {}

export interface ServiceFilters {
  search?: string;
  page?: number;
  per_page?: number;
  is_active?: boolean;
}