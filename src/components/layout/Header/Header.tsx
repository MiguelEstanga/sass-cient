"use client";

import { useAuthStore } from "@/stores/auth.store";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "@/lib/i18n/routing";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/Button";
import { LogOut, Globe } from "lucide-react";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { Link } from "@/lib/i18n/routing";
import styles from "./Header.module.css";

export function Header() {
  const { user, logout } = useAuthStore();
  const toast = useToast();
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();

  // Quitar el prefijo del locale actual para construir el path limpio
  const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/";

  async function handleLogout() {
    try {
      await authService.logout();
    } catch {
      // Ignorar errores de logout en el servidor
    } finally {
      logout();
      toast.success("Sesión cerrada");
      router.push("/login");
    }
  }

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <p className={styles.greeting}>
          Hola, <strong>{user?.name ?? "Usuario"}</strong> 👋
        </p>
      </div>

      <div className={styles.right}>
        {/* Language switcher */}
        <div className={styles.langSwitcher}>
          <Globe size={16} />
          <Link
            href={pathWithoutLocale}
            locale="es"
            className={locale === "es" ? styles.activeLang : styles.lang}
          >
            ES
          </Link>
          <span className={styles.langDivider}>|</span>
          <Link
            href={pathWithoutLocale}
            locale="en"
            className={locale === "en" ? styles.activeLang : styles.lang}
          >
            EN
          </Link>
        </div>

        {/* Logout */}
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<LogOut size={16} />}
          onClick={handleLogout}
        >
          Salir
        </Button>
      </div>
    </header>
  );
}