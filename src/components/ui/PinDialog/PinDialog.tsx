"use client";

import { useState, useEffect, useRef } from "react";
import { ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import styles from "./PinDialog.module.css";

interface Props {
  open:      boolean;
  title:     string;
  message:   string;
  loading:   boolean;
  error:     string | null;
  onConfirm: (pin: string) => void;
  onCancel:  () => void;
}

export function PinDialog({
  open, title, message, loading, error, onConfirm, onCancel,
}: Props) {
  const [pin, setPin]   = useState(["", "", "", "", "", ""]);
  const refs            = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));

  //Limpiar PIN al abrir
  useEffect(() => {
    if (open) {
      setPin(["", "", "", "", "", ""]);
      setTimeout(() => refs[0].current?.focus(), 100);
    }
  }, [open]);

  // Manejar input de cada dígito
  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);
    // Avanzar al siguiente campo automáticamente
    if (value && index < 5) {
      refs[index + 1].current?.focus();
    }
    // Si completó los 6 dígitos, confirmar automáticamente
    if (value && index === 5) {
      const full = [...newPin.slice(0, 5), value.slice(-1)].join("");
      if (full.length === 6) onConfirm(full);
    }
  }

  // Manejar backspace
  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      refs[index - 1].current?.focus();
    }
  }

  function handleSubmit() {
    const full = pin.join("");
    if (full.length === 6) onConfirm(full);
  }

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.iconBox}>
            <ShieldCheck size={22} />
          </div>
          <button className={styles.closeBtn} onClick={onCancel}>
            <X size={16} />
          </button>
        </div>

        {/* Título y mensaje */}
        <div className={styles.body}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.message}>{message}</p>
        </div>

        {/* Inputs PIN */}
        <div className={styles.pinRow}>
          {pin.map((digit, i) => (
            <input
              key={i}
              ref={refs[i]}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`${styles.pinInput} ${error ? styles.pinInputError : ""}`}
              disabled={loading}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className={styles.error}>{error}</p>
        )}

        {/* Acciones */}
        <div className={styles.actions}>
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            loading={loading}
            onClick={handleSubmit}
            disabled={pin.join("").length < 6}
          >
            Confirmar
          </Button>
        </div>

      </div>
    </div>
  );
}