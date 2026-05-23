"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { taskService } from "@/services/tasks/task.service";
import { useToast } from "@/hooks/useToast";
import { ApiError } from "@/lib/api/errors";
 
import { CompletedTasksTable } from "./CompletedTasksTable";
import type { Task } from "@/types/task.types";
import styles from "./sessions.module.css";
import { TaskCard } from "./components/TaskCard";

export default function SessionsPage() {
  const t    = useTranslations("sessions");
  const toast = useToast();

  const [activeTasks, setActiveTasks]     = useState<Task[]>([]);
  const [activeLoading, setActiveLoading] = useState(true);

  // ── Ref para llamar refresh de CompletedTasksTable desde aquí ─────────
  const completedRefreshRef = useRef<(() => void) | null>(null);

  const loadAll = useCallback(async () => {
    setActiveLoading(true);
    try {
      const data = await taskService.getActive();
      setActiveTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("errorSync"));
    } finally {
      setActiveLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  function handleTaskUpdate(updated: Task) {
    if (updated.status === "completed" || updated.status === "cancelled") {
      setActiveTasks((prev) => prev.filter((t) => t.id !== updated.id));
    } else {
      setActiveTasks((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
    }
  }

  // ── Cuando se completa un servicio → refrescar tabla de completadas ────
  function handleTaskComplete() {
    completedRefreshRef.current?.();
  }

  const inProgress = activeTasks.filter((t) => t.status === "in_progress");
  const pending    = activeTasks.filter((t) => t.status === "pending");
  const paused     = activeTasks.filter((t) => t.status === "paused");

  return (
    <div className={styles.page}>

      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.subtitle}>
            {inProgress.length > 0
              ? `${inProgress.length} ${t("inProgress").toLowerCase()} · ${pending.length} ${t("pending").toLowerCase()}`
              : `${pending.length} ${t("pending").toLowerCase()}`}
          </p>
        </div>
        <button
          className={styles.refreshBtn}
          onClick={loadAll}
          disabled={activeLoading}
        >
          <RefreshCw size={16} className={activeLoading ? styles.spin : ""} />
          {t("refresh")}
        </button>
      </div>

      {/* En progreso */}
      {inProgress.length > 0 && (
        <section>
          <div className={styles.sectionHeader}>
            <span className={styles.dot} />
            <span className={styles.sectionLabel}>{t("inProgress")}</span>
            <span className={styles.sectionCount}>{inProgress.length}</span>
            <div className={styles.sectionLine} />
          </div>
          <div className={styles.grid}>
            {inProgress.map((task) => (
              <TaskCard
                key={`${task.id}-${task.status}-${task.started_at ?? "null"}`}
                task={task}
                onUpdate={handleTaskUpdate}
                onComplete={handleTaskComplete}
              />
            ))}
          </div>
        </section>
      )}

      {/* Pausadas */}
      {paused.length > 0 && (
        <section>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>{t("paused")}</span>
            <span className={styles.sectionCount}>{paused.length}</span>
            <div className={styles.sectionLine} />
          </div>
          <div className={styles.grid}>
            {paused.map((task) => (
              <TaskCard
                key={`${task.id}-${task.status}-${task.started_at ?? "null"}`}
                task={task}
                onUpdate={handleTaskUpdate}
                onComplete={handleTaskComplete}
              />
            ))}
          </div>
        </section>
      )}

      {/* Pendientes */}
      {pending.length > 0 && (
        <section>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>{t("pending")}</span>
            <span className={styles.sectionCount}>{pending.length}</span>
            <div className={styles.sectionLine} />
          </div>
          <div className={styles.grid}>
            {pending.map((task) => (
              <TaskCard
                key={`${task.id}-${task.status}-${task.started_at ?? "null"}`}
                task={task}
                onUpdate={handleTaskUpdate}
                onComplete={handleTaskComplete}
              />
            ))}
          </div>
        </section>
      )}

      {/* Vacío */}
      {!activeLoading && activeTasks.length === 0 && (
        <div className={styles.empty}>
          <span style={{ fontSize: "2rem" }}>✅</span>
          <p>{t("noActiveTasks")}</p>
        </div>
      )}

      {/* Historial */}
      <section>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>{t("history")}</span>
          <div className={styles.sectionLine} />
        </div>
        <CompletedTasksTable
          onRefreshReady={(fn) => { completedRefreshRef.current = fn; }}
        />
      </section>
    </div>
  );
}