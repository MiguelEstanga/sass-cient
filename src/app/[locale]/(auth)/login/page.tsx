"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@/lib/i18n/routing";
import { useTranslations } from "next-intl";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";
import { useToast } from "@/hooks/useToast";
import { ApiError } from "@/lib/api/errors";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth.schema";
import styles from "./login.module.css";

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);

  // Si ya está autenticado, ir al dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginFormValues) {
    try {
      const data = await authService.login(values);
      setAuth(data);
      toast.success(`¡Bienvenido, ${data.user.name}!`);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.isValidationError() && err.errors) {
          Object.entries(err.errors).forEach(([field, messages]) => {
            setError(field as keyof LoginFormValues, {
              message: messages[0],
            });
          });
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error("Error de conexión. Verifica tu internet.");
      }
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>💄</div>
          <h1 className={styles.title}>{t("welcomeBack")}</h1>
          <p className={styles.subtitle}>
            Ingresa tus credenciales para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
          <Input
            label={t("email")}
            type="email"
            placeholder="admin@luxurybeauty.com"
            fullWidth
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label={t("password")}
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            fullWidth
            error={errors.password?.message}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-text-muted)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            }
            {...register("password")}
          />

          <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
            {t("loginButton")}
          </Button>
        </form>
      </div>
    </div>
  );
}