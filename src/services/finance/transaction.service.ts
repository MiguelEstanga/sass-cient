import { api } from "@/lib/api/client";
import type {
  CreateTransactionDto,
  Transaction,
  TransactionFilters,
} from "@/types/finance/transaction.types";
import type { PaginatedResponse } from "@/types/api.types";
import { TransactionFormValues } from "@/lib/validations/transaction.schema";

const BASE_URL = "/finance/transactions";

export const transactionService = {
  getAll: (filters?: TransactionFilters) => {
    const params = new URLSearchParams();
    if (filters?.search) params.set("search", filters.search);
    if (filters?.type) params.set("type", filters.type);
    if (filters?.per_page) params.set("per_page", String(filters.per_page));
    if (filters?.page) params.set("page", String(filters.page));
    const query = params.toString();
    return api.get<PaginatedResponse<Transaction>>(
      `${BASE_URL}${query ? `?${query}` : ""}`,
    );
  },

  create: (data: TransactionFormValues) =>
    api.post<Transaction>(BASE_URL, data),

  update: (id: number, data: CreateTransactionDto) =>
    api.put<Transaction>(`${BASE_URL}/${id}`, data),

  delete: (id: number) => api.delete(`${BASE_URL}/${id}`),
};
