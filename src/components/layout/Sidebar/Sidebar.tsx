"use client";

import { useState } from "react"; // <-- Agregar useState
import { usePathname } from "next/navigation";
import { Link } from "@/lib/i18n/routing";
import { useUiStore } from "@/stores/ui.store";
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils/cn";
import {
  LayoutDashboard,
  Users,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  Scissors,
  Wallet,       // <-- Icono Finanzas
  Landmark,     // <-- Icono Préstamos
  Tags,         // <-- Icono Categorías
  ArrowLeftRight, // <-- Icono Transacciones
  ChevronDown,  // <-- Flecha del menú
} from "lucide-react";
import styles from "./Sidebar.module.css";

// 1. Actualizar interfaz para soportar sub-menús
interface NavItem {
  label: string;
  href?: string; // Opcional porque el padre a veces no redirige
  icon: React.ReactNode;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard", // Quité el /es para que funcione con next-intl routing
    icon: <LayoutDashboard size={20} />,
  },
  {
    label: "Clientes",
    href: "/clients",
    icon: <UserCircle size={20} />,
  },
  {
    label: "Usuarios",
    href: "/users",
    icon: <Users size={20} />,
  },
  {
    label: "Productos",
    href: "/products",
    icon: <UserCircle size={20} />,
  },
  {
    label: "Servicios",
    href: "/services",
    icon: <UserCircle size={20} />,
  },
  // 2. Agregar el menú de Finanzas
  {
    label: "Finanzas",
    icon: <Wallet size={20} />,
    children: [
      {
        label: "Préstamos",
        href: "/finance/loans",
        icon: <Landmark size={18} />,
      },
      {
        label: "Categorías",
        href: "/finance/categories",
        icon: <Tags size={18} />,
      },
      {
        label: "Transacciones",
        href: "/finance/transactions",
        icon: <ArrowLeftRight size={18} />,
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUiStore();
  const { user } = useAuthStore();
  
  // 3. Estado para controlar qué menús están abiertos
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  return (
    <aside
      className={cn(
        styles.sidebar,
        sidebarCollapsed && styles.collapsed
      )}
    >
      {/* Logo */}
      <div className={styles.logo}>
        <Scissors size={24} className={styles.logoIcon} />
        {!sidebarCollapsed && (
          <span className={styles.logoText}>LuxuryBeauty</span>
        )}
      </div>

      {/* Nav */}
      <nav className={styles.nav}>
        {navItems.map((item) => {
          // Lógica para items con sub-menú (ej. Finanzas)
          if (item.children) {
            const isOpen = openMenus.includes(item.label);
            // Verificar si alguna ruta hija está activa para resaltar el padre
            const isChildActive = item.children.some((child) =>
              pathname.startsWith(child.href ?? "")
            );

            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={cn(
                    styles.navItem,
                    styles.parentItem, // Nuevo estilo
                    isChildActive && styles.active
                  )}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  {!sidebarCollapsed && (
                    <>
                      <span className={styles.navLabel}>{item.label}</span>
                      <ChevronDown
                        size={16}
                        className={cn(
                          styles.chevron,
                          isOpen && styles.chevronOpen
                        )}
                      />
                    </>
                  )}
                </button>

                {/* Renderizar sub-menús si está abierto y el sidebar no está colapsado */}
                {!sidebarCollapsed && isOpen && (
                  <div className={styles.submenu}>
                    {item.children.map((child) => {
                      const isChildItemActive = pathname.startsWith(child.href ?? "");
                      return (
                        <Link
                          href={child.href ?? ""}
                          key={child.href}
                          className={cn(
                            styles.navItem,
                            styles.childItem, // Nuevo estilo
                            isChildItemActive && styles.active
                          )}
                        >
                          <span className={styles.navIcon}>{child.icon}</span>
                          <span className={styles.navLabel}>{child.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // Lógica normal para items sin sub-menú
          const isActive = pathname.startsWith(item.href ?? "");
          return (
            <Link
              href={item.href ?? ""}
              key={item.href}
              className={cn(styles.navItem, isActive && styles.active)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {!sidebarCollapsed && (
                <span className={styles.navLabel}>{item.label}</span>
              )}
              {sidebarCollapsed && (
                <span className={styles.tooltip}>{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      {!sidebarCollapsed && user && (
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className={styles.userDetails}>
            <p className={styles.userName}>{user.name}</p>
            <p className={styles.userRole}>{user.roles[0]?.name ?? "—"}</p>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button className={styles.toggleBtn} onClick={toggleSidebar}>
        {sidebarCollapsed ? (
          <ChevronRight size={16} />
        ) : (
          <ChevronLeft size={16} />
        )}
      </button>
    </aside>
  );
}