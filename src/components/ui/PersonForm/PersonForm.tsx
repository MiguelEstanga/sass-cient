"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/stores/auth.store";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { TextArea } from "@/components/ui/TextArea";
import { Button } from "@/components/ui/Button";
 
import type { Person } from "@/types/user.types";
import styles from "./PersonForm.module.css";
import { UpdatePersonFormValues, updatePersonSchema } from "@/lib/validations/person.schema";
 
interface Props {
  person:        Person;
  onSubmit:      (values: UpdatePersonFormValues) => Promise<void>;
  onCancel:      () => void;
  isSubmitting?: boolean;
}

export function PersonForm({ person, onSubmit, onCancel, isSubmitting }: Props) {
  const { prefixes, typeDocuments } = useAuthStore();
  const isClient = person._type === "client";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdatePersonFormValues>({
    resolver: zodResolver(updatePersonSchema),
  });

  useEffect(() => {
    reset({
      name:            person.name            ?? "",
      email:           person.email           ?? "",
      phone:           person.phone           ?? "",
      password:        "",
      type_document:   person.type_document   ?? "",
      document_number: person.document_number ?? "",
      address:         person.address         ?? "",
      city:            person.city            ?? "",
      zip:             person.zip             ?? "",
      number_prefix:   person.number_prefix   ?? "",
      is_active:       person.is_active       ?? true,
      notes:           isClient ? (person as any).notes ?? "" : undefined,
    });
  }, [person, reset]);

  return (
    <div className={styles.form}>

      {/* Badge tipo de perfil */}
      <div className={styles.typeBadge}>
        <div className={styles.avatar}>
          {person.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className={styles.personName}>{person.name}</p>
          <p className={styles.personType}>
            {isClient ? "👤 Cliente" : "✂️ Empleado"}
          </p>
        </div>
      </div>

      {/* Info básica */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Información básica</h3>
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
          error={errors.email?.message}
          {...register("email")}
        />
        <div className={styles.row}>
          <Select
            label="Prefijo"
            options={prefixes.map((p) => ({ value: p.prefix, label: p.prefix }))}
            placeholder="—"
            {...register("number_prefix")}
          />
          <Input
            label="Teléfono"
            fullWidth
            error={errors.phone?.message}
            {...register("phone")}
          />
        </div>
      </div>

      {/* Documento */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Documento</h3>
        <div className={styles.row}>
          <Select
            label="Tipo"
            options={typeDocuments.map((d) => ({ value: d.name, label: d.name }))}
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
      </div>

      {/* Dirección */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Dirección</h3>
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
      </div>

      {/* Notas — solo clientes */}
      {isClient && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Notas</h3>
          <TextArea
            label="Notas internas"
            placeholder="Preferencias, alergias..."
            fullWidth
            error={errors.notes?.message}
            {...register("notes")}
          />
        </div>
      )}

      {/* Contraseña — solo empleados */}
      {!isClient && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Seguridad</h3>
          <Input
            label="Nueva contraseña"
            type="password"
            placeholder="Dejar vacío para no cambiar"
            fullWidth
            hint="Solo completa si deseas cambiar la contraseña"
            error={errors.password?.message}
            {...register("password")}
          />
        </div>
      )}

      {/* Estado activo */}
      <div className={styles.toggleRow}>
        <label className={styles.toggleLabel}>
          <input
            type="checkbox"
            className={styles.checkbox}
            {...register("is_active")}
          />
          <span>{isClient ? "Cliente activo" : "Usuario activo"}</span>
        </label>
        <p className={styles.toggleHint}>
          {isClient
            ? "Los clientes inactivos no aparecen en búsquedas"
            : "Los usuarios inactivos no pueden iniciar sesión"}
        </p>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="button"
          loading={isSubmitting}
          onClick={handleSubmit(onSubmit)}
        >
          Guardar cambios
        </Button>
      </div>
    </div>
  );
}