/**
 * Estructura estándar de respuesta del backend Laravel
 * Todos los endpoints retornan este formato
 */
export interface ApiResponse<T = unknown> {
  status: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

/**
 * Respuesta paginada de Laravel (paginate())
 */
export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

/**
 * Errores de validación de Laravel (formato 422)
 */
export type ValidationErrors = Record<string, string[]>;