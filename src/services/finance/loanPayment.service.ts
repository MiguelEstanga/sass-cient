import { api } from "@/lib/api/client";
import type {
  LoanPayment,
  CreatePaymentDto,
  PaymentFilters,
} from "@/types/finance/payment.types";

const BASE_URL = "/finance/loan-payments";

export const loanPaymentService = {
  /**
   * Obtener todos los pagos (para tablas generales si se necesita)
   */
  getAll: (filters?: PaymentFilters) => {
    const params = new URLSearchParams();
    if (filters?.loan_id) params.set("loan_id", String(filters.loan_id));
    if (filters?.status) params.set("status", filters.status);
    if (filters?.per_page) params.set("per_page", String(filters.per_page));
    if (filters?.page) params.set("page", String(filters.page));
    const query = params.toString();
    return api.get<{ data: LoanPayment[] }>(
      `${BASE_URL}${query ? `?${query}` : ""}`,
    );
  },

  /**
   * Obtener todos los pagos de un préstamo específico
   * (Lo usa el SlidePanel del historial)
   */
  getByLoan: (loanId: number) => {
    return api.get<LoanPayment[]>(`${BASE_URL}/loan/${loanId}`);
  },

  /**
   * Registrar un nuevo pago parcial
   * (Lo usa el modal de pago)
   */
  create: (data: CreatePaymentDto) => {
    return api.post<LoanPayment>(BASE_URL, data);
  },

  update: (
    id: number,
    data: Omit<CreatePaymentDto, "loan_id" | "expected_interest">,
  ) => {
    return api.put<LoanPayment>(`${BASE_URL}/${id}`, data);
  },

  /**
   * Eliminar/Reversar un pago
   */
  delete: (id: number) => {
    return api.delete(`${BASE_URL}/${id}`);
  },
};
