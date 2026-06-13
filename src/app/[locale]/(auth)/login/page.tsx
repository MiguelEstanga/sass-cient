"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, Link } from "@/lib/i18n/routing";
import { useTranslations } from "next-intl";
import {
  Scissors,
  Calendar,
  ShoppingCart,
  Crown,
  LayoutDashboard,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";
import { useToast } from "@/hooks/useToast";
import { ApiError } from "@/lib/api/errors";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  loginSchema,
  type LoginFormValues,
} from "@/lib/validations/auth.schema";
import styles from "./login.module.css";

export default function LoginPage() {
  const t = useTranslations("login");
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) router.replace("/dashboard");
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
      console.log("Login successful:", data);
      setAuth(data);
      toast.success(`¡Bienvenido, ${data.user.name}!`);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.isValidationError() && err.errors) {
          Object.entries(err.errors).forEach(([field, messages]) => {
            setError(field as keyof LoginFormValues, { message: messages[0] });
          });
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error("Error de conexión. Verifica tu internet.");
      }
    }
  }
  const FEATURES = [
    { icon: <Calendar size={16} />, label: t("features.calendar") },
    { icon: <ShoppingCart size={16} />, label: t("features.pos") },
    { icon: <Crown size={16} />, label: t("features.memberships") },
    { icon: <LayoutDashboard size={16} />, label: t("features.dashboard") },
  ];
  return (
    <div className={styles.page}>
      {/* ══ IZQUIERDA — branding ══════════════════════════════════════ */}
      <div className={styles.left}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.gridBg} />

        <div className={styles.leftContent}>
          {/* Brand */}
          <div className={styles.brand}>
            <div className={styles.brandIcon}>
              <Scissors size={22} />
            </div>
            <span className={styles.brandName}>LuxuryBeauty</span>
          </div>

          {/* Tagline */}
          <div className={styles.tagline}>
            <h2 className={styles.taglineTitle}>
              {t("taglineTitle1")}
              <br />
              <span className={styles.taglineGradient}>
                {t("taglineTitle2")}
              </span>
            </h2>
            <p className={styles.taglineDesc}>{t("taglineDesc")}</p>
          </div>

          {/* Features */}
          <div className={styles.featureList}>
            {FEATURES.map((f) => (
              <div key={f.label} className={styles.featureItem}>
                <span className={styles.featureItemIcon}>{f.icon}</span>
                <span className={styles.featureItemLabel}>{f.label}</span>
              </div>
            ))}
          </div>

          {/* Volver */}
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={14} />
            {t("backLink")}
          </Link>
        </div>
      </div>

      {/* ══ DERECHA — formulario ══════════════════════════════════════ */}
      <div className={styles.right}>
        <div className={styles.card}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.logoBox}>
              <Scissors size={28} />
            </div>
            <h1 className={styles.title}>{t("welcomeBack")}</h1>
            <p className={styles.subtitle}>
              Ingresa tus credenciales para continuar
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className={styles.form}
            noValidate
          >
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
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
    </div>
  );
}
