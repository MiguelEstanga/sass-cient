import { storage, storageName } from "@/lib/utils/storage";

// ── Tipos ──────────────────────────────────────────────────────────────────
export type ExportEntity = "clients" | "products" | "services";
export type ExportFormat = "xlsx" | "csv";

export interface ExportFilters {
  format?:    ExportFormat;
  date_from?: string;
  date_to?:   string;
  today?:     boolean;
  last?:      number;
}

// Nombres de archivo por entidad y formato
const FILE_NAMES: Record<ExportEntity, Record<ExportFormat, string>> = {
  clients:  { xlsx: "clientes.xlsx",  csv: "clientes.csv"  },
  products: { xlsx: "productos.xlsx", csv: "productos.csv" },
  services: { xlsx: "servicios.xlsx", csv: "servicios.csv" },
};

// ── Función base de descarga ───────────────────────────────────────────────
async function downloadExport(
  entity:  ExportEntity,
  filters: ExportFilters = {}
): Promise<void> {
  const token     = storage.get<string>(storageName.token);
  const companyId = storage.get<string>(storageName.companyId);
  const format    = filters.format ?? "xlsx";

  // Construir query params
  const params = new URLSearchParams();
  params.set("format", format);
  if (filters.date_from) params.set("date_from", filters.date_from);
  if (filters.date_to)   params.set("date_to",   filters.date_to);
  if (filters.today)     params.set("today",      "1");
  if (filters.last)      params.set("last",       String(filters.last));

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}export/${entity}?${params}`,
    {
      headers: {
        Authorization: `Bearer ${token ?? ""}`,
        "company-id":  String(companyId ?? "1"),
        Accept:        format === "csv"
          ? "text/csv"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message ?? "Error al exportar");
  }

  // Descargar el archivo
  const blob     = await response.blob();
  const url      = URL.createObjectURL(blob);
  const link     = document.createElement("a");
  link.href      = url;
  link.download  = FILE_NAMES[entity][format];
  link.click();
  URL.revokeObjectURL(url);
}

// ── Exportar por entidad ───────────────────────────────────────────────────
export const exportService = {
  clients:  (filters?: ExportFilters) => downloadExport("clients",  filters),
  products: (filters?: ExportFilters) => downloadExport("products", filters),
  services: (filters?: ExportFilters) => downloadExport("services", filters),
};