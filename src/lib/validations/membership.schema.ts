import { z } from "zod";

export const planSchema = z.object({
  name:               z.string().min(1, "El nombre es obligatorio").max(100),
  description:        z.string().optional().or(z.literal("")),
  price:              z.number().min(0),
  benefit_type:       z.enum(["credits", "discount", "both"]),
  credits_per_month:  z.number().min(0).optional(),
  discount_percent:   z.number().min(0).max(100).optional(),
  billing_cycle:      z.enum(["monthly", "yearly"]),
  is_active:          z.boolean().optional(),
  sort_order:         z.number().optional(),
}).refine((data) => {
  if (data.benefit_type === "credits" || data.benefit_type === "both") {
    return !!data.credits_per_month && data.credits_per_month > 0;
  }
  return true;
}, { message: "Especifica los créditos mensuales", path: ["credits_per_month"] })
.refine((data) => {
  if (data.benefit_type === "discount" || data.benefit_type === "both") {
    return !!data.discount_percent && data.discount_percent > 0;
  }
  return true;
}, { message: "Especifica el porcentaje de descuento", path: ["discount_percent"] });

export type PlanFormValues = z.infer<typeof planSchema>;

export const subscriptionSchema = z.object({
  client_id:          z.number(),
  membership_plan_id: z.number(),
  billing_type:       z.enum(["automatic", "manual"]),
  started_at:         z.string().optional(),
  notes:              z.string().optional().or(z.literal("")),
});

export type SubscriptionFormValues = z.infer<typeof subscriptionSchema>;