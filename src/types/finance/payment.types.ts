export interface LoanPayment {
  id: number;
  loan_id: number;
  payment_number: number;
  payment_amount: string; // Total pagado (ej. 60.00)
  interest_paid: string;  // <-- Cuánto de eso fue interés (ej. 26.00)
  principal_paid: string; // <-- Cuánto abonó al préstamo (ej. 34.00)
  payment_date: string;
  status: "pending" | "completed" | "failed";
  company_id: number;
  created_at: string;
  loan?: { id: number; user: { name: string } };
}

export interface CreatePaymentDto {
  loan_id: number;
  interest_paid: number;   // Lo que decidió pagar de intereses
  principal_paid: number;  // Lo que decidió pagar de capital
  expected_interest: number; // El total que debía, para saber si falta
  payment_date: string;
}

export interface PaymentFilters {
  loan_id?: number;
  status?: string;
  page?: number;
  per_page?: number;
}