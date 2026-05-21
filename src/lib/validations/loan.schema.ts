import { z } from "zod";

export const loanSchema = z.object({
    user_id: z.number().min(1),
    category_id: z.number().min(1),
    loan_amount: z.number().min(1),
    interest_rate: z.number().min(1),
    term_months: z.number().min(1),
});

export type LoanFormValues = z.infer<typeof loanSchema>;