import { useAuthStore } from "@/stores/auth.store";

export function useRole() {
  const role        = useAuthStore((s) => s.role);
  const permissions = useAuthStore((s) => s.permissions);

 //Función helper para verificar permiso
  const can = (permission: string) => permissions.includes(permission);

  const isAdmin    = role === "admin";
  const isEmployee = role === "employee";

  return {
    role,
    isAdmin,
    isEmployee,
    can, // ← uso directo: can("clients.delete")

    clients: {
      canView:   can("clients.view"),
      canCreate: can("clients.create"),
      canEdit:   can("clients.edit"),
      canDelete: can("clients.delete"),
    },

    users: {
      canView:   can("users.view"),
      canCreate: can("users.create"),
      canEdit:   can("users.edit"),
      canDelete: can("users.delete"),
    },

    appointments: {
      canView:         can("appointments.view"),
      canCreate:       can("appointments.create"),
      canEdit:         can("appointments.edit"),
      canDelete:       can("appointments.delete"),
      canChangeStatus: can("appointments.view"),
    },

    sessions: {
      canView:   can("sessions.view"),
      canManage: can("sessions.manage"),
    },

    pos: {
      canAccess:          can("pos.access"),
      canApplyMembership: can("pos.apply_membership"),
    },

    products: {
      canView:   can("products.view"),
      canCreate: can("products.create"),
      canEdit:   can("products.edit"),
      canDelete: can("products.delete"),
    },

    services: {
      canView:   can("services.view"),
      canCreate: can("services.create"),
      canEdit:   can("services.edit"),
      canDelete: can("services.delete"),
    },

    memberships: {
      canView:   can("memberships.view"),
      canCreate: can("memberships.create"),
      canEdit:   can("memberships.edit"),
      canDelete: can("memberships.delete"),
    },

    finance: {
      canView:   can("finance.view"),
      canCreate: can("finance.create"),
      canEdit:   can("finance.edit"),
      canDelete: can("finance.delete"),
    },

    dashboard: {
      canView: can("dashboard.view"),
    },

    settings: {
      canView:        isAdmin,
      canChangePin:   can("pin.change"),
      canManageRoles: can("roles.manage"),
    },
  };
}