"use client";

import { useToastStore } from "@/stores/toast.store";
import { cn } from "@/lib/utils/cn";
import { X } from "lucide-react";
import styles from "./Toast.module.css";

export function ToastContainer() {
  const { toasts, remove } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(styles.toast, styles[toast.type])}
        >
          <span className={styles.message}>{toast.message}</span>
          <button
            className={styles.close}
            onClick={() => remove(toast.id)}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}