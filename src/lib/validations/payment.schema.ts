import { z } from "zod";

export const paymentSchema = z.object({
  loan_id: z.number().min(1),
  payment_number: z.number().min(1),
  payment_amount: z.number().min(1),
  payment_date: z.string().min(1),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;