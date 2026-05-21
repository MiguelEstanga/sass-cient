"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SkeletonRow } from "@/components/ui/Skeleton";
import { loanPaymentService } from "@/services/finance/loanPayment.service";
import { useToast } from "@/hooks/useToast";
import { useConfirm } from "@/hooks/useConfirm";
import { ApiError } from "@/lib/api/errors";
import type { LoanPayment } from "@/types/finance/payment.types";
import styles from "./LoanRecordContent.module.css";
import { ConfirmDialog } from "@/components/ui/Modal";

interface Props {
  loanId: number;
  initialDebt: string;
  refreshKey: number; // <-- NUEVO: Para forzar refresco
  onEditPayment: (payment: LoanPayment) => void; // <-- NUEVO
}

export function LoanRecordContent({ loanId, initialDebt, refreshKey, onEditPayment }: Props) {
  const toast = useToast();
  const { confirm, dialogProps } = useConfirm();
  
  const [payments, setPayments] = useState<LoanPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // El useEffect ahora depende de 'loanId' y de 'refreshKey'
  useEffect(() => {
    if (loanId) {
      setLoading(true);
      loanPaymentService.getByLoan(loanId).then((res) => {
        setPayments(Array.isArray(res) ? res : []);
      }).catch(() => setPayments([]))
      .finally(() => setLoading(false));
    }
  }, [loanId, refreshKey]); // <-- Aquí está la magia del refresco

  const totalPaid = payments.reduce((acc, p) => acc + parseFloat(p.payment_amount || "0"), 0);
  const totalInterestPaid = payments.reduce((acc, p) => acc + parseFloat(p.interest_paid || "0"), 0);
  const totalPrincipalPaid = payments.reduce((acc, p) => acc + parseFloat(p.principal_paid || "0"), 0);

  function handleDelete(id: number, num: number) {
    confirm({
      title: "Eliminar pago",
      message: `¿Estás seguro de eliminar el pago #${num}? Esto reversará los montos.`,
      onConfirm: async () => {
        setDeletingId(id);
        try {
          await loanPaymentService.delete(id);
          toast.success("Pago eliminado");
          // Refrescar la lista localmente sin cerrar el panel
          setPayments((prev) => prev.filter((p) => p.id !== id));
        } catch (err) {
          toast.error(err instanceof ApiError ? err.message : "Error al eliminar");
        } finally {
          setDeletingId(id);
        }
      },
    });
  }

  return (
    <>
      <div className={styles.container}>
        
        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Deuda Inicial</span>
            <strong className={styles.summaryValue}>${parseFloat(initialDebt).toFixed(2)}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Total Entregado</span>
            <strong className={styles.summaryValue} style={{ color: "var(--color-success)" }}>${totalPaid.toFixed(2)}</strong>
          </div>
          <div className={styles.summaryItem} style={{ borderBottom: "none" }}>
            <span className={styles.summaryLabel}>Detalle</span>
            <div className={styles.detailBreakdown}>
              <Badge variant="warning">Réditos: ${totalInterestPaid.toFixed(2)}</Badge>
              <Badge variant="success" >Capital: ${totalPrincipalPaid.toFixed(2)}</Badge>
            </div>
          </div>
        </div>

        <h4 className={styles.listTitle}>Historial de Pagos</h4>

        {loading ? (
          <div className={styles.paymentsList}>{Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}</div>
        ) : payments.length === 0 ? (
          <p className={styles.empty}>No hay pagos registrados aún.</p>
        ) : (
          <div className={styles.paymentsList}>
            {payments.map((payment) => (
              <div key={payment.id} className={styles.paymentCard}>
                <div className={styles.paymentHeader}>
                  <span className={styles.paymentNum}>Pago #{payment.payment_number}</span>
                  <span className={styles.paymentDate}>{new Date(payment.payment_date).toLocaleDateString()}</span>
                </div>
                
                <div className={styles.paymentBreakdown}>
                  <div className={styles.breakdownItem}>
                    <span>Réditos</span>
                    <Badge variant="warning" >
                      ${parseFloat(payment.interest_paid || "0").toFixed(2)}
                    </Badge>
                  </div>
                  <div className={styles.breakdownItem}>
                    <span>Abono Capital</span>
                    <Badge variant="success" >
                      ${parseFloat(payment.principal_paid || "0").toFixed(2)}
                    </Badge>
                  </div>
                </div>

                <div className={styles.paymentFooter}>
                  <div className={styles.paymentTotal}>
                    Total: <strong>${parseFloat(payment.payment_amount).toFixed(2)}</strong>
                  </div>
                  
                  {/* NUEVOS BOTONES */}
                  <div className={styles.paymentActions}>
                    <Button variant="ghost" size="sm" onClick={() => onEditPayment(payment)}>Editar</Button>
                    <Button variant="danger" size="sm" loading={deletingId === payment.id} onClick={() => handleDelete(payment.id, payment.payment_number)}>
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Dialog para eliminar */}
      <ConfirmDialog {...dialogProps} confirmLabel="Sí, eliminar" />
    </>
  );
}