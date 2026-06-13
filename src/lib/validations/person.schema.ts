import { z } from "zod";

export const updatePersonSchema = z.object({
  name:            z.string().min(1, "El nombre es obligatorio").max(100),
  email:           z.string().email("Correo inválido").optional().or(z.literal("")),
  phone:           z.string().max(20).optional().or(z.literal("")),
  password:        z.string().min(6, "Mínimo 6 caracteres").optional().or(z.literal("")),
  type_document:   z.string().optional(),
  document_number: z.string().max(20).optional().or(z.literal("")),
  address:         z.string().max(200).optional().or(z.literal("")),
  city:            z.string().max(100).optional().or(z.literal("")),
  zip:             z.string().max(10).optional().or(z.literal("")),
  number_prefix:   z.string().optional(),
  is_active:       z.boolean().optional(),
  notes:           z.string().max(500).optional().or(z.literal("")),
   
});

export type UpdatePersonFormValues = z.infer<typeof updatePersonSchema>;