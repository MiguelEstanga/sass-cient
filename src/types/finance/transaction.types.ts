import { FinanceCategory } from "./category.types";

export interface Transaction {
  id: number;
  type: "income" | "expense";
  description: string;
  amount: string;
  category_id: number | null;
  company_id: number;
  created_at: string;
  date: string;
  category?: FinanceCategory| null;
}

export interface CreateTransactionDto {
  type: "income" | "expense";
  description: string;
  amount: number;
  category_id?: number | null; // Opcional
}

export interface TransactionFilters {
  search?: string;
  type?: "income" | "expense";
  page?: number;
  per_page?: number;
}