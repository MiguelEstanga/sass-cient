import { useEffect, useCallback } from "react";
 
import { useAuthStore } from "@/stores/auth.store";
import { getEcho } from "@/lib/echo/echo";

export interface ImportProgress {
  id:            number;
  entity:        string;
  status:        "pending" | "processing" | "completed" | "failed";
  total_rows:    number;
  success_rows:  number;
  failed_rows:   number;
  errors:        { row: number; message: string }[];
  error_message: string | null;
}

interface Options {
  onProgress: (data: ImportProgress) => void;
}

export function useImportChannel({ onProgress }: Options) {
  const token     = useAuthStore((s) => s.token);
  const companyId = useAuthStore((s) => s.companyId);

  useEffect(() => {
    if (!token || !companyId) return;

    const echo    = getEcho(token);
    const channel = echo
      .private(`company.${companyId}.imports`)
      .listen(".import.progress", (data: ImportProgress) => {
        onProgress(data);
      });

    // Limpiar al desmontar
    return () => {
      channel.stopListening(".import.progress");
      echo.leave(`company.${companyId}.imports`);
    };
  }, [token, companyId, onProgress]);
}