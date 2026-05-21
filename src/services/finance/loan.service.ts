import { api } from "@/lib/api/client";
import type { Loan, CreateLoanDto, LoanFilters } from "@/types/finance/loan.types";
import type { PaginatedResponse } from "@/types/api.types";

const BASE_URL = "/finance/loans";

export const loanService = {
  getAll: (filters?: LoanFilters) => {
    const params = new URLSearchParams();
    if (filters?.search) params.set("search", filters.search);
    if (filters?.user_id) params.set("user_id", String(filters.user_id));
    if (filters?.status) params.set("status", filters.status);
    if (filters?.per_page) params.set("per_page", String(filters.per_page));
    if (filters?.page) params.set("page", String(filters.page));
    const query = params.toString();
    return api.get<PaginatedResponse<Loan>>(`${BASE_URL}${query ? `?${query}` : ""}`);
  },

  getById: (id: number) => api.get<Loan>(`${BASE_URL}/${id}`),
  
  create: (data: CreateLoanDto) => api.post<Loan>(BASE_URL, data),
  
  update: (id: number, data: Partial<CreateLoanDto> & { status?: string }) => 
    api.put<Loan>(`${BASE_URL}/${id}`, data),

  changeStatus: (id: number, status: string) => 
    api.put<Loan>(`${BASE_URL}/${id}/status`, { status }),

  delete: (id: number) => api.delete(`${BASE_URL}/${id}`),
};