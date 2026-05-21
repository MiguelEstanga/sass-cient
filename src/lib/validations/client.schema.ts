import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(100),
  email: z.string().email("Correo inválido").optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
  type_document: z.string().optional(),
  document_number: z.string().max(20).optional().or(z.literal("")),
  address: z.string().max(200).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  number_prefix: z.string().optional(),
});

export type ClientFormValues = z.infer<typeof clientSchema>;