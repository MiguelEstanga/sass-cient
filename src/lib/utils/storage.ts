/**
 * Nombres centralizados de keys del localStorage.
 * Cambiarlos aquí los actualiza en toda la app.
 */
export const storageName = {
  token: "auth_token",
  user: "auth_user",
  companyId: "company_id",
  locale: "app_locale",
} as const;

/**
 * Wrapper seguro de localStorage que funciona en SSR (Next.js).
 */
export const storage = {
  get<T = string>(key: string): T | null {
    if (typeof window === "undefined") return null;
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      // Intenta parsear JSON, si falla devuelve string
      try {
        return JSON.parse(item) as T;
      } catch {
        return item as unknown as T;
      }
    } catch {
      return null;
    }
  },

  set(key: string, value: unknown): void {
    if (typeof window === "undefined") return;
    try {
      const toStore =
        typeof value === "string" ? value : JSON.stringify(value);
      localStorage.setItem(key, toStore);
    } catch (error) {
      console.error("Error guardando en localStorage:", error);
    }
  },

  remove(key: string): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
  },

  clear(): void {
    if (typeof window === "undefined") return;
    localStorage.clear();
  },
};