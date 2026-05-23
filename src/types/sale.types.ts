export interface Sale {
  id: number;
  company_id: number;
  client_id: number | null;
  customer_id: number | null; // Viene en tu JSON
  seller_id: number;
  user_id: number;
  subtotal: string;
  tax: string;
  total: string;
  payment_method: string;
  source: string; // 'pos', 'ecommerce'
  type: string; // 'service', 'product'
  cash_session_id: number;
  status: string;
  payment_status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  
  // Relaciones
  items?: SaleItem[];
  user?: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
  };
  client?: {
    id: number;
    name: string;
    phone?: string;
    email?: string;
    type_document?: string;
    document_number?: string;
    address?: string;
    city?: string;
  };
}

export interface SaleItem {
  id:             number;
  sale_id:        number;
  product_id:     number | null;
  service_id:     number | null;
  quantity:       number;
  unit_price:     string;
  subtotal:       string;
  status:         string;
  performance_id: number | null;
  started_at:     string | null;
  finished_at:    string | null;

  // ── Relaciones ───────────────────────────────────────────────────────
  product?: {
    id:         number;
    name:       string;
    image_url?: string;
  };
  service?: {
    id:   number;
    name: string;
  };
  performer?: {
    id:    number;
    name:  string;
    email?: string;
    phone?: string;
  };
}

export interface SaleFilters {
  search?: string;
  type?: string;
  status?: string;
  payment_method?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}