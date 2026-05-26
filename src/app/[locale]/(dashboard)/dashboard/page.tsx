"use client";

import { useState, useEffect } from "react";
import {
  Users, UserCircle, ShoppingCart,
  Calendar, ClipboardList, TrendingUp,
  DollarSign, Clock, RefreshCw,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { dashboardService } from "@/services/dashboard.service";
import { ApiError } from "@/lib/api/errors";
import { useToast } from "@/hooks/useToast";
import type { DashboardStats } from "@/types/dashboard.types";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
  const { user }                          = useAuthStore();
  const toast                             = useToast();
  const [stats, setStats]                 = useState<DashboardStats | null>(null);
  const [loading, setLoading]             = useState(true);
  const [lastUpdated, setLastUpdated]     = useState<Date | null>(null);

  async function fetchStats() {
    setLoading(true);
    try {
      const data = await dashboardService.getStats();
      setStats(data);
      setLastUpdated(new Date());
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Error al cargar estadísticas"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  const hour    = new Date().getHours();
  const greeting =
    hour < 12 ? "Buenos días" :
    hour < 18 ? "Buenas tardes" :
                "Buenas noches";

  return (
    <div className={styles.page}>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.greeting}>
            {greeting}, <span className={styles.name}>{user?.name?.split(" ")[0]} </span>
          </h1>
          <p className={styles.date}>
            {new Date().toLocaleDateString("es", {
              weekday: "long",
              day:     "numeric",
              month:   "long",
              year:    "numeric",
            })}
          </p>
        </div>
        <button
          className={styles.refreshBtn}
          onClick={fetchStats}
          disabled={loading}
        >
          <RefreshCw size={15} className={loading ? styles.spin : ""} />
          {lastUpdated && (
            <span className={styles.lastUpdated}>
              Actualizado {lastUpdated.toLocaleTimeString([], {
                hour: "2-digit", minute: "2-digit"
              })}
            </span>
          )}
        </button>
      </div>

      {/* ── Grid de KPIs ────────────────────────────────────────────── */}
      <div className={styles.grid}>

        {/* Ingresos hoy */}
        <KpiCard
          loading={loading}
          icon={<DollarSign size={22} />}
          color="green"
          label="Ingresos hoy"
          value={`$${(stats?.sales.revenue_today ?? 0).toFixed(2)}`}
          sub={`${stats?.sales.today ?? 0} ventas hoy`}
        />

        {/* Ingresos del mes */}
        <KpiCard
          loading={loading}
          icon={<TrendingUp size={22} />}
          color="blue"
          label="Ingresos del mes"
          value={`$${(stats?.sales.revenue_month ?? 0).toFixed(2)}`}
          sub={`${stats?.sales.total ?? 0} ventas totales`}
        />

        {/* Citas hoy */}
        <KpiCard
          loading={loading}
          icon={<Calendar size={22} />}
          color="purple"
          label="Citas hoy"
          value={String(stats?.appointments.today ?? 0)}
          sub={`${stats?.appointments.pending ?? 0} pendientes`}
        />

        {/* Sesiones activas */}
        <KpiCard
          loading={loading}
          icon={<ClipboardList size={22} />}
          color="orange"
          label="Sesiones activas"
          value={String(stats?.sessions.active ?? 0)}
          sub="En progreso ahora"
          pulse={!!stats?.sessions.active && stats.sessions.active > 0}
        />

        {/* Total clientes */}
        <KpiCard
          loading={loading}
          icon={<UserCircle size={22} />}
          color="teal"
          label="Clientes"
          value={String(stats?.clients.total ?? 0)}
          sub={`+${stats?.clients.new_month ?? 0} este mes`}
        />

        {/* Empleados */}
        <KpiCard
          loading={loading}
          icon={<Users size={22} />}
          color="indigo"
          label="Empleados"
          value={String(stats?.employees.total ?? 0)}
          sub="Personal activo"
        />

      </div>
    </div>
  );
}

// ── KpiCard ────────────────────────────────────────────────────────────────
interface KpiCardProps {
  loading: boolean;
  icon:    React.ReactNode;
  color:   "green" | "blue" | "purple" | "orange" | "teal" | "indigo";
  label:   string;
  value:   string;
  sub?:    string;
  pulse?:  boolean;
}

const colorMap: Record<KpiCardProps["color"], string> = {
  green:  styles.colorGreen,
  blue:   styles.colorBlue,
  purple: styles.colorPurple,
  orange: styles.colorOrange,
  teal:   styles.colorTeal,
  indigo: styles.colorIndigo,
};

function KpiCard({ loading, icon, color, label, value, sub, pulse }: KpiCardProps) {
  if (loading) {
    return <div className={styles.cardSkeleton} />;
  }

  return (
    <div className={styles.card}>
      <div className={`${styles.iconBox} ${colorMap[color]}`}>
        {icon}
        {pulse && <span className={styles.pulseDot} />}
      </div>
      <div className={styles.cardBody}>
        <p className={styles.cardLabel}>{label}</p>
        <p className={styles.cardValue}>{value}</p>
        {sub && <p className={styles.cardSub}>{sub}</p>}
      </div>
    </div>
  );
}