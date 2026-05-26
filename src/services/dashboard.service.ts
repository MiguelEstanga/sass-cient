import { api } from "@/lib/api/client";
import type { DashboardStats } from "@/types/dashboard.types";

export const dashboardService = {
  getStats: () => api.get<DashboardStats>("dashboard"),
};