export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  image?: string;
}

export interface Product {
  id: number;
  company_id: number;
  name: string;
  barcode: string | null;
  price: string; // Laravel devuelve string
  stock: number;
  is_active: boolean;
  category_id: number;
  description: string | null;
  image: string | null;
  images: string | null;
  cost_price: string; // Laravel devuelve string
  discount: string; // Laravel devuelve string
  min_stock: number;
  image_url: string | null;
  category: ProductCategory | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProductDto {
  name: string;
  description?: string | null;
  category_id: number;
  barcode?: string | null;
  price: number;
  cost_price: number;
  stock: number;
  min_stock: number;
  discount: number;
  is_active?: boolean;
  image?: File | null;
}

export interface UpdateProductDto extends Partial<Omit<CreateProductDto, 'image'>> {
  image?: File | null;
  _method?: string; // Para simular PUT en Laravel mediante POST
}

export interface ProductFilters {
  search?: string;
  category_id?: number;
  is_active?: boolean;
  page?: number;
  per_page?: number;
}