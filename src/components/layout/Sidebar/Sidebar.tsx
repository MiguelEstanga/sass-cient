"use client";

import { useState } from "react";
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
  ChevronDown,
  Scissors,
  Wallet,
  Landmark,
  Tags,
  ArrowLeftRight,
  ShoppingBag,
  Wrench,
  ShoppingCart,
  Calendar,
  Clock,
  ClipboardList,
  Settings,
  LogOut,
  Crown,
} from "lucide-react";
import styles from "./Sidebar.module.css";

interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: NavItem[];
  section?: string; // ← para agrupar
}
interface NavSection {
  label: string;
  items: NavItem[];
}
// ── Items agrupados por sección ────────────────────────────────────────────
const NAV_SECTIONS: NavSection[] = [
  {
    label: "Principal",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: <LayoutDashboard size={18} />,
      },
    ],
  },
  {
    label: "Gestión",
    items: [
      { label: "Clientes", href: "/clients", icon: <UserCircle size={18} /> },
      { label: "Usuarios", href: "/users", icon: <Users size={18} /> },
      { label: "Horarios", href: "/schedules", icon: <Clock size={18} /> },
    ],
  },
  {
    label: "Operaciones",
    items: [
      { label: "Citas", href: "/appointments", icon: <Calendar size={18} /> },
      {
        label: "Sesiones",
        href: "/sessions",
        icon: <ClipboardList size={18} />,
      },
      {
        label: "Punto de Venta",
        href: "/pos",
        icon: <ShoppingCart size={18} />,
      },
    ],
  },
  {
    label: "Catálogo",
    items: [
      {
        label: "Productos",
        href: "/products",
        icon: <ShoppingBag size={18} />,
      },
      { label: "Servicios", href: "/services", icon: <Wrench size={18} /> },
    ],
  },
  {
    label: "Finanzas",
    items: [
      {
        label: "Finanzas",
        icon: <Wallet size={18} />,
        children: [
          {
            label: "Préstamos",
            href: "/finance/loans",
            icon: <Landmark size={16} />,
          },
          {
            label: "Categorías",
            href: "/finance/categories",
            icon: <Tags size={16} />,
          },
          {
            label: "Transacciones",
            href: "/finance/transactions",
            icon: <ArrowLeftRight size={16} />,
          },
        ],
      },
    ],
  },
  {
    label: "Gestión",
    items: [
      { label: "Membresías", href: "/memberships", icon: <Crown size={18} /> },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUiStore();
  const { user, role, logout } = useAuthStore();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  function toggleMenu(label: string) {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label],
    );
  }

  function getLocalePrefix(): string {
    const match = pathname.match(/^\/(en|es)/);
    return match ? match[0] : "/es";
  }

  function isActive(href: string): boolean {
    const prefix = getLocalePrefix();
    return (
      pathname === `${prefix}${href}` ||
      pathname.startsWith(`${prefix}${href}/`)
    );
  }

  // ── Calcular completitud del perfil ───────────────────────────────────
  const profileFields = [
    user?.phone,
    user?.type_document,
    user?.document_number,
    user?.address,
    user?.city,
  ];
  const profileComplete = profileFields.filter(Boolean).length;
  const profilePct = Math.round((profileComplete / profileFields.length) * 100);
  const profileIncomplete = profilePct < 100;

  return (
    <aside className={cn(styles.sidebar, sidebarCollapsed && styles.collapsed)}>
      {/* ── Logo ──────────────────────────────────────────────────────── */}
      <div className={styles.logo}>
        <div className={styles.logoIconWrapper}>
          <Scissors size={18} />
        </div>
        {!sidebarCollapsed && (
          <span className={styles.logoText}>LuxuryBeauty</span>
        )}
      </div>

      {/* ── Nav ───────────────────────────────────────────────────────── */}
      <nav className={styles.nav}>
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className={styles.section}>
            {/* Label de sección — solo cuando no está colapsado */}
            {!sidebarCollapsed && (
              <span className={styles.sectionLabel}>{section.label}</span>
            )}

            {section.items.map((item) => {
              // ── Item con submenú ──────────────────────────────────────
              if (item.children) {
                const isOpen = openMenus.includes(item.label);
                const isChildActive = item.children.some((c) =>
                  c.href ? isActive(c.href) : false,
                );

                return (
                  <div key={item.label}>
                    <button
                      onClick={() => toggleMenu(item.label)}
                      className={cn(
                        styles.navItem,
                        styles.parentItem,
                        isChildActive && styles.active,
                      )}
                    >
                      <span className={styles.navIcon}>{item.icon}</span>
                      {!sidebarCollapsed && (
                        <>
                          <span className={styles.navLabel}>{item.label}</span>
                          <ChevronDown
                            size={14}
                            className={cn(
                              styles.chevron,
                              isOpen && styles.chevronOpen,
                            )}
                          />
                        </>
                      )}
                      {sidebarCollapsed && (
                        <span className={styles.tooltip}>{item.label}</span>
                      )}
                    </button>

                    {!sidebarCollapsed && isOpen && (
                      <div className={styles.submenu}>
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href ?? ""}
                            className={cn(
                              styles.navItem,
                              styles.childItem,
                              child.href &&
                                isActive(child.href) &&
                                styles.active,
                            )}
                          >
                            <span className={styles.navIcon}>{child.icon}</span>
                            <span className={styles.navLabel}>
                              {child.label}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              // ── Item normal ───────────────────────────────────────────
              return (
                <Link
                  key={item.href}
                  href={item.href ?? ""}
                  className={cn(
                    styles.navItem,
                    item.href && isActive(item.href) && styles.active,
                  )}
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
          </div>
        ))}
      </nav>

      {/* ── Footer: perfil + logout ───────────────────────────────────── */}
      <div className={styles.footer}>
        {/* Link al perfil */}
        <Link
          href="/profile"
          className={cn(
            styles.profileBtn,
            isActive("/profile") && styles.profileBtnActive,
          )}
        >
          <div className={styles.avatarWrapper}>
            <div className={styles.avatar}>
              {user?.name.charAt(0).toUpperCase() ?? "?"}
            </div>
            {/* Indicador de perfil incompleto */}
            {profileIncomplete && (
              <span className={styles.profileDot} title="Perfil incompleto" />
            )}
          </div>

          {!sidebarCollapsed && (
            <div className={styles.profileInfo}>
              <p className={styles.profileName}>{user?.name ?? "—"}</p>
              <p className={styles.profileRole}>{role ?? "—"}</p>
              {/* Barra de completitud mini */}
              <div className={styles.miniBar}>
                <div
                  className={styles.miniBarFill}
                  style={{ width: `${profilePct}%` }}
                />
              </div>
            </div>
          )}
        </Link>

        {/* Logout */}
        <button
          className={styles.logoutBtn}
          onClick={logout}
          title="Cerrar sesión"
        >
          <LogOut size={16} />
          {!sidebarCollapsed && <span>Salir</span>}
        </button>
      </div>

      {/* ── Toggle ────────────────────────────────────────────────────── */}
      <button className={styles.toggleBtn} onClick={toggleSidebar}>
        {sidebarCollapsed ? (
          <ChevronRight size={14} />
        ) : (
          <ChevronLeft size={14} />
        )}
      </button>
    </aside>
  );
}
