"use client";

import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { useRouter } from "@/lib/i18n/routing";
import { Play, User, Scissors } from "lucide-react";
import { appointmentService } from "@/services/appointment.service";
import { useToast } from "@/hooks/useToast";
import { ApiError } from "@/lib/api/errors";
import type { Appointment } from "@/types/appointment.types";
import { cn } from "@/lib/utils/cn";
import styles from "./AppointmentCard.module.css";

interface Props {
  appointment: Appointment;
  slotHeight:  number;
  slotMins:    number;
  startHour:   number;
  onClick:     (appointment: Appointment) => void;
  onRefresh:   () => void;
}

const statusStyles: Record<string, string> = {
  scheduled:   styles.statusScheduled,
  confirmed:   styles.statusConfirmed,
  in_progress: styles.statusInProgress,
  completed:   styles.statusCompleted,
  cancelled:   styles.statusCancelled,
};

export function AppointmentCard({
  appointment,
  slotHeight,
  slotMins,
  startHour,
  onClick,
  onRefresh,
}: Props) {
  const router                        = useRouter();
  const toast                         = useToast();
  const [loading, setLoading]         = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: appointment.id });

  const start    = new Date(appointment.start);
  const end      = new Date(appointment.end);
  const startMin = (start.getHours() - startHour) * 60 + start.getMinutes();
  const duration = (end.getTime() - start.getTime()) / 60000;

  // ── Posición y altura ──────────────────────────────────────────────────
  const top    = (startMin / slotMins) * slotHeight;
  const height = Math.max((duration / slotMins) * slotHeight, slotHeight * 2);

  // ── Mostrar info según altura disponible ───────────────────────────────
  const isCompact = height < 40;
  const isMedium  = height >= 40 && height < 70;
  const isLarge   = height >= 70;

  const style = {
    top:       `${top}px`,
    height:    `${height}px`,
    opacity:   isDragging ? 0.5 : 1,
    zIndex:    isDragging ? 999 : showTooltip ? 100 : 2,
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
  };

  // ── Empezar servicio ───────────────────────────────────────────────────
  async function handleStartService(e: React.MouseEvent) {
    e.stopPropagation();
    setLoading(true);
    try {
      await appointmentService.changeStatus(appointment.id, "in_progress");
      toast.success(`Servicio iniciado — ${appointment.service_name}`);
      onRefresh();
      router.push("/sessions");
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Error al iniciar servicio"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        styles.card,
        statusStyles[appointment.status] ?? styles.statusScheduled,
        isDragging && styles.dragging
      )}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={() => !isDragging && onClick(appointment)}
      {...listeners}
      {...attributes}
    >

      {/* ── Tooltip al hover ─────────────────────────────────────────── */}
      {showTooltip && !isDragging && (
        <div className={styles.tooltip}>
          <div className={styles.tooltipRow}>
            <span className={styles.tooltipLabel}>Servicio</span>
            <span className={styles.tooltipValue}>
              {appointment.service_name}
            </span>
          </div>
          <div className={styles.tooltipRow}>
            <span className={styles.tooltipLabel}>Cliente</span>
            <span className={styles.tooltipValue}>
              {appointment.client_name}
            </span>
          </div>
          <div className={styles.tooltipRow}>
            <span className={styles.tooltipLabel}>Estilista</span>
            <span className={styles.tooltipValue}>
              {appointment.employee_name}
            </span>
          </div>
          <div className={styles.tooltipRow}>
            <span className={styles.tooltipLabel}>Hora</span>
            <span className={styles.tooltipValue}>
              {start.toLocaleTimeString([], {
                hour:   "2-digit",
                minute: "2-digit",
              })}
              {" → "}
              {end.toLocaleTimeString([], {
                hour:   "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className={styles.tooltipRow}>
            <span className={styles.tooltipLabel}>Estado</span>
            <span className={styles.tooltipValue}>
              {appointment.status === "scheduled"   && "Programada"}
              {appointment.status === "confirmed"   && "Confirmada"}
              {appointment.status === "in_progress" && "En progreso"}
              {appointment.status === "completed"   && "Completada"}
              {appointment.status === "cancelled"   && "Cancelada"}
            </span>
          </div>
        </div>
      )}

      {/* ── Contenido de la tarjeta ───────────────────────────────────── */}

      {/* Servicio — siempre visible */}
      <p className={styles.cardTitle}>
        <Scissors size={10} style={{ marginRight: 3, flexShrink: 0 }} />
        {appointment.service_name}
      </p>

      {/* Cliente — tarjetas medianas y grandes */}
      {!isCompact && (
        <p className={styles.cardSub}>
          <User size={9} style={{ marginRight: 3, flexShrink: 0 }} />
          {appointment.client_name}
        </p>
      )}

      {/* Empleado — tarjetas medianas */}
      {isMedium && (
        <p className={styles.cardEmployee}>
          {appointment.employee_name}
        </p>
      )}

      {/* Empleado + hora — tarjetas grandes */}
      {isLarge && (
        <>
          <p className={styles.cardEmployee}>
            👤 {appointment.employee_name}
          </p>
          <p className={styles.cardTime}>
            {start.toLocaleTimeString([], {
              hour:   "2-digit",
              minute: "2-digit",
            })}
            {" → "}
            {end.toLocaleTimeString([], {
              hour:   "2-digit",
              minute: "2-digit",
            })}
          </p>
        </>
      )}

      {/* Botón empezar servicio — solo en scheduled/confirmed y tarjeta grande */}
      {isLarge &&
        (appointment.status === "scheduled" ||
          appointment.status === "confirmed") && (
          <button
            className={styles.startBtn}
            onClick={handleStartService}
            disabled={loading}
          >
            <Play size={10} />
            {loading ? "..." : "Empezar servicio"}
          </button>
        )}
    </div>
  );
}