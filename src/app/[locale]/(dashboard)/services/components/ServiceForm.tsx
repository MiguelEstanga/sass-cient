"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/TextArea";
import { Button } from "@/components/ui/Button";
import {
  serviceSchema,
  type ServiceFormValues,
} from "@/lib/validations/service.schema";
 import styles from "../styles/ServiceForm.module.css";
import { Service } from "@/types/services.types";

interface Props {
  defaultValues?: Partial<Service>;
  onSubmit: (values: ServiceFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ServiceForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
  });

  // Cargar valores al abrir el drawer en modo edición
  useEffect(() => {
    if (defaultValues) {
      reset({
        name: defaultValues.name ?? "",
        description: defaultValues.description ?? "",
        duration_minutes: defaultValues.duration_minutes ?? 30,
        price: defaultValues.price ? parseFloat(defaultValues.price) : 0,
        is_active: defaultValues.is_active ?? true,
      });
    } else {
      reset({
        name: "",
        description: "",
        duration_minutes: 30,
        price: 0,
        is_active: true,
      });
    }
  }, [defaultValues, reset]);

  const isActive = watch("is_active");

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={styles.form}
      noValidate
    >
      <Input
        label="Nombre del servicio"
        placeholder="Ej: Corte de pelo, Manicura..."
        fullWidth
        required
        error={errors.name?.message}
        {...register("name")}
      />

      <TextArea
        label="Descripción"
        placeholder="Descripción opcional del servicio..."
        fullWidth
        error={errors.description?.message}
        {...register("description")}
      />

      <div className={styles.row}>
        <Input
          label="Duración (minutos)"
          type="number"
          placeholder="30"
          fullWidth
          required
          error={errors.duration_minutes?.message}
          {...register("duration_minutes", { valueAsNumber: true })}
        />

        <Input
          label="Precio"
          type="number"
          placeholder="0.00"
          step="0.01"
          fullWidth
          required
          error={errors.price?.message}
          {...register("price", { valueAsNumber: true })}
        />
      </div>

      {/* Checkbox para estado activo */}
      <label className={styles.checkboxRow}>
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setValue("is_active", e.target.checked)}
          className={styles.checkbox}
        />
        <span>Servicio activo</span>
      </label>

      {/* Footer con botones */}
      <div className={styles.footer}>
        <Button
          type="button"
          variant="secondary"
          fullWidth
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          fullWidth
          loading={isSubmitting}
        >
          {defaultValues ? "Guardar cambios" : "Crear servicio"}
        </Button>
      </div>
    </form>
  );
}