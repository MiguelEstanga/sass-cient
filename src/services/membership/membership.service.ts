import { api } from "@/lib/api/client";
import type {
  MembershipPlan,
  MembershipSubscription,
  CreditLog,
  CreatePlanDto,
  CreateSubscriptionDto,
  SubscriptionStatus,
} from "@/types/membership.types";
import type { PaginatedResponse } from "@/types/api.types";

const PLANS = "memberships/plans";
const SUBS = "memberships/subscriptions";

export const membershipService = {
  // ── Planes ────────────────────────────────────────────────────────────
  getPlans: (params?: {
    search?: string;
    per_page?: number;
    page?: number;
  }) => {
    const p = new URLSearchParams();
    if (params?.search) p.set("search", params.search);
    if (params?.per_page) p.set("per_page", String(params.per_page));
    if (params?.page) p.set("page", String(params.page));
    const q = p.toString();
    return api.get<PaginatedResponse<MembershipPlan>>(
      `${PLANS}${q ? `?${q}` : ""}`,
    );
  },

  createPlan: (data: CreatePlanDto) => api.post<MembershipPlan>(PLANS, data),

  updatePlan: (id: number, data: Partial<CreatePlanDto>) =>
    api.put<MembershipPlan>(`${PLANS}/${id}`, data),

  deletePlan: (id: number) => api.delete(`${PLANS}/${id}`),

  // ── Suscripciones ─────────────────────────────────────────────────────
  getSubscriptions: (params?: {
    search?: string;
    status?: string;
    per_page?: number;
    page?: number;
  }) => {
    const p = new URLSearchParams();
    if (params?.search) p.set("search", params.search);
    if (params?.status) p.set("status", params.status);
    if (params?.per_page) p.set("per_page", String(params.per_page));
    if (params?.page) p.set("page", String(params.page));
    const q = p.toString();
    return api.get<PaginatedResponse<MembershipSubscription>>(
      `${SUBS}${q ? `?${q}` : ""}`,
    );
  },

  subscribe: (data: CreateSubscriptionDto) =>
    api.post<MembershipSubscription>(SUBS, data),

  changeStatus: (id: number, status: SubscriptionStatus) =>
    api.patch<MembershipSubscription>(`${SUBS}/${id}/status`, { status }),

  renewCredits: (id: number) =>
    api.post<MembershipSubscription>(`${SUBS}/${id}/renew`, {}),

  getCreditHistory: (id: number) =>
    api.get<CreditLog[]>(`${SUBS}/${id}/credits`),

  getClientMembership: (clientId: number) =>
    api.get<MembershipSubscription | null>(`memberships/client/${clientId}`),
};
