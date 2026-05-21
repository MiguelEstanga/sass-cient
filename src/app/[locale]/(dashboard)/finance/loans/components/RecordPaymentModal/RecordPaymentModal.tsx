"use client";

import { useState, useEffect } from "react"; // <-- Agregar useEffect
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import styles from "./RecordPaymentModal.module.css";

interface Props {
  open: boolean;
  onClose: () => void;
  loanInterestRate: number;
  loanAmount: number;
  editingData?: { // <-- NUEVO: Datos para editar
    id: number;
    interest_paid: string;
    principal_paid: string;
    payment_date: string;
  } | null;
  onConfirm: (interestPaid: number, principalPaid: number, expectedInterest: number, date: string, id?: number) => void;
  isSubmitting: boolean;
}

export function RecordPaymentModal({ open, onClose, loanInterestRate, loanAmount, editingData, onConfirm, isSubmitting }: Props) {
  const [interestPaid, setInterestPaid] = useState("");
  const [principalPaid, setPrincipalPaid] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const expectedInterest = parseFloat((loanAmount * (loanInterestRate / 100)).toFixed(2));
  const totalToPay = (parseFloat(interestPaid || "0") + parseFloat(principalPaid || "0"));

  // <-- NUEVO: Rellenar campos si estamos editando
  useEffect(() => {
    if (editingData) {
      setInterestPaid(editingData.interest_paid);
      setPrincipalPaid(editingData.principal_paid);
      setDate(editingData.payment_date);
    } else {
      setInterestPaid("");
      setPrincipalPaid("");
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [editingData, open]);

  if (!open) return null;

  function handleConfirm() {
    if (totalToPay > 0) {
      onConfirm(
        parseFloat(interestPaid || "0"), 
        parseFloat(principalPaid || "0"), 
        expectedInterest, 
        date,
        editingData?.id // <-- Pasar el ID si existe
      );
      setInterestPaid("");
      setPrincipalPaid("");
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>
          {editingData ? "Editar Abono" : "Registrar Abono"}
        </h3>
        
        <div className={styles.infoBox}>
          <span>Deuda actual: <strong>${loanAmount.toFixed(2)}</strong></span>
          <span>Réditos base: <strong>${expectedInterest.toFixed(2)}</strong></span>
        </div>

        <div className={styles.form}>
          <Input
            label="Monto para Réditos"
            type="number"
            step="0.01"
            placeholder="Ej: 50.00"
            fullWidth
            value={interestPaid}
            onChange={(e) => setInterestPaid(e.target.value)}
          />
          <Input
            label="Monto para Abono a Capital"
            type="number"
            step="0.01"
            placeholder="Ej: 50.00"
            fullWidth
            value={principalPaid}
            onChange={(e) => setPrincipalPaid(e.target.value)}
          />
          <Input label="Fecha de pago" type="date" fullWidth value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        <div className={styles.actions}>
          <Button variant="secondary" fullWidth onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
          <Button fullWidth onClick={handleConfirm} loading={isSubmitting} disabled={totalToPay <= 0}>
            {editingData ? "Guardar Cambios" : `Confirmar ($${totalToPay.toFixed(2)})`}
          </Button>
        </div>
      </div>
    </div>
  );
}