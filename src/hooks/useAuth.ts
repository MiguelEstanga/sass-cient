import { useAuthStore } from "@/stores/auth.store";

export function useAuth() {
  const store = useAuthStore();
  return {
    user: store.user,
    role: store.role,
    companyId: store.companyId,
    isAuthenticated: store.isAuthenticated,
    prefixes: store.prefixes,
    typeDocuments: store.typeDocuments,
    hasRole: store.hasRole,
    logout: store.logout,
  };
}