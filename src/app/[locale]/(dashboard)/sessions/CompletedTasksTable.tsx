"use client";

import { useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Table, type Column } from "@/components/ui/Table";
import { Paginator } from "@/components/ui/Pagination";
import { SkeletonRow } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { useLocalCache } from "@/hooks/useLocalCache";
import { taskService } from "@/services/tasks/task.service";
import type { Task } from "@/types/task.types";
import styles from "./CompletedTasksTable.module.css";

const PAGE_SIZE = 10;

function formatTime(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const h    = Math.floor(safe / 3600);
  const m    = Math.floor((safe % 3600) / 60);
  const s    = safe % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

interface Props {
  onRefreshReady?: (fn: () => void) => void; // ← expone refresh al padre
}

export function CompletedTasksTable({ onRefreshReady }: Props) {
  const t = useTranslations("sessions");

  const fetcher = useCallback(
    (params: Record<string, unknown>) =>
      taskService.getCompleted(params as {
        search?:   string;
        per_page?: number;
        page?:     number;
      }),
    []
  );

  const { rows, total, page, lastPage, loading, setPage, refresh } =
    useLocalCache<Task>(fetcher, {
      keyField:  "id",
      blockSize: 500,
      pageSize:  PAGE_SIZE,
    });

  // ── Exponer refresh al padre via callback ──────────────────────────────
  useEffect(() => {
    onRefreshReady?.(refresh);
  }, [refresh, onRefreshReady]);

  const columns: Column<Task>[] = [
    {
      key:    "service",
      header: t("service"),
      render: (row) => (
        <div>
          <p style={{ margin: 0, fontWeight: 500, fontSize: "var(--font-size-sm)" }}>
            {row.service?.name ?? `Servicio #${row.service_id}`}
          </p>
          <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
            {row.sale?.client?.name ?? t("noClient")}
          </p>
        </div>
      ),
    },
    {
      key:    "performer_name",
      header: t("executor"),
      width:  "150px",
      render: (row) => (
        <div className={styles.performerCell}>
          <div className={styles.performerAvatar}>
            {row.performer_name?.charAt(0).toUpperCase() ?? "?"}
          </div>
          <span className={styles.performerName}>
            {row.performer_name ?? "—"}
          </span>
        </div>
      ),
    },
    {
      key:    "duration_seconds",
      header: t("duration"),
      width:  "110px",
      render: (row) => (
        <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600, fontSize: "var(--font-size-sm)" }}>
          {formatTime(row.duration_seconds ?? 0)}
        </span>
      ),
    },
    {
      key:    "status",
      header: t("status"),
      width:  "110px",
      render: (row) => (
        <Badge variant={row.status === "completed" ? "success" : "error"}>
          {row.status === "completed" ? t("completed") : t("cancelled")}
        </Badge>
      ),
    },
    {
      key:    "finished_at",
      header: t("finished"),
      width:  "120px",
      render: (row) => (
        <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>
          {row.finished_at
            ? new Date(row.finished_at).toLocaleTimeString()
            : "—"}
        </span>
      ),
    },
  ];

  return (
    <div>
      {loading ? (
        <div>
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : (
        <Table
          columns={columns}
          data={rows}
          keyField="id"
          emptyText={t("noCompleted")}
          offset={(page - 1) * PAGE_SIZE}
        />
      )}
      <Paginator
        page={page}
        lastPage={lastPage}
        total={total}
        pageSize={PAGE_SIZE}
        loading={loading}
        onChange={setPage}
      />
    </div>
  );
}