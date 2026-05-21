import { api } from "@/lib/api/client";
import type { Product, CreateProductDto, UpdateProductDto, ProductFilters } from "@/types/product.types";
import type { PaginatedResponse } from "@/types/api.types";

const BASE_URL = "/products";

// Helper para convertir el DTO a FormData (necesario por la imagen)
function toFormData(data: CreateProductDto | UpdateProductDto): FormData {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, String(value));
      }
    }
  });
  return formData;
}

export const productService = {
  getAll: (filters?: ProductFilters) => {
    const params = new URLSearchParams();
    if (filters?.search) params.set("search", filters.search);
    if (filters?.category_id) params.set("category_id", String(filters.category_id));
    if (filters?.is_active !== undefined) params.set("is_active", String(filters.is_active));
    if (filters?.per_page) params.set("per_page", String(filters.per_page));
    if (filters?.page) params.set("page", String(filters.page));
    
    const query = params.toString();
    return api.get<PaginatedResponse<Product>>(`${BASE_URL}${query ? `?${query}` : ""}`);
  },

  getById: (id: number) =>
    api.get<Product>(`${BASE_URL}/${id}`),

  create: (data: CreateProductDto) => {
    const formData = toFormData(data);
    // Si tienes configurado el Content-Type automático en tu api client, esto bastará.
    // Si no, asegúrate de no setear headers manuales aquí para que el navegador ponge el boundary correcto.
    return api.post<Product>(BASE_URL, formData);
  },

  update: (id: number, data: UpdateProductDto) => {
    const formData = toFormData({ ...data, _method: "PUT" }); // Laravel reconoce _method=PUT en un POST
    return api.post<Product>(`${BASE_URL}/${id}`, formData); // << Tu backend usa POST para actualizar
  },

  delete: (id: number) =>
    api.delete(`${BASE_URL}/${id}`),
};