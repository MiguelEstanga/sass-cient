import { z } from "zod";

export const financeCategorySchema = z.object({
    name: z.string().min(1, "El nombre es requerido").max(255, "El nombre no puede exceder 255 caracteres"),
    description: z.string().max(255, "El nombre no puede exceder 255 caracteres"),
    type: z.enum(["loan", "payment", "other"]),
    is_active: z.boolean(),
});

export type FinanceCategoryFormValues = z.infer<typeof financeCategorySchema>;