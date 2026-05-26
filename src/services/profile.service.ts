import { api } from "@/lib/api/client";
import type { Employee } from "@/types/user.types";

export const profileService = {
  get: () =>
    api.get<Employee>("profile"),

  update: (data: {
    name?:            string;
    phone?:           string;
    password?:        string;
    type_document?:   string;
    document_number?: string;
    address?:         string;
    city?:            string;
    zip?:             string;
    number_prefix?:   string;
  }) => api.patch<Employee>("profile", data),
};