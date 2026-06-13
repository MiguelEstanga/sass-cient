import { api } from "@/lib/api/client";

export interface PrefixItem {
  id:         number;
  company_id: number;
  prefix:     string;
}

export interface DocumentItem {
  id:         number;
  company_id: number;
  name:       string;
}

export const configService = {
  //── Prefijos ──────────────────────────────────────────────────────────
  getPrefixes: () =>
    api.get<PrefixItem[]>("config/prefixes"),

  createPrefix: (prefix: string) =>
    api.post<PrefixItem>("config/prefixes", { prefix }),

  deletePrefix: (id: number) =>
    api.delete(`config/prefixes/${id}`),

  //── Documentos ────────────────────────────────────────────────────────
  getDocuments: () =>
    api.get<DocumentItem[]>("config/documents"),

  createDocument: (name: string) =>
    api.post<DocumentItem>("config/documents", { name }),

  deleteDocument: (id: number) =>
    api.delete(`config/documents/${id}`),
};