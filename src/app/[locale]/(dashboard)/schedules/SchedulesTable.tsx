"use client";

import { useCallback, useEffect, useState } from "react";
import { Clock, Trash2 } from "lucide-react";
import { Table, type Column } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SkeletonRow } from "@/components/ui/Skeleton";
import { Paginator } from "@/components/ui/Pagination";
import { ConfirmDialog } from "@/components/ui/Modal";
import { useLocalCache } from "@/hooks/useLocalCache";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/hooks/useToast";
import { ApiError } from "@/lib/api/errors";
import { scheduleService } from "@/services/schedule.service";
import type { EmployeeSchedule } from "@/types/schedule.types";
import styles from "./SchedulesTable.module.css";

const PAGE_SIZE = 15;

interface Props {
  onEdit:          (schedule: EmployeeSchedule) => void;
  onRefreshReady?: (fn: () => void) => void;
}

export function SchedulesTable({ onEdit, onRefreshReady }: Props) {
  const toast              = useToast();
  const { confirm, dialogProps } = useConfirm();

  const fetcher = useCallback(
    (params: Record<string, any>) => scheduleService.getAll(params),
    []
  );

  const { rows, total, page, lastPage, loading, setPage, refresh } =
    useLocalCache<EmployeeSchedule>(fetcher, {
      keyField:  "id",
      blockSize: 500,
      pageSize:  PAGE_SIZE,
    });

  useEffect(() => {
    onRefreshReady?.(refresh);
  }, [refresh, onRefreshReady]);

  // ── Eliminar horario con confirm ───────────────────────────────────────
  function handleDelete(schedule: EmployeeSchedule) {
    const name = schedule.user?.name ?? `Empleado #${schedule.user_id}`;
    confirm({
      title:   "Eliminar horario",
      message: `¿Eliminar el horario de ${name}? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        try {
          await scheduleService.delete(schedule.id);
          toast.success(`Horario de ${name} eliminado`);
          refresh();
        } catch (err) {
          toast.error(
            err instanceof ApiError ? err.message : "Error al eliminar"
          );
        }
      },
    });
  }

  // ── Calcular horas netas ───────────────────────────────────────────────
  function calcNetHours(schedule: EmployeeSchedule): string {
    const [inH, inM]   = schedule.check_in.split(":").map(Number);
    const [outH, outM] = schedule.check_out.split(":").map(Number);
    let totalMins      = (outH * 60 + outM) - (inH * 60 + inM);

    if (schedule.break_start && schedule.break_end) {
      const [bsH, bsM] = schedule.break_start.split(":").map(Number);
      const [beH, beM] = schedule.break_end.split(":").map(Number);
      totalMins -= (beH * 60 + beM) - (bsH * 60 + bsM);
    }

    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  const columns: Column<EmployeeSchedule>[] = [
    {
      key:    "user",
      header: "Empleado",
      render: (row) => (
        <div className={styles.employeeCell}>
          <div className={styles.avatar}>
            {(row.user?.name ?? String(row.user_id)).charAt(0).toUpperCase()}
          </div>
          <div>
            <p className={styles.employeeName}>
              {row.user?.name ?? `Empleado #${row.user_id}`}
            </p>
            <p className={styles.employeeEmail}>
              {row.user?.email ?? ""}
            </p>
          </div>
        </div>
      ),
    },
    {
      key:    "check_in",
      header: "Entrada",
      width:  "100px",
      render: (row) => (
        <div className={styles.timeCell}>
          <Clock size={12} />
          <span>{row.check_in}</span>
        </div>
      ),
    },
    {
      key:    "check_out",
      header: "Salida",
      width:  "100px",
      render: (row) => (
        <div className={styles.timeCell}>
          <Clock size={12} />
          <span>{row.check_out}</span>
        </div>
      ),
    },
    {
      key:    "break_start",
      header: "Descanso",
      width:  "160px",
      render: (row) =>
        row.break_start && row.break_end ? (
          <span style={{ fontSize: "var(--font-size-sm)" }}>
            {row.break_start} → {row.break_end}
          </span>
        ) : (
          <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-xs)" }}>
            Sin descanso
          </span>
        ),
    },
    {
      key:    "net_hours",
      header: "Horas netas",
      width:  "110px",
      render: (row) => (
        <Badge variant="info">{calcNetHours(row)}</Badge>
      ),
    },
    {
      key:    "actions",
      header: "Acciones",
      width:  "140px",
      render: (row) => (
        <div style={{ display: "flex", gap: "var(--spacing-xs)" }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(row)}
          >
            Editar
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(row)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
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
          emptyText="No hay horarios configurados"
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

      <ConfirmDialog {...dialogProps} confirmLabel="Sí, eliminar" />
    </div>
  );
}