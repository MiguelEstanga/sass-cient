/**
 * Rol con formato Spatie Permission.
 */
export interface Role {
  id: number;
  name: string;
  guard_name: string;
  created_at?: string;
  updated_at?: string;
  pivot?: {
    model_type: string;
    model_id: number;
    role_id: number;
  };
}

/**
 * Usuario autenticado.
 * Basado en el response real de Laravel.
 */
export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  is_active: boolean;
  company_id: number;
  number_prefix: string | null;
  type_document: string | null;
  document_number: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  roles: Role[];
  created_at: string;
  updated_at: string;
}

/**
 * Catálogos globales que vienen en el response del login.
 */
export interface Prefix {
  id: number;
  prefix: string;
}

export interface TypeDocument {
  id: number;
  name: string;
}

/**
 * Response completa del endpoint POST /auth/login
 */
export interface LoginResponse {
  access_token:   string;
  token_type:     string;
  role:           string;
  company_id:     number;
  user:           User;
  prefixes:       Prefix[];
  type_documents: TypeDocument[];
  permissions:    string[]; // ← agregar
}

/**
 * Credenciales que se envían al login.
 */
export interface LoginCredentials {
  email: string;
  password: string;
}