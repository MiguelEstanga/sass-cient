"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/stores/auth.store";
import { roleService } from "@/services/role.service";
import styles from "./UserCreateForm.module.css";

const createUserSchema = z.object({
  name:            z.string().min(1, "El nombre es obligatorio"),
  email:           z.string().email("Correo inválido"),
  password:        z.string().min(6, "Mínimo 6 caracteres"),
  phone:           z.string().optional().or(z.literal("")),
  number_prefix:   z.string().optional(),
  type_document:   z.string().optional(),
  document_number: z.string().optional().or(z.literal("")),
  address:         z.string().optional().or(z.literal("")),
  city:            z.string().optional().or(z.literal("")),
  zip:             z.string().optional().or(z.literal("")),
  role_id:         z.number({  }),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

interface Props {
  onSubmit:      (values: CreateUserFormValues) => Promise<void>;
  onCancel:      () => void;
  isSubmitting?: boolean;
}

export function UserCreateForm({ onSubmit, onCancel, isSubmitting }: Props) {
  const { prefixes, typeDocuments } = useAuthStore();
  const [roles, setRoles]           = useState<{ value: number; label: string }[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
  });

  useEffect(() => {
    roleService.getAll().then((res) => {
      setRoles(res.map((r: any) => ({ value: r.id, label: r.name })));
    });
  }, []);

  return (
    <div className={styles.form}>

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
          required
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Contraseña"
          type="password"
          fullWidth
          required
          error={errors.password?.message}
          {...register("password")}
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

      {/* Rol */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Rol</h3>
        <Select
          label="Rol del usuario"
          options={roles}
          placeholder="Seleccionar rol..."
          fullWidth
          error={errors.role_id?.message}
          {...register("role_id", { valueAsNumber: true })}
        />
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
        <h3 className={styles.sectionTitle}>Dirección (opcional)</h3>
        <Input
          label="Dirección"
          fullWidth
          {...register("address")}
        />
        <div className={styles.row}>
          <Input label="Ciudad" fullWidth {...register("city")} />
          <Input label="Código postal" fullWidth {...register("zip")} />
        </div>
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
          Crear usuario
        </Button>
      </div>
    </div>
  );
}