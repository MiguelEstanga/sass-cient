import { z } from "zod";

export const productSchema = z.object({
    name: z.string().min(1, "El nombre es obligatorio").max(100),
    description: z.string().max(500).optional().or(z.literal("")),
    category_id: z.number().optional(),
    barcode: z.string().max(20).optional().or(z.literal("")),
    price: z.number().min(1, "El precio es obligatorio").max(100),
    cost_price: z.number().min(1, "El precio es obligatorio").max(100),
    stock: z.number().min(1, "El stock es obligatorio").max(100),
    min_stock: z.number().min(1, "El stock es obligatorio").max(100),
    discount: z.number().min(1, "El descuento es obligatorio").max(100),
    is_active: z.boolean().optional(),
    image: z.instanceof(File).optional(),
    company_id: z.number().optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;