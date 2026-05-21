import { useState, useCallback } from "react";
import { ApiError, NetworkError } from "@/lib/api/errors";
import { useToast } from "@/hooks/useToast";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: unknown[]) => Promise<T | null>;
  reset: () => void;
}

export function useApi<T>(
  fn: (...args: unknown[]) => Promise<T>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (err: ApiError | Error) => void;
    showErrorToast?: boolean;
    showSuccessToast?: string;
  } = {}
): UseApiReturn<T> {
  const { showErrorToast = true, showSuccessToast, onSuccess, onError } = options;
  const toast = useToast();

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: unknown[]) => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const data = await fn(...args);
        setState({ data, loading: false, error: null });
        if (showSuccessToast) toast.success(showSuccessToast);
        onSuccess?.(data);
        return data;
      } catch (err) {
        const message =
          err instanceof ApiError || err instanceof NetworkError
            ? err.message
            : "Error inesperado";
        setState({ data: null, loading: false, error: message });
        if (showErrorToast) toast.error(message);
        onError?.(err as ApiError | Error);
        return null;
      }
    },
    [fn, showErrorToast, showSuccessToast, onSuccess, onError, toast]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}