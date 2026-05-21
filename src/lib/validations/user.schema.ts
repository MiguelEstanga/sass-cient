import { z } from "zod";

export const updateEmployeeSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(100),
  email: z.string().email("Correo inválido"),
  phone: z.string().max(20).optional().or(z.literal("")),
  password: z
    .string()
    .min(6, "Mínimo 6 caracteres")
    .optional()
    .or(z.literal("")),
  type_document: z.string().optional(),
  document_number: z.string().max(20).optional().or(z.literal("")),
  address: z.string().max(200).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  zip: z.string().max(10).optional().or(z.literal("")),
  number_prefix: z.string().optional(),
  is_active: z.boolean().optional(),
  role_id: z.any().optional(),
});

export type UpdateEmployeeFormValues = z.infer<typeof updateEmployeeSchema>;