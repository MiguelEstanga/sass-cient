import { z } from "zod";

export const serviceSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(100),
  description: z.string().max(500).optional().or(z.literal("")),
  duration_minutes: z.number().min(1, "El tiempo es obligatorio").max(100),
  price: z.number().min(1, "El precio es obligatorio").max(100),
  is_active: z.boolean().optional(),
  company_id: z.number().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type ServiceFormValues = z.infer<typeof serviceSchema>;