"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import styles from "./RecordPaymentModal.module.css";

const paymentSchema = z.object({
  interest_paid:  z.number().min(0),
  principal_paid: z.number().min(0),
  payment_date:   z.string().min(1, "La fecha es obligatoria"),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface EditingData {
  id:             number;
  interest_paid:  string;
  principal_paid: string;
  payment_date:   string;
}

interface Props {
  open:             boolean;
  onClose:          () => void;
  onConfirm:        (
    interestPaid:     number,
    principalPaid:    number,
    expectedInterest: number,
    date:             string,
    paymentId?:       number
  ) => Promise<void>;
  isSubmitting?:    boolean;
  loanInterestRate: number; // % ej: 5.5
  loanAmount:       number; // monto original
  editingData?:     EditingData | null;
}

export function RecordPaymentModal({
  open,
  onClose,
  onConfirm,
  isSubmitting,
  loanInterestRate,
  loanAmount,
  editingData,
}: Props) {
  const isEditing = !!editingData;

  // ── Calcular interés esperado ─────────────────────────────────────────
  const expectedInterest = parseFloat(
    ((loanAmount * loanInterestRate) / 100).toFixed(2)
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      interest_paid:  expectedInterest,
      principal_paid: 0,
      payment_date:   new Date().toISOString().split("T")[0],
    },
  });

  // ── Precargar datos al editar ──────────────────────────────────────────
  useEffect(() => {
    if (editingData) {
      reset({
        interest_paid:  parseFloat(editingData.interest_paid),
        principal_paid: parseFloat(editingData.principal_paid),
        payment_date:   editingData.payment_date.slice(0, 10),
      });
    } else {
      reset({
        interest_paid:  expectedInterest,
        principal_paid: 0,
        payment_date:   new Date().toISOString().split("T")[0],
      });
    }
  }, [editingData, open, reset, expectedInterest]);

  // ── Cerrar con Escape ─────────────────────────────────────────────────
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

  const interestPaid  = watch("interest_paid")  ?? 0;
  const principalPaid = watch("principal_paid") ?? 0;
  const totalPayment  = (Number(interestPaid) + Number(principalPaid)).toFixed(2);

  async function onSubmit(values: PaymentFormValues) {
    await onConfirm(
      values.interest_paid,
      values.principal_paid,
      expectedInterest,
      values.payment_date,
      editingData?.id,
    );
  }

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.dialog}>

        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            {isEditing ? "Editar pago" : "Registrar pago"}
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <p className={styles.subtitle}>
          {isEditing
            ? "Modifica los datos del pago"
            : "Registra un nuevo abono al préstamo"}
        </p>

        {/* Info del préstamo */}
        <div className={styles.infoRow}>
          <div className={styles.infoBox}>
            <span className={styles.infoLabel}>Monto préstamo</span>
            <span className={styles.infoValue}>${loanAmount.toFixed(2)}</span>
          </div>
          <div className={styles.infoBox}>
            <span className={styles.infoLabel}>Tasa de interés</span>
            <span className={styles.infoValue}>{loanInterestRate}%</span>
          </div>
          <div className={styles.infoBox}>
            <span className={styles.infoLabel}>Interés esperado</span>
            <span className={styles.infoValue}>${expectedInterest.toFixed(2)}</span>
          </div>
        </div>

        {/* Formulario */}
        <div className={styles.form}>
          <Input
            label="Interés pagado"
            type="number"
            step="0.01"
            fullWidth
            hint={`Interés esperado: $${expectedInterest.toFixed(2)}`}
            error={errors.interest_paid?.message}
            {...register("interest_paid", { valueAsNumber: true })}
          />

          <Input
            label="Capital pagado"
            type="number"
            step="0.01"
            fullWidth
            hint="Monto que reduce el capital del préstamo"
            error={errors.principal_paid?.message}
            {...register("principal_paid", { valueAsNumber: true })}
          />

          <Input
            label="Fecha del pago"
            type="date"
            fullWidth
            error={errors.payment_date?.message}
            {...register("payment_date")}
          />

          {/* Total calculado */}
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Total del pago</span>
            <span className={styles.totalValue}>${totalPayment}</span>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            loading={isSubmitting}
            onClick={handleSubmit(onSubmit)}
          >
            {isEditing ? "Guardar cambios" : "Registrar pago"}
          </Button>
        </div>
      </div>
    </>
  );
}