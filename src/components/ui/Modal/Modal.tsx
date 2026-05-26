"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import styles from "./Modal.module.css";

interface DrawerProps {
  open:      boolean;
  onClose:   () => void;
  title:     string;
  subtitle?: string;
  children:  React.ReactNode;
  width?:    string;
}

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  width = "480px",
}: DrawerProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(styles.overlay, open && styles.overlayVisible)}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(styles.drawer, open && styles.drawerOpen)}
        style={{ width }}
      >
        {/* Header — siempre visible para la animación */}
        <div className={styles.drawerHeader}>
          <div>
            <h2 className={styles.drawerTitle}>{title}</h2>
            {subtitle && (
              <p className={styles.drawerSubtitle}>{subtitle}</p>
            )}
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* ── Solo renderizar children cuando está abierto ──────────────
            Esto evita el problema de <form> anidado porque el ClientForm
            dentro del ClientSelector no existe en el DOM cuando está cerrado */}
        <div className={styles.drawerBody}>
          {open ? children : null}
        </div>
      </div>
    </>
  );
}