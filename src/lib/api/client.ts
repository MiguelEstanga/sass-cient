import { storage, storageName } from "@/lib/utils/storage";
import { ApiError, NetworkError } from "./errors";
import type { ApiResponse } from "@/types/api.types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/";

const DEFAULT_COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID ?? "1";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  /** Si pasas FormData, el Content-Type se omite automáticamente */
  formData?: FormData;
  /** Permite cancelar la petición */
  signal?: AbortSignal;
  /** Si es true, no envía el header Authorization (para login, register) */
  skipAuth?: boolean;
  /** Forzar otro company-id en una petición específica */
  companyId?: string | number;
  /** Idioma para Accept-Language (Laravel devuelve mensajes traducidos) */
  locale?: string;
}

/**
 * Obtiene el token del localStorage.
 */
function getToken(): string | null {
  return storage.get<string>(storageName.token);
}

/**
 * Obtiene el company_id actual.
 * Prioridad: parámetro > localStorage > env por defecto.
 */
function getCompanyId(override?: string | number): string {
  if (override !== undefined) return String(override);
  const stored = storage.get<number | string>(storageName.companyId);
  return stored ? String(stored) : DEFAULT_COMPANY_ID;
}

/**
 * Obtiene el locale actual del navegador.
 */
function getLocale(override?: string): string {
  if (override) return override;
  const stored = storage.get<string>(storageName.locale);
  return stored ?? "es";
}

/**
 * Construye los headers de la petición.
 */
function buildHeaders(options: RequestOptions): HeadersInit {
  const { headers = {}, formData, skipAuth, companyId, locale } = options;
  const token = getToken();

  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
    "company-id": getCompanyId(companyId)  ?? 1,
    "Accept-Language": getLocale(locale),
    ...headers,
  };

  // Solo agregar Content-Type si NO es FormData (el browser lo pone automáticamente con boundary)
  if (!formData) {
    finalHeaders["Content-Type"] = "application/json";
  }

  // Auth header
  if (!skipAuth && token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  return finalHeaders;
}

/**
 * Maneja errores HTTP y los convierte en ApiError tipados.
 */
async function handleErrorResponse(res: Response): Promise<never> {
  let errorData: ApiResponse | null = null;

  try {
    errorData = await res.json();
  } catch {
    // Response no es JSON válido
  }

  const message =
    errorData?.message ??
    `Error ${res.status}: ${res.statusText || "Error desconocido"}`;

  throw new ApiError(message, res.status, errorData?.errors, errorData?.data);
}

/**
 * Cliente HTTP principal.
 *
 * Devuelve directamente el `data` del response { status, message, data }
 * para no andar desestructurando en cada service.
 *
 * Lanza ApiError en caso de error HTTP, NetworkError si no hay conexión.
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, formData, signal } = options;

  // Limpiar slash inicial del endpoint para evitar // en la URL
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  const url = `${BASE_URL}${cleanEndpoint}`;

  // Body: FormData o JSON
  let requestBody: BodyInit | undefined;
  if (formData) {
    requestBody = formData;
  } else if (body !== undefined) {
    requestBody = JSON.stringify(body);
  }

  let res: Response;

  try {
    res = await fetch(url, {
      method,
      headers: buildHeaders(options),
      body: requestBody,
      signal,
    });
  } catch (error) {
    // AbortError: petición cancelada manualmente, dejar que se propague
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }
    // Cualquier otro error de fetch = problema de red
    throw new NetworkError();
  }

  // Manejo de errores HTTP
  if (!res.ok) {
    // Auto-logout en 401 (token expirado)
    if (res.status === 401 && !options.skipAuth) {
      handleUnauthorized();
    }
    await handleErrorResponse(res);
  }

  // Response 204 No Content
  if (res.status === 204) {
    return undefined as T;
  }

  const json: ApiResponse<T> = await res.json();

  // El backend siempre devuelve { status, message, data }
  // Devolvemos solo data para no desestructurar en cada service
  if (json && typeof json === "object" && "data" in json) {
    return json.data as T;
  }

  return json as unknown as T;
}

/**
 * Hook que se ejecuta cuando hay 401.
 * Limpia storage y redirige al login.
 */
function handleUnauthorized(): void {
  if (typeof window === "undefined") return;

  // Limpiar storage
  storage.remove(storageName.token);
  storage.remove(storageName.companyId);
  storage.remove(storageName.user);

  // Limpiar Zustand store dinámicamente para evitar import circular
  // El AuthGuard detectará isAuthenticated = false y redirigirá
  const event = new CustomEvent("auth:unauthorized");
  window.dispatchEvent(event);

  // Redirect suave
  const locale = storage.get<string>(storageName.locale) ?? "es";
  window.location.replace(`/${locale}/login`);
}

/**
 * Helpers tipados para no escribir { method: "POST" } en cada llamada.
 */
export const api = {
  get<T>(endpoint: string, options?: Omit<RequestOptions, "method" | "body">) {
    return apiClient<T>(endpoint, { ...options, method: "GET" });
  },

  post<T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
  ) {
    return apiClient<T>(endpoint, { ...options, method: "POST", body });
  },

  put<T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
  ) {
    return apiClient<T>(endpoint, { ...options, method: "PUT", body });
  },

  patch<T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
  ) {
    return apiClient<T>(endpoint, { ...options, method: "PATCH", body });
  },

  delete<T = void>(
    endpoint: string,
    options?: Omit<RequestOptions, "method" | "body">,
  ) {
    return apiClient<T>(endpoint, { ...options, method: "DELETE" });
  },

  /** Subir archivos con FormData */
  upload<T>(
    endpoint: string,
    formData: FormData,
    options?: Omit<RequestOptions, "method" | "body" | "formData">,
  ) {
    return apiClient<T>(endpoint, {
      ...options,
      method: "POST",
      formData,
    });
  },
};

 