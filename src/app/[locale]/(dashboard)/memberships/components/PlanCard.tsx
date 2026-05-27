"use client";

import { Crown, Users, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { DropdownMenu, type DropdownMenuItem } from "@/components/ui/DropdownMenu";
import type { MembershipPlan } from "@/types/membership.types";
import styles from "./PlanCard.module.css";

interface Props {
  plan:      MembershipPlan;
  onEdit:    (plan: MembershipPlan) => void;
  onDelete:  (plan: MembershipPlan) => void;
  onToggle:  (plan: MembershipPlan) => void;
}

const cycleLabel: Record<string, string> = {
  monthly: "/ mes",
  yearly:  "/ año",
};

const benefitLabel: Record<string, string> = {
  credits:  "Créditos",
  discount: "Descuento",
  both:     "Créditos + Descuento",
};

export function PlanCard({ plan, onEdit, onDelete, onToggle }: Props) {
  const items: DropdownMenuItem[] = [
    {
      label:   "Editar plan",
      icon:    <Pencil size={14} />,
      onClick: () => onEdit(plan),
    },
    {
      label:   plan.is_active ? "Desactivar" : "Activar",
      icon:    plan.is_active
        ? <ToggleLeft size={14} />
        : <ToggleRight size={14} />,
      onClick: () => onToggle(plan),
    },
    {
      divider: true,
      label:   "",
      onClick: () => {},
    },
    {
      label:   "Eliminar plan",
      icon:    <Trash2 size={14} />,
      variant: "danger",
      onClick: () => onDelete(plan),
    },
  ];

  return (
    <div className={`${styles.card} ${!plan.is_active ? styles.cardInactive : ""}`}>

      {/* Header */}
      <div className={styles.cardHeader}>
        <div className={styles.iconBox}>
          <Crown size={20} />
        </div>
        <DropdownMenu items={items} />
      </div>

      {/* Nombre y badge */}
      <div className={styles.nameRow}>
        <h3 className={styles.planName}>{plan.name}</h3>
        <Badge variant={plan.is_active ? "success" : "default"}>
          {plan.is_active ? "Activo" : "Inactivo"}
        </Badge>
      </div>

      {/* Precio */}
      <div className={styles.priceRow}>
        <span className={styles.price}>
          ${parseFloat(plan.price).toFixed(2)}
        </span>
        <span className={styles.cycle}>
          {cycleLabel[plan.billing_cycle]}
        </span>
      </div>

      {/* Beneficios */}
      <div className={styles.benefits}>
        <Badge variant="info">{benefitLabel[plan.benefit_type]}</Badge>
        {plan.credits_per_month && (
          <span className={styles.benefitDetail}>
            {plan.credits_per_month} créditos/mes
          </span>
        )}
        {plan.discount_percent && (
          <span className={styles.benefitDetail}>
            {plan.discount_percent}% descuento
          </span>
        )}
      </div>

      {/* Descripción */}
      {plan.description && (
        <p className={styles.description}>{plan.description}</p>
      )}

      {/* Footer — suscripciones activas */}
      <div className={styles.cardFooter}>
        <Users size={13} />
        <span>
          {plan.active_subscriptions_count ?? 0} suscripciones activas
        </span>
      </div>
    </div>
  );
}