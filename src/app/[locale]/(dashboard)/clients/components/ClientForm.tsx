"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/stores/auth.store";
import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/TextArea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import {
  clientSchema,
  type ClientFormValues,
} from "@/lib/validations/client.schema";
import type { Client } from "@/types/client.types";
import styles from "../styles/ClientForm.module.css";

interface Props {
  defaultValues?: Partial<Client>;
  onSubmit:       (values: ClientFormValues) => Promise<void>;
  onCancel:       () => void;
  isSubmitting?:  boolean;
}

export function ClientForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: Props) {
  const { prefixes, typeDocuments } = useAuthStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        name:            defaultValues.name            ?? "",
        email:           defaultValues.email           ?? "",
        phone:           defaultValues.phone           ?? "",
        notes:           defaultValues.notes           ?? "",
        type_document:   defaultValues.type_document   ?? "",
        document_number: defaultValues.document_number ?? "",
        address:         defaultValues.address         ?? "",
        city:            defaultValues.city            ?? "",
        number_prefix:   defaultValues.number_prefix   ?? "",
      });
    } else {
      reset({
        name: "", email: "", phone: "", notes: "",
        type_document: "", document_number: "",
        address: "", city: "", number_prefix: "",
      });
    }
  }, [defaultValues, reset]);

  return (
    // ── div en vez de form para evitar nested form ────────────────────
    <div className={styles.form}>

      <Input
        label="Nombre completo"
        placeholder="Ej: María González"
        fullWidth
        required
        error={errors.name?.message}
        {...register("name")}
      />

      {/* Email — opcional, si se pone se crea usuario */}
      <div className={styles.emailSection}>
        <Input
          label="Correo electrónico"
          type="email"
          placeholder="maria@email.com (opcional)"
          fullWidth
          error={errors.email?.message}
          {...register("email")}
        />
        <p className={styles.emailHint}>
          💡 Si ingresas un correo, se creará automáticamente un usuario para el cliente
        </p>
      </div>

      {/* Prefijo + Teléfono */}
      <div className={styles.phoneRow}>
        <Select
          label="Prefijo"
          options={prefixes.map((p) => ({ value: p.prefix, label: p.prefix }))}
          placeholder="—"
          {...register("number_prefix")}
        />
        <Input
          label="Teléfono"
          placeholder="4142345678"
          fullWidth
          error={errors.phone?.message}
          {...register("phone")}
        />
      </div>

      {/* Documento */}
      <div className={styles.row}>
        <Select
          label="Tipo de documento"
          options={typeDocuments.map((d) => ({ value: d.name, label: d.name }))}
          placeholder="—"
          fullWidth
          {...register("type_document")}
        />
        <Input
          label="Número"
          placeholder="Ej: 12345678"
          fullWidth
          error={errors.document_number?.message}
          {...register("document_number")}
        />
      </div>

      <Input
        label="Dirección"
        placeholder="Calle, número..."
        fullWidth
        error={errors.address?.message}
        {...register("address")}
      />

      <Input
        label="Ciudad"
        placeholder="Caracas"
        fullWidth
        error={errors.city?.message}
        {...register("city")}
      />

      <TextArea
        label="Notas"
        placeholder="Preferencias, alergias, observaciones..."
        fullWidth
        error={errors.notes?.message}
        {...register("notes")}
      />

      {/* Footer */}
      <div className={styles.footer}>
        <Button type="button" variant="secondary" fullWidth onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="button"
          fullWidth
          loading={isSubmitting}
          onClick={handleSubmit(onSubmit)}
        >
          {defaultValues ? "Guardar cambios" : "Crear cliente"}
        </Button>
      </div>
    </div>
  );
}