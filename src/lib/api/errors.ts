import type { ValidationErrors } from "@/types/api.types";

/**
 * Error base para todas las llamadas a la API.
 * Permite distinguir entre errores de red, validación, auth, etc.
 */
export class ApiError extends Error {
  status: number;
  errors?: ValidationErrors;
  data?: unknown;

  constructor(
    message: string,
    status: number,
    errors?: ValidationErrors,
    data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
    this.data = data;
  }

  /** Error de validación 422 */
  isValidationError(): boolean {
    return this.status === 422;
  }

  /** Token expirado o inválido */
  isUnauthorized(): boolean {
    return this.status === 401;
  }

  /** Sin permisos */
  isForbidden(): boolean {
    return this.status === 403;
  }

  /** Recurso no encontrado */
  isNotFound(): boolean {
    return this.status === 404;
  }

  /** Error del servidor */
  isServerError(): boolean {
    return this.status >= 500;
  }

  /** Obtener el primer error de un campo específico */
  getFieldError(field: string): string | undefined {
    return this.errors?.[field]?.[0];
  }

  /** Obtener todos los errores aplanados como array de strings */
  getAllErrors(): string[] {
    if (!this.errors) return [this.message];
    return Object.values(this.errors).flat();
  }
}

/**
 * Error de red (sin conexión, timeout, etc.)
 */
export class NetworkError extends Error {
  constructor(message = "Error de conexión. Verifica tu internet.") {
    super(message);
    this.name = "NetworkError";
  }
}