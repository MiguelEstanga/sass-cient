import { create } from "zustand";
import { persist } from "zustand/middleware";
import { storage, storageName } from "@/lib/utils/storage";
import type { User, LoginResponse, Prefix, TypeDocument } from "@/types/auth.types";

interface AuthStore {
  token: string | null;
  user: User | null;
  role: string | null;
  companyId: number | null;
  prefixes: Prefix[];
  typeDocuments: TypeDocument[];
  isAuthenticated: boolean;
  _hasHydrated: boolean;

  setAuth: (data: LoginResponse) => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      role: null,
      companyId: null,
      prefixes: [],
      typeDocuments: [],
      isAuthenticated: false,
      _hasHydrated: false,

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      setAuth: (data: LoginResponse) => {
        storage.set(storageName.token, data.access_token);
        storage.set(storageName.companyId, data.company_id);
        set({
          token: data.access_token,
          user: data.user,
          role: data.role,
          companyId: data.company_id,
          prefixes: data.prefixes,
          typeDocuments: data.type_documents,
          isAuthenticated: true,
        });
      },

      logout: () => {
        storage.remove(storageName.token);
        storage.remove(storageName.companyId);
        storage.remove(storageName.user);
        set({
          token: null,
          user: null,
          role: null,
          companyId: null,
          prefixes: [],
          typeDocuments: [],
          isAuthenticated: false,
        });
      },

      hasRole: (role: string) => {
        const { user } = get();
        if (!user) return false;
        return user.roles.some((r) => r.name === role);
      },
    }),
    {
      name: "auth-store",
      // Cuando termine de rehidratar, marca _hasHydrated = true
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        user: state.user,
        role: state.role,
        companyId: state.companyId,
        prefixes: state.prefixes,
        typeDocuments: state.typeDocuments,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);