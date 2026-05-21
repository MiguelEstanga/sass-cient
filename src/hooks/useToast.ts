import { useToastStore } from "@/stores/toast.store";

export function useToast() {
  const { add, remove, clear, toasts } = useToastStore();

  return {
    toasts,
    success: (message: string, duration?: number) =>
      add(message, "success", duration),
    error: (message: string, duration?: number) =>
      add(message, "error", duration),
    warning: (message: string, duration?: number) =>
      add(message, "warning", duration),
    info: (message: string, duration?: number) =>
      add(message, "info", duration),
    remove,
    clear,
  };
}