"use client";

import { useState } from "react";
import { CreditCard, CheckCircle, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { membershipService } from "@/services/membership/membership.service";
import { useToast } from "@/hooks/useToast";
import { ApiError } from "@/lib/api/errors";
import type { MembershipInvoice } from "@/types/membership.types";
import styles from "./InvoiceCard.module.css";

interface Props {
  invoice:   MembershipInvoice;
  onUpdate:  (updated: MembershipInvoice) => void;
}

const statusConfig: Record<string, {
  label:   string;
  variant: "success" | "warning" | "error" | "default";
  icon:    React.ReactNode;
}> = {
  pending:   { label: "Pendiente",  variant: "warning", icon: <Clock      size={14} /> },
  paid:      { label: "Pagada",     variant: "success", icon: <CheckCircle size={14} /> },
  failed:    { label: "Fallida",    variant: "error",   icon: <XCircle    size={14} /> },
  cancelled: { label: "Cancelada",  variant: "default", icon: <XCircle    size={14} /> },
};

const PAYMENT_OPTIONS = [
  { value: "cash",     label: "💵 Efectivo"     },
  { value: "card",     label: "💳 Tarjeta"      },
  { value: "transfer", label: "🏦 Transferencia" },
];

export function InvoiceCard({ invoice, onUpdate }: Props) {
  const toast                         = useToast();
  const [loading, setLoading]         = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const status = statusConfig[invoice.status] ?? statusConfig.pending;

  async function handlePay() {
    setLoading(true);
    try {
      const updated = await membershipService.payInvoice(invoice.id, paymentMethod);
      onUpdate(updated);
      setShowPayment(false);
      toast.success("Factura pagada — créditos renovados");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Error al pagar");
    } finally {
      setLoading(false);
    }
  }

  const isOverdue = invoice.status === "pending" &&
    new Date(invoice.due_date) < new Date();

  return (
    <div className={`${styles.card} ${isOverdue ? styles.cardOverdue : ""}`}>

      {/* Header */}
      <div className={styles.cardHeader}>
        <div className={styles.iconBox}>
          <CreditCard size={18} />
        </div>
        <Badge variant={status.variant}>
          <span className={styles.statusIcon}>{status.icon}</span>
          {status.label}
        </Badge>
      </div>

      {/* Cliente y plan */}
      <div className={styles.clientRow}>
        <div className={styles.clientAvatar}>
          {invoice.subscription?.client?.name?.charAt(0).toUpperCase() ?? "?"}
        </div>
        <div>
          <p className={styles.clientName}>
            {invoice.subscription?.client?.name ?? "—"}
          </p>
          <p className={styles.planName}>
            {invoice.subscription?.plan?.name ?? "—"}
          </p>
        </div>
      </div>

      {/* Monto */}
      <div className={styles.amountRow}>
        <span className={styles.amountLabel}>Monto</span>
        <span className={styles.amountValue}>
          ${parseFloat(invoice.amount).toFixed(2)}
        </span>
      </div>

      {/* Período */}
      <div className={styles.periodRow}>
        <span className={styles.periodLabel}>Período</span>
        <span className={styles.periodValue}>
          {new Date(invoice.period_start).toLocaleDateString("es", { month: "short", year: "numeric" })}
        </span>
      </div>

      {/* Vencimiento */}
      <div className={`${styles.dueRow} ${isOverdue ? styles.dueOverdue : ""}`}>
        <span className={styles.dueLabel}>
          {isOverdue ? "⚠️ Vencida desde" : "Vence"}
        </span>
        <span className={styles.dueValue}>
          {new Date(invoice.due_date).toLocaleDateString("es")}
        </span>
      </div>

      {/* Fecha de pago si ya se pagó */}
      {invoice.paid_at && (
        <div className={styles.paidRow}>
          <span className={styles.paidLabel}>✅ Pagada el</span>
          <span className={styles.paidValue}>
            {new Date(invoice.paid_at).toLocaleDateString("es")}
          </span>
        </div>
      )}

      {/* Venta relacionada */}
      {invoice.sale && (
        <div className={styles.saleRow}>
          <span className={styles.saleLabel}>Venta #</span>
          <span className={styles.saleValue}>{invoice.sale.id}</span>
        </div>
      )}

      {/* Selector de método de pago */}
      {invoice.status === "pending" && showPayment && (
        <div className={styles.paymentSelector}>
          <p className={styles.paymentLabel}>Método de pago</p>
          <div className={styles.paymentOptions}>
            {PAYMENT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`${styles.paymentBtn} ${
                  paymentMethod === opt.value ? styles.paymentBtnActive : ""
                }`}
                onClick={() => setPaymentMethod(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className={styles.paymentActions}>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowPayment(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              loading={loading}
              onClick={handlePay}
            >
              Confirmar pago
            </Button>
          </div>
        </div>
      )}

      {/* Botón cobrar */}
      {invoice.status === "pending" && !showPayment && (
        <Button
          type="button"
          fullWidth
          onClick={() => setShowPayment(true)}
        >
          💳 Registrar pago
        </Button>
      )}
    </div>
  );
}