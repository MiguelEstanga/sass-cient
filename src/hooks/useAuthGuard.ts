import { useEffect } from "react";
import { useRouter } from "@/lib/i18n/routing";
import { useAuthStore } from "@/stores/auth.store";

interface Options {
  /** Rol requerido para acceder a la página */
  requiredRole?: string;
  /** Ruta a redirigir si no tiene acceso (default: /login) */
  redirectTo?: string;
}

export function useAuthGuard(options: Options = {}) {
  const { requiredRole, redirectTo = "/login" } = options;
  const router = useRouter();
  const { isAuthenticated, hasRole, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (requiredRole && !hasRole(requiredRole)) {
      router.replace("/dashboard"); // Sin permisos → al dashboard
    }
  }, [isAuthenticated, requiredRole, hasRole, router, redirectTo]);

  return { isAuthenticated, user, hasRole };
}