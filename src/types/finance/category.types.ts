export interface FinanceCategory {
  id: number;
  company_id: number;
  name: string;
  description: string | null;
  type: "loan" | "payment" | "other";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateFinanceCategoryDto {
  name: string;
  description?: string | null;
  type: "loan" | "payment" | "other";
  is_active?: boolean;
}

export interface UpdateFinanceCategoryDto extends Partial<CreateFinanceCategoryDto> {}

export interface FinanceCategoryFilters {
  search?: string;
  type?: string;
  is_active?: boolean;
  page?: number;
  per_page?: number;
}