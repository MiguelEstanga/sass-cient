"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/TextArea";
import { Button } from "@/components/ui/Button";
import { ClientSelector } from "@/components/ui/post/ClientSelector";
import { useLocalCache } from "@/hooks/useLocalCache";
import { membershipService } from "@/services/membership/membership.service";
import {
  subscriptionSchema,
  type SubscriptionFormValues,
} from "@/lib/validations/membership.schema";
import type { Client } from "@/types/client.types";
import type { MembershipPlan } from "@/types/membership.types";
import styles from "./PlanForm.module.css";

interface Props {
  onSubmit:      (values: SubscriptionFormValues) => Promise<void>;
  onCancel:      () => void;
  isSubmitting?: boolean;
}

const BILLING_OPTIONS = [
  { value: "manual",    label: "Manual (el admin renueva)" },
  { value: "automatic", label: "Automático (Stripe Billing)" },
];

export function SubscribeForm({ onSubmit, onCancel, isSubmitting }: Props) {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Cargar planes activos
  const { rows: plans } = useLocalCache<MembershipPlan>(
    useCallback((p) => membershipService.getPlans(p), []),
    { keyField: "id", blockSize: 100, pageSize: 50 }
  );

  const activePlans = plans.filter((p) => p.is_active);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      billing_type: "manual",
      started_at:   new Date().toISOString().split("T")[0],
    },
  });

  return (
    <div className={styles.form}>

      {/* Cliente */}
      <div>
        <label className={styles.checkRow} style={{ marginBottom: 6 }}>
          Cliente <span style={{ color: "var(--color-error)" }}>*</span>
        </label>
        <ClientSelector
          selectedClient={selectedClient}
          onSelect={(c) => { setSelectedClient(c); setValue("client_id", c.id); }}
          onClear={() => { setSelectedClient(null); setValue("client_id", undefined as any); }}
        />
        {errors.client_id && (
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-error)", marginTop: 4 }}>
            {errors.client_id.message}
          </p>
        )}
      </div>

      {/* Plan */}
      <Select
        label="Plan de membresía"
        options={activePlans.map((p) => ({
          value: p.id,
          label: `${p.name} — $${parseFloat(p.price).toFixed(2)}/${p.billing_cycle === "monthly" ? "mes" : "año"}`,
        }))}
        placeholder="Seleccionar plan..."
        fullWidth
        required
        error={errors.membership_plan_id?.message}
        {...register("membership_plan_id", { valueAsNumber: true })}
      />

      {/* Tipo de cobro */}
      <Select
        label="Tipo de cobro"
        options={BILLING_OPTIONS}
        fullWidth
        error={errors.billing_type?.message}
        {...register("billing_type")}
      />

      {/* Fecha de inicio */}
      <Input
        label="Fecha de inicio"
        type="date"
        fullWidth
        error={errors.started_at?.message}
        {...register("started_at")}
      />

      {/* Notas */}
      <TextArea
        label="Notas internas"
        placeholder="Observaciones sobre la suscripción..."
        fullWidth
        {...register("notes")}
      />

      <div className={styles.footer}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="button"
          loading={isSubmitting}
          onClick={handleSubmit(onSubmit)}
        >
          Suscribir cliente
        </Button>
      </div>
    </div>
  );
}