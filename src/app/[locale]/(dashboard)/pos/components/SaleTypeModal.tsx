"use client";

import { useEffect } from "react";
import styles from "./SaleTypeModal.module.css";
import { useTranslations } from "next-intl";
interface Props {
  open: boolean;
  onSelect: (type: "product" | "service") => void;
  onClose: () => void;
}

export function SaleTypeModal({ open, onSelect, onClose }: Props) {
  const t = useTranslations("pos");
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

  if (!open) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.dialog}>
        <h2 className={styles.title}>¿Qué tipo de venta?</h2>
        <p className={styles.subtitle}>
          Selecciona el tipo de venta para continuar
        </p>

        <div className={styles.cards}>
          <button
            className={styles.card}
            onClick={() => onSelect("product")}
          >
            <span className={styles.cardIcon}>🛒</span>
            <span className={styles.cardLabel}>Venta de Producto</span>
            <span className={styles.cardDesc}>
              Inventario, SKU, stock
            </span>
          </button>

          <button
            className={styles.card}
            onClick={() => onSelect("service")}
          >
            <span className={styles.cardIcon}>✂️</span>
            <span className={styles.cardLabel}>Venta de Servicio</span>
            <span className={styles.cardDesc}>
              Cortes, tratamientos, manicure
            </span>
          </button>
        </div>

        <button className={styles.cancelBtn} onClick={onClose}>
          Cancelar
        </button>
      </div>
    </>
  );
}