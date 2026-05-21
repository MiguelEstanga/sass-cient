export interface Loan {
  id: number;
  user_id: number;
  category_id: number;
  loan_amount: string;
  interest_rate: string;
  term_months: number;
  status: "pending" | "active" | "paid" | "cancelled" | "defaulted";
  company_id: number;
  created_at: string;
  updated_at: string;
  // Relaciones
  user?: { id: number; name: string; email: string };
  category?: { id: number; name: string };
  // Calculados (del backend)
  total_interest?: string;
  total_payable?: string;
  monthly_payment?: string;
  paid_amount?: string;
  remaining_amount?: string;
  payment_progress?: number;
}

export interface CreateLoanDto {
  user_id: number;
  category_id: number;
  loan_amount: number;
  interest_rate: number;
  term_months: number;
}

export interface LoanFilters {
  search?: string;
  user_id?: number;
  status?: string;
  page?: number;
  per_page?: number;
}