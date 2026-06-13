import { apiClient } from "@/lib/api/client";
import { storage, storageName } from "@/lib/utils/storage";

export interface ImportResults {
  import_job_id: number;
  status: string;
}

export const importService = {
  // Importar clientes desde archivo
  importClients: (file: File): Promise<ImportResults> => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient<ImportResults>("import/clients", {
      method: "POST",
      formData,
    });
  },

  // Descargar template Excel de clientes
  downloadClientTemplate: async (): Promise<void> => {
    const token = storage.get<string>(storageName.token);
    const companyId = storage.get<string>(storageName.companyId);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}import/clients/template`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "company-id": String(companyId ?? "1"),
          Accept:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      },
    );

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "template_clientes.xlsx";
    link.click();
    URL.revokeObjectURL(url);
  },

  // Importar tipos de documento
  importTypeDocuments: (file: File): Promise<ImportResults> => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient<ImportResults>("import/type-documents", {
      method: "POST",
      formData,
    });
  },

  // Descargar template de tipos de documento
  downloadTypeDocumentTemplate: async (): Promise<void> => {
    const token = storage.get<string>(storageName.token);
    const companyId = storage.get<string>(storageName.companyId);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}import/type-documents/template`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "company-id": String(companyId ?? "1"),
        },
      },
    );

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "template_documentos.xlsx";
    link.click();
    URL.revokeObjectURL(url);
  },
};
