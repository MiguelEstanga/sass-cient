"use client";

import { useState } from "react";
import {
  RefreshCw, XCircle, PauseCircle,
  PlayCircle, History, CreditCard,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { DropdownMenu, type DropdownMenuItem } from "@/components/ui/DropdownMenu";
import { membershipService } from "@/services/membership/membership.service";
import { useToast } from "@/hooks/useToast";
import { ApiError } from "@/lib/api/errors";
import type { MembershipSubscription } from "@/types/membership.types";
import styles from "./SubscriptionCard.module.css";

interface Props {
  subscription: MembershipSubscription;
  onUpdate:     (updated: MembershipSubscription) => void;
  onHistory:    (subscription: MembershipSubscription) => void;
}

const statusConfig: Record<string, {
  label:   string;
  variant: "success" | "warning" | "error" | "default";
}> = {
  active:   { label: "Activa",     variant: "success" },
  paused:   { label: "Pausada",    variant: "warning" },
  cancelled:{ label: "Cancelada",  variant: "error"   },
  past_due: { label: "Vencida",    variant: "error"   },
  expired:  { label: "Expirada",   variant: "default" },
};

export function SubscriptionCard({ subscription, onUpdate, onHistory }: Props) {
  const toast                   = useToast();
  const [loading, setLoading]   = useState(false);

  const status = statusConfig[subscription.status] ?? {
    label: subscription.status, variant: "default" as const,
  };

  // Cambiar estado de la suscripción
  async function handleChangeStatus(newStatus: "active" | "paused" | "cancelled") {
    setLoading(true);
    try {
      const updated = await membershipService.changeStatus(subscription.id, newStatus);
      onUpdate(updated);
      toast.success("Estado actualizado");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Error al actualizar");
    } finally {
      setLoading(false);
    }
  }

  // Renovar créditos manualmente
  async function handleRenew() {
    setLoading(true);
    try {
      const updated = await membershipService.renewCredits(subscription.id);
      onUpdate(updated);
      toast.success("Créditos renovados correctamente");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Error al renovar");
    } finally {
      setLoading(false);
    }
  }

  // Construir items del dropdown según estado
  const menuItems: DropdownMenuItem[] = [
    {
      label:   "Historial de créditos",
      icon:    <History size={14} />,
      onClick: () => onHistory(subscription),
    },
    { divider: true, label: "", onClick: () => {} },
    ...(subscription.status === "active" ? [
      {
        label:   "Renovar créditos",
        icon:    <RefreshCw size={14} />,
        loading: loading,
        onClick: handleRenew,
      },
      {
        label:   "Pausar membresía",
        icon:    <PauseCircle size={14} />,
        onClick: () => handleChangeStatus("paused"),
      },
      {
        label:   "Cancelar membresía",
        icon:    <XCircle size={14} />,
        variant: "danger" as const,
        onClick: () => handleChangeStatus("cancelled"),
      },
    ] : []),
    ...(subscription.status === "paused" ? [
      {
        label:   "Reactivar membresía",
        icon:    <PlayCircle size={14} />,
        variant: "success" as const,
        onClick: () => handleChangeStatus("active"),
      },
      {
        label:   "Cancelar membresía",
        icon:    <XCircle size={14} />,
        variant: "danger" as const,
        onClick: () => handleChangeStatus("cancelled"),
      },
    ] : []),
    ...(subscription.status === "cancelled" ? [
      {
        label:   "Reactivar membresía",
        icon:    <PlayCircle size={14} />,
        variant: "success" as const,
        onClick: () => handleChangeStatus("active"),
      },
    ] : []),
  ];

  // Calcular porcentaje de créditos usados
  const totalCredits = subscription.credits_available + subscription.credits_used;
  const usedPct      = totalCredits > 0
    ? Math.round((subscription.credits_used / totalCredits) * 100)
    : 0;

  return (
    <div className={`${styles.card} ${styles[`status_${subscription.status}`]}`}>

      {/* Header */}
      <div className={styles.cardHeader}>
        <div className={styles.clientInfo}>
          <div className={styles.avatar}>
            {subscription.client?.name.charAt(0).toUpperCase() ?? "?"}
          </div>
          <div>
            <p className={styles.clientName}>
              {subscription.client?.name ?? `Cliente #${subscription.client_id}`}
            </p>
            <p className={styles.clientSub}>
              {subscription.client?.phone ?? subscription.client?.email ?? "—"}
            </p>
          </div>
        </div>
        <DropdownMenu items={menuItems} />
      </div>

      {/* Plan */}
      <div className={styles.planRow}>
        <CreditCard size={14} />
        <span className={styles.planName}>
          {subscription.plan?.name ?? `Plan #${subscription.membership_plan_id}`}
        </span>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      {/* Créditos */}
      {subscription.plan?.benefit_type !== "discount" && (
        <div className={styles.creditsSection}>
          <div className={styles.creditsHeader}>
            <span className={styles.creditsLabel}>Créditos disponibles</span>
            <span className={styles.creditsValue}>
              {subscription.credits_available}
              <span className={styles.creditsTotal}>
                / {totalCredits}
              </span>
            </span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${100 - usedPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Descuento */}
      {subscription.plan?.discount_percent && (
        <div className={styles.discountBadge}>
          🏷️ {subscription.plan.discount_percent}% de descuento activo
        </div>
      )}

      {/* Footer */}
      <div className={styles.cardFooter}>
        <span>
          Inició {new Date(subscription.started_at).toLocaleDateString("es")}
        </span>
        {subscription.next_billing_date && (
          <span>
            Próximo cobro:{" "}
            {new Date(subscription.next_billing_date).toLocaleDateString("es")}
          </span>
        )}
      </div>
    </div>
  );
}