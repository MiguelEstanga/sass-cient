"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/TextArea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
 import type { FinanceCategory } from "@/types/finance/category.types";
import styles from "../styles/CategoryForm.module.css";
import { FinanceCategoryFormValues, financeCategorySchema } from "@/lib/validations/category.schema";

const typeOptions = [
  { value: "loan", label: "Préstamo" },
  { value: "payment", label: "Pago" },
  { value: "other", label: "Otro" },
];

interface Props {
  defaultValues?: Partial<FinanceCategory>;
  onSubmit: (values: FinanceCategoryFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function CategoryForm({ defaultValues, onSubmit, onCancel, isSubmitting }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FinanceCategoryFormValues>({
    resolver: zodResolver(financeCategorySchema),
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        name: defaultValues.name ?? "",
        description: defaultValues.description ?? "",
        type: defaultValues.type ?? "loan",
        is_active: defaultValues.is_active ?? true,
      });
    } else {
      reset({ name: "", description: "", type: "loan", is_active: true });
    }
  }, [defaultValues, reset]);

  const isActive = watch("is_active");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
      <Input
        label="Nombre de la categoría"
        placeholder="Ej: Préstamos Personales"
        fullWidth
        required
        error={errors.name?.message}
        {...register("name")}
      />

      <TextArea
        label="Descripción"
        placeholder="Descripción opcional..."
        fullWidth
        error={errors.description?.message}
        {...register("description")}
      />

      <Select
        label="Tipo *"
        options={typeOptions}
        placeholder="Seleccionar tipo..."
        fullWidth
        error={errors.type?.message}
        {...register("type")}
      />

      <label className={styles.checkboxRow}>
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setValue("is_active", e.target.checked)}
          className={styles.checkbox}
        />
        <span>Categoría activa</span>
      </label>

      <div className={styles.footer}>
        <Button type="button" variant="secondary" fullWidth onClick={onCancel}>Cancelar</Button>
        <Button type="submit" fullWidth loading={isSubmitting}>
          {defaultValues ? "Guardar cambios" : "Crear categoría"}
        </Button>
      </div>
    </form>
  );
}