import { api } from "@/lib/api/client";
import type { LoginCredentials, LoginResponse } from "@/types/auth.types";

export const authService = {
  login: (credentials: LoginCredentials) =>
    api.post<LoginResponse>("auth/login", credentials, { skipAuth: true }),

  logout: () =>
    api.post<void>("auth/logout"),

  me: () =>
    api.get<LoginResponse>("auth/me"),
};