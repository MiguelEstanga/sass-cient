import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  description: z
    .string()
    .min(3, "La descripción debe tener al menos 3 caracteres")
    .max(255, "Máximo 255 caracteres"),
  amount: z
    .number( )
    .min(0.01, "Debe ser mayor a 0"),
  category_id: z.number().nullable().optional(), // Totalmente opcional
  date: z.string().optional(), // Opcional, si se omite se usará la fecha actual        
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;