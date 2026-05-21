"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
 
import type { Loan } from "@/types/finance/loan.types";
import type { Client } from "@/types/client.types";
import styles from "./LoanForm.module.css";
import { ClientPickerModal } from "@/components/ui/ClientPickerModal/ClientPickerModal";
import { InterestSlider } from "../interestSlider/InterestSlider";
import { LoanFormValues, loanSchema } from "@/lib/validations/loan.schema";

interface Props {
  defaultValues?: Partial<Loan>;
  categories: { value: number; label: string }[];
  onSubmit: (values: LoanFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function LoanForm({ defaultValues, categories, onSubmit, onCancel, isSubmitting }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoanFormValues>({
    resolver: zodResolver(loanSchema),
  });

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  useEffect(() => {
    if (defaultValues) {
      reset({
        user_id: defaultValues.user_id ?? 0,
        category_id: defaultValues.category_id ?? 0,
        loan_amount: defaultValues.loan_amount ? parseFloat(defaultValues.loan_amount) : 0,
        interest_rate: defaultValues.interest_rate ? parseFloat(defaultValues.interest_rate) : 1,
        term_months: defaultValues.term_months ?? 1,
      });
      
      // Si venimos de editar, ponemos el cliente que viene de la relación del backend
      if (defaultValues.user) {
        setSelectedClient({ id: defaultValues.user.id, name: defaultValues.user.name } as Client);
      }
    } else {
      reset({ user_id: 0, category_id: 0, loan_amount: 0, interest_rate: 1, term_months: 1 });
      setSelectedClient(null);
    }
  }, [defaultValues, reset]);

  function handleSelectClient(client: Client) {
    setSelectedClient(client);
    setValue("user_id", client.id);
    setIsPickerOpen(false);
  }

  function clearClient() {
    setSelectedClient(null);
    setValue("user_id", 0);
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
        
        {/* 1. Cliente */}
        <div className={styles.clientField}>
          <label className={styles.label}>Cliente *</label>
          {selectedClient ? (
            <div className={styles.clientSelected}>
              <strong>{selectedClient.name}</strong>
              <Button type="button" variant="ghost" size="sm" onClick={clearClient}>✕</Button>
            </div>
          ) : (
            <Button type="button" variant="secondary" fullWidth onClick={() => setIsPickerOpen(true)}>
              + Seleccionar Cliente
            </Button>
          )}
          {errors.user_id && <span className={styles.error}>{errors.user_id.message}</span>}
        </div>

        {/* 2. Categoría */}
        <Select
          label="Categoría de Préstamo *"
          options={categories}
          placeholder="Seleccionar..."
          fullWidth
          error={errors.category_id?.message}
          {...register("category_id", { valueAsNumber: true })}
        />

        {/* 3. Monto y Plazo */}
        <div className={styles.row}>
          <Input
            label="Monto a Prestar *"
            type="number"
            step="0.01"
            placeholder="0.00"
            fullWidth
            error={errors.loan_amount?.message}
            {...register("loan_amount", { valueAsNumber: true })}
          />
          <Input
            label="Plazo (Meses) *"
            type="number"
            placeholder="12"
            fullWidth
            error={errors.term_months?.message}
            {...register("term_months", { valueAsNumber: true })}
          />
        </div>

        {/* 4. Barra de Interés Visual */}
        <div className={styles.interestWrapper}>
          <input type="hidden" {...register("interest_rate", { valueAsNumber: true })} />
          <InterestSlider
            value={parseFloat((watch("interest_rate") || 1).toString())}
            onChange={(val) => setValue("interest_rate", val)}
          />
        </div>

        {/* Botones */}
        <div className={styles.footer}>
          <Button type="button" variant="secondary" fullWidth onClick={onCancel}>Cancelar</Button>
          <Button type="submit" fullWidth loading={isSubmitting}>
            {defaultValues ? "Actualizar Préstamo" : "Registrar Préstamo"}
          </Button>
        </div>
      </form>

      {/* Modal de Clientes en Memoria */}
      <ClientPickerModal
        open={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleSelectClient}
      />
    </>
  );
}

 
