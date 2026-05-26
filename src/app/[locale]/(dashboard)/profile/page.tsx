"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/stores/auth.store";
import { profileService } from "@/services/profile.service";
import { useToast } from "@/hooks/useToast";
import { ApiError } from "@/lib/api/errors";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { updatePersonSchema, type UpdatePersonFormValues } from "@/lib/validations/person.schema";
import styles from "./profile.module.css";

export default function ProfilePage() {
  const toast                           = useToast();
  const { user, prefixes, typeDocuments, setAuth, role, companyId } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab]       = useState<"info" | "security">("info");

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<UpdatePersonFormValues>({
    resolver: zodResolver(updatePersonSchema),
    defaultValues: {
      name:            user?.name            ?? "",
      email:           user?.email           ?? "",
      phone:           user?.phone           ?? "",
      password:        "",
      type_document:   user?.type_document   ?? "",
      document_number: user?.document_number ?? "",
      address:         user?.address         ?? "",
      city:            user?.city            ?? "",
      zip:             user?.zip             ?? "",
      number_prefix:   user?.number_prefix   ?? "",
    },
  });

  async function handleSave(values: UpdatePersonFormValues) {
    setIsSubmitting(true);
    try {
      const payload = { ...values };
      if (!payload.password) delete payload.password;

      const updated = await profileService.update(payload);

      // ── Actualizar el store con los nuevos datos ───────────────────
      useAuthStore.setState((state: any) => ({
        user: { ...state.user!, ...updated },
      }));

      toast.success("Perfil actualizado correctamente");
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Error al actualizar"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!user) return null;

  const completionFields = [
    user.phone, user.type_document, user.document_number,
    user.address, user.city,
  ];
  const completed   = completionFields.filter(Boolean).length;
  const total       = completionFields.length;
  const percentage  = Math.round((completed / total) * 100);

  return (
    <div className={styles.page}>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.avatarSection}>
          <div className={styles.avatar}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className={styles.name}>{user.name}</h1>
            <div className={styles.badges}>
              <Badge variant="info">{role ?? "—"}</Badge>
              <Badge variant={user.is_active ? "success" : "error"}>
                {user.is_active ? "Activo" : "Inactivo"}
              </Badge>
            </div>
            <p className={styles.email}>{user.email}</p>
          </div>
        </div>

        {/* Barra de completitud */}
        <div className={styles.completionCard}>
          <div className={styles.completionHeader}>
            <span className={styles.completionLabel}>Perfil completado</span>
            <span className={styles.completionPct}>{percentage}%</span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${percentage}%` }}
            />
          </div>
          {percentage < 100 && (
            <p className={styles.completionHint}>
              Completa tu teléfono, documento y dirección
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "info" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("info")}
        >
          Información personal
        </button>
        <button
          className={`${styles.tab} ${activeTab === "security" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("security")}
        >
          Seguridad
        </button>
      </div>

      {/* Contenido */}
      <div className={styles.content}>
        {activeTab === "info" && (
          <div className={styles.formGrid}>

            {/* Info básica */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Información básica</h2>
              <div className={styles.fields}>
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
                  disabled
                  hint="El correo no se puede cambiar"
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
            </div>

            {/* Documento */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Documento de identidad</h2>
              <div className={styles.fields}>
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
            </div>

            {/* Dirección */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Dirección</h2>
              <div className={styles.fields}>
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
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className={styles.card} style={{ maxWidth: 480 }}>
            <h2 className={styles.cardTitle}>Cambiar contraseña</h2>
            <p className={styles.cardSubtitle}>
              Deja en blanco si no quieres cambiar la contraseña
            </p>
            <div className={styles.fields}>
              <Input
                label="Nueva contraseña"
                type="password"
                placeholder="Mínimo 6 caracteres"
                fullWidth
                error={errors.password?.message}
                {...register("password")}
              />
            </div>
          </div>
        )}

        {/* Footer fijo */}
        <div className={styles.footer}>
          <Button
            type="button"
            loading={isSubmitting}
            disabled={!isDirty}
            onClick={handleSubmit(handleSave)}
          >
            Guardar cambios
          </Button>
          {!isDirty && (
            <span className={styles.noChanges}>Sin cambios pendientes</span>
          )}
        </div>
      </div>
    </div>
  );
}