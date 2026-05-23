"use client";

import { useState } from "react";
import { Clock, Loader2, Play, Pause, CheckCircle, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useStopwatch } from "@/hooks/useStopwatch";
import { taskService } from "@/services/tasks/task.service";
import { useToast } from "@/hooks/useToast";
import { ApiError } from "@/lib/api/errors";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils/cn";
import type { Task, TaskStatus } from "@/types/task.types";
import styles from "./TaskCard.module.css";

interface Props {
  task:      Task;
  onUpdate:  (updated: Task) => void;
  onComplete?: () => void; // ← callback para refrescar tabla al completar
}

export function TaskCard({ task, onUpdate, onComplete }: Props) {
  const t                     = useTranslations("sessions");
  const toast                 = useToast();
  const [loading, setLoading] = useState(false);

  const { display, isRunning } = useStopwatch({
    durationSeconds: task.duration_seconds ?? 0,
    startedAt:       task.started_at,
  });

  async function handleAction(status: TaskStatus) {
    setLoading(true);
    try {
      const response = await taskService.updateStatus(task.id, status);
      const updated  = Array.isArray(response)
        ? (response as Task[]).find((t) => t.id === task.id)
        : response;

      if (!updated) throw new Error("Item no encontrado");

      onUpdate(updated as Task);

      toast.success(
        status === "completed" ? t("completed_msg")
        : status === "paused"  ? t("paused_msg")
        : t("started")
      );

      // Notificar al padre que debe refrescar la tabla de completadas
      if (status === "completed") {
        onComplete?.();
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("errorUpdate"));
    } finally {
      setLoading(false);
    }
  }

  const statusConfig = {
    pending:     { label: t("statusPending"),    variant: "default"  as const },
    in_progress: { label: t("statusInProgress"), variant: "info"     as const },
    paused:      { label: t("statusPaused"),      variant: "warning"  as const },
    completed:   { label: t("completed"),         variant: "success"  as const },
    cancelled:   { label: t("cancelled"),         variant: "error"    as const },
  };

  const config = statusConfig[task.status];

  return (
    <div className={cn(styles.card, isRunning && styles.cardRunning)}>

      {/* Header */}
      <div className={styles.cardHeader}>
        <div className={styles.serviceInfo}>
         
          <div>
            <p className={styles.serviceName}>
              {task.service?.name ?? `Servicio #${task.service_id}`}
            </p>
            <p className={styles.clientName}>
              {task.sale?.client?.name ?? t("noClient")}
            </p>
          </div>
        </div>
        <Badge variant={config.variant}>{config.label}</Badge>
      </div>

      {/* Cronómetro */}
      <div className={cn(styles.timer, isRunning && styles.timerRunning)}>
        {isRunning
          ? <Loader2 size={16} className={cn(styles.timerIcon, styles.timerSpin)} />
          : <Clock   size={16} className={styles.timerIcon} />
        }
        <span className={styles.timerDisplay} suppressHydrationWarning>
          {display}
        </span>
      </div>

      {/* Ejecutor */}
      <div className={styles.performerRow}>
        <div className={styles.performerAvatar}>
          {task.performer_name?.charAt(0).toUpperCase() ?? "?"}
        </div>
        <span className={styles.performerName}>{task.performer_name}</span>
      </div>

      {/* Acciones */}
      <div className={styles.actions}>
        {task.status === "pending" && (
          <button
            className={cn(styles.btn, styles.btnPlay)}
            onClick={() => handleAction("in_progress")}
            disabled={loading}
          >
            {loading ? <Loader2 size={14} className={styles.spin} /> : <Play size={14} />}
            {t("start")}
          </button>
        )}

        {task.status === "in_progress" && (
          <>
            <button
              className={cn(styles.btn, styles.btnPause)}
              onClick={() => handleAction("paused")}
              disabled={loading}
            >
              {loading ? <Loader2 size={14} className={styles.spin} /> : <Pause size={14} />}
              {t("pause")}
            </button>
            <button
              className={cn(styles.btn, styles.btnComplete)}
              onClick={() => handleAction("completed")}
              disabled={loading}
            >
              {loading ? <Loader2 size={14} className={styles.spin} /> : <CheckCircle size={14} />}
              {t("complete")}
            </button>
          </>
        )}

        {task.status === "paused" && (
          <>
            <button
              className={cn(styles.btn, styles.btnPlay)}
              onClick={() => handleAction("in_progress")}
              disabled={loading}
            >
              {loading ? <Loader2 size={14} className={styles.spin} /> : <RotateCcw size={14} />}
              {t("resume")}
            </button>
            <button
              className={cn(styles.btn, styles.btnComplete)}
              onClick={() => handleAction("completed")}
              disabled={loading}
            >
              {loading ? <Loader2 size={14} className={styles.spin} /> : <CheckCircle size={14} />}
              {t("complete")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}