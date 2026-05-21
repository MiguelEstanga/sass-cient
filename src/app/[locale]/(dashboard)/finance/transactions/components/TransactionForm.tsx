"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
 
import type { Transaction } from "@/types/finance/transaction.types";
import styles from "../styles/TransactionForm.module.css";
import { TransactionFormValues, transactionSchema } from "@/lib/validations/transaction.schema";

const typeOptions = [
  { value: "income", label: "💰 Ingreso" },
  { value: "expense", label: "📉 Gasto" },
];

interface Props {
  defaultValues?: Partial<Transaction>;
  categories: { value: number; label: string }[];
  onSubmit: (values: TransactionFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function TransactionForm({ defaultValues, categories, onSubmit, onCancel, isSubmitting }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
  });

  const watchType = watch("type");

  useEffect(() => {
    if (defaultValues) {
      reset({
        type: defaultValues.type ?? "expense",
        description: defaultValues.description ?? "",
        amount: defaultValues.amount ? parseFloat(defaultValues.amount) : 0,
        category_id: defaultValues.category_id ?? null,
        date: defaultValues.date ?? new Date().toISOString().split('T')[0],
      });
    } else {
      reset({ type: "expense", description: "", amount: 0, category_id: null });
    }
  }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
      
      {/* Tipo */}
      <Select
        label="Tipo *"
        options={typeOptions}
        placeholder="Seleccionar..."
        fullWidth
        error={errors.type?.message}
        {...register("type")}
      />

      {/* Concepto */}
      <Input
        label="Concepto *"
        placeholder="Ej: Pago de internet, Venta de silla usada..."
        fullWidth
        error={errors.description?.message}
        {...register("description")}
      />

      {/* Monto */}
      <Input
        label="Monto *"
        type="number"
        step="0.01"
        placeholder="0.00"
        fullWidth
        error={errors.amount?.message}
        {...register("amount", { valueAsNumber: true })}
      />

      {/* Categoría (Opcional) */}
      <Select
        label="Categoría (Opcional)"
        options={categories}
        placeholder="Sin categoría"
        fullWidth
        error={errors.category_id?.message}
        {...register("category_id", { valueAsNumber: true })}
      />

      {/* Fecha (Opcional) */}
      <Input
        label="Fecha (Opcional)"
        type="date"
        fullWidth
        {...register("date")}
      />

      <div className={styles.footer}>
        <Button type="button" variant="secondary" fullWidth onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" fullWidth loading={isSubmitting}>
          {watchType === "income" ? "Registrar Ingreso" : "Registrar Gasto"}
        </Button>
      </div>
    </form>
  );
}