import { api } from "@/lib/api/client";
import { Roles } from "@/types/roles.types";

export const roleService = {
  getAll: () => {
    return api.get<Roles[]>("roles");
  },
};
