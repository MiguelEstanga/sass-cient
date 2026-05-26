"use client";

import { useState, useRef } from "react";
import { scheduleService } from "@/services/schedule.service";
import { useToast } from "@/hooks/useToast";
import { ApiError } from "@/lib/api/errors";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Modal";
import { SchedulesTable } from "./SchedulesTable";
import { ScheduleForm } from "./components/ScheduleForm";
import type { EmployeeSchedule } from "@/types/schedule.types";
import type { ScheduleFormValues } from "@/lib/validations/schedule.schema";
import type { Employee } from "@/types/user.types";
import styles from "./schedules.module.css";

export default function SchedulesPage() {
  const toast = useToast();

  const [drawerOpen, setDrawerOpen]         = useState(false);
  const [editing, setEditing]               = useState<EmployeeSchedule | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isSubmitting, setIsSubmitting]     = useState(false);

  const tableRefreshRef = useRef<(() => void) | null>(null);

  // ── Abrir drawer para EDITAR un horario existente ──────────────────────
  function handleEdit(schedule: EmployeeSchedule) {
    setEditing(schedule);
    setSelectedEmployee(null);
    setDrawerOpen(true);
  }

  // ── Abrir drawer para CREAR un horario nuevo ───────────────────────────
  function handleCreate() {
    setEditing(null);
    setSelectedEmployee(null);
    setDrawerOpen(true);
  }

  function handleClose() {
    setDrawerOpen(false);
    setEditing(null);
    setSelectedEmployee(null);
  }

  // ── Submit — create o update según contexto ────────────────────────────
  async function handleSubmit(
    values: ScheduleFormValues,
    employee: Employee | null
  ) {
    // Para crear necesitamos un empleado seleccionado
    const userId = editing?.user_id ?? employee?.id;
    if (!userId) {
      toast.error("Selecciona un empleado");
      return;
    }

    setIsSubmitting(true);
    try {
      await scheduleService.upsert(userId, {
        check_in:    values.check_in,
        check_out:   values.check_out,
        break_start: values.break_start || undefined,
        break_end:   values.break_end   || undefined,
      });
      toast.success("Horario guardado correctamente");
      handleClose();
      tableRefreshRef.current?.();
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Error al guardar horario"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>

      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Horarios</h1>
          <p className={styles.subtitle}>
            Gestiona los horarios laborales de tus empleados
          </p>
        </div>
        <Button onClick={handleCreate}>
          + Asignar horario
        </Button>
      </div>

      {/* Tabla */}
      <SchedulesTable
        onEdit={handleEdit}
        onRefreshReady={(fn) => { tableRefreshRef.current = fn; }}
      />

      {/* Drawer crear / editar */}
      <Drawer
        open={drawerOpen}
        onClose={handleClose}
        title={editing ? "Editar horario" : "Asignar horario"}
        subtitle={
          editing
            ? `Editando horario de empleado #${editing.user_id}`
            : "Selecciona un empleado y configura su horario"
        }
      >
        <ScheduleForm
          defaultValues={editing ?? undefined}
          isCreating={!editing}
          onSubmit={handleSubmit}
          onCancel={handleClose}
          isSubmitting={isSubmitting}
        />
      </Drawer>
    </div>
  );
}