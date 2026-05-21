"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/stores/auth.store";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import {
  updateEmployeeSchema,
  type UpdateEmployeeFormValues,
} from "@/lib/validations/user.schema";
import type { Employee } from "@/types/user.types";
import styles from "../styles/UserForm.module.css";
import { Roles } from "@/types/roles.types";

interface Props {
  defaultValues?: Partial<Employee>;
  onSubmit: (values: UpdateEmployeeFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  roles?: Roles[];
}

export function UserForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
  roles,
}: Props) {
  const { prefixes, typeDocuments } = useAuthStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateEmployeeFormValues>({
    resolver: zodResolver(updateEmployeeSchema),
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        name: defaultValues.name ?? "",
        email: defaultValues.email ?? "",
        phone: defaultValues.phone ?? "",
        password: "",
        type_document: defaultValues.type_document ?? "",
        document_number: defaultValues.document_number ?? "",
        address: defaultValues.address ?? "",
        city: defaultValues.city ?? "",
        zip: defaultValues.zip ?? "",
        number_prefix: defaultValues.number_prefix ?? "",
        is_active: defaultValues.is_active,
      });
    } else {
      reset({});
    }
  }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
      <Input
        label="Nombre completo"
        fullWidth
        required
        error={errors.name?.message}
        {...register("name")}
      />

      <Input
        label="Correo electrónico"
        type="email"
        fullWidth
        required
        error={errors.email?.message}
        {...register("email")}
      />

      {/* Prefijo + Teléfono */}
      <div className={styles.phoneRow}>
        <Select
          label="Prefijo"
          options={prefixes.map((p) => ({
            value: p.prefix,
            label: p.prefix,
          }))}
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
      {roles ? (
        <Select
          fullWidth
          label="Role"
          options={roles.map((role) => ({
            value: role.id,
            label: role.name,
          }))}
          placeholder="—"
       
          {...register("role_id")}
        />
      ) : null}

      {/* Tipo + Número documento */}
      <div className={styles.row}>
        <Select
          label="Tipo de documento"
          options={typeDocuments.map((d) => ({
            value: d.name,
            label: d.name,
          }))}
          placeholder="—"
          fullWidth
          {...register("type_document")}
        />
        <Input
          label="Número"
          fullWidth
          error={errors.document_number?.message}
          {...register("document_number")}
        />
      </div>

      <Input
        label="Dirección"
        fullWidth
        error={errors.address?.message}
        {...register("address")}
      />

      <div className={styles.row}>
        <Input
          label="Ciudad"
          fullWidth
          error={errors.city?.message}
          {...register("city")}
        />
        <Input
          label="Código postal"
          fullWidth
          error={errors.zip?.message}
          {...register("zip")}
        />
      </div>

      {/* Nueva contraseña — opcional */}
      {defaultValues ? (
        <Input
          label="Nueva contraseña"
          type="password"
          placeholder="Dejar vacío para no cambiar"
          fullWidth
          hint="Solo completa si deseas cambiar la contraseña"
          error={errors.password?.message}
          {...register("password")}
        />
      ) : null}

      {/* Toggle is_active */}
      <div className={styles.toggleRow}>
        <label className={styles.toggleLabel}>
          <input
            type="checkbox"
            className={styles.checkbox}
            {...register("is_active")}
          />
          <span>Usuario activo</span>
        </label>
        <p className={styles.toggleHint}>
          Los usuarios inactivos no pueden iniciar sesión
        </p>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <Button type="button" variant="secondary" fullWidth onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" fullWidth loading={isSubmitting}>
          Guardar cambios
        </Button>
      </div>
    </form>
  );
}
