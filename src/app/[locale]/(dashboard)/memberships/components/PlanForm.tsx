"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { TextArea } from "@/components/ui/TextArea";
import { Button } from "@/components/ui/Button";
import { planSchema, type PlanFormValues } from "@/lib/validations/membership.schema";
import type { MembershipPlan } from "@/types/membership.types";
import styles from "./PlanForm.module.css";

interface Props {
  defaultValues?: Partial<MembershipPlan>;
  onSubmit:       (values: PlanFormValues) => Promise<void>;
  onCancel:       () => void;
  isSubmitting?:  boolean;
}

const BENEFIT_OPTIONS = [
  { value: "credits",  label: "Créditos mensuales" },
  { value: "discount", label: "Porcentaje de descuento" },
  { value: "both",     label: "Créditos + Descuento" },
];

const CYCLE_OPTIONS = [
  { value: "monthly", label: "Mensual" },
  { value: "yearly",  label: "Anual"   },
];

export function PlanForm({ defaultValues, onSubmit, onCancel, isSubmitting }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<PlanFormValues>({
    resolver:      zodResolver(planSchema),
    defaultValues: {
      benefit_type:  "credits",
      billing_cycle: "monthly",
      is_active:     true,
      sort_order:    0,
    },
  });

  const benefitType = watch("benefit_type");

  useEffect(() => {
    if (defaultValues) {
      reset({
        name:              defaultValues.name              ?? "",
        description:       defaultValues.description       ?? "",
        price:             parseFloat(defaultValues.price ?? "0"),
        benefit_type:      defaultValues.benefit_type      ?? "credits",
        credits_per_month: defaultValues.credits_per_month ?? undefined,
        discount_percent:  defaultValues.discount_percent
          ? parseFloat(String(defaultValues.discount_percent))
          : undefined,
        billing_cycle:     defaultValues.billing_cycle     ?? "monthly",
        is_active:         defaultValues.is_active         ?? true,
        sort_order:        defaultValues.sort_order        ?? 0,
      });
    }
  }, [defaultValues, reset]);

  return (
    <div className={styles.form}>

      <Input
        label="Nombre del plan"
        placeholder="Ej: Plan Premium"
        fullWidth
        required
        error={errors.name?.message}
        {...register("name")}
      />

      <TextArea
        label="Descripción"
        placeholder="Describe los beneficios del plan..."
        fullWidth
        error={errors.description?.message}
        {...register("description")}
      />

      <div className={styles.row}>
        <Input
          label="Precio"
          type="number"
          step="0.01"
          placeholder="0.00"
          fullWidth
          required
          error={errors.price?.message}
          {...register("price", { valueAsNumber: true })}
        />
        <Select
          label="Ciclo de cobro"
          options={CYCLE_OPTIONS}
          fullWidth
          {...register("billing_cycle")}
        />
      </div>

      <Select
        label="Tipo de beneficio"
        options={BENEFIT_OPTIONS}
        fullWidth
        error={errors.benefit_type?.message}
        {...register("benefit_type")}
      />

      {/* Créditos — mostrar si benefit_type es credits o both */}
      {(benefitType === "credits" || benefitType === "both") && (
        <Input
          label="Créditos por mes"
          type="number"
          placeholder="Ej: 10"
          fullWidth
          required
          hint="Cantidad de servicios gratis incluidos cada mes"
          error={errors.credits_per_month?.message}
          {...register("credits_per_month", { valueAsNumber: true })}
        />
      )}

      {/* Descuento — mostrar si benefit_type es discount o both */}
      {(benefitType === "discount" || benefitType === "both") && (
        <Input
          label="Porcentaje de descuento"
          type="number"
          step="0.01"
          placeholder="Ej: 15"
          fullWidth
          required
          hint="Porcentaje de descuento en todos los servicios"
          error={errors.discount_percent?.message}
          {...register("discount_percent", { valueAsNumber: true })}
        />
      )}

      <label className={styles.checkRow}>
        <input type="checkbox" {...register("is_active")} />
        <span>Plan activo para nuevas suscripciones</span>
      </label>

      <div className={styles.footer}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="button"
          loading={isSubmitting}
          onClick={handleSubmit(onSubmit)}
        >
          {defaultValues ? "Guardar cambios" : "Crear plan"}
        </Button>
      </div>
    </div>
  );
}