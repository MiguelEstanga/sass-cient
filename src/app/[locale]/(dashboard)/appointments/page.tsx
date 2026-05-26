"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { useDroppable } from "@dnd-kit/core";

import { appointmentService } from "@/services/appointment.service";
import { useCalendar } from "@/hooks/useCalendar";
import { useToast } from "@/hooks/useToast";
import { ApiError } from "@/lib/api/errors";
import { Drawer } from "@/components/ui/Modal";

import type {
  Appointment,
  AppointmentFormValues,
  CalendarConfig,
} from "@/types/appointment.types";
import styles from "./appointments.module.css";
import { AppointmentForm } from "./components/AppointmentForm";
import { AppointmentCard } from "./components/AppointmentCard";
import { useTranslations } from "next-intl";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
// ── Configuración del calendario ──────────────────────────────────────────
const CALENDAR_CONFIG: CalendarConfig = {
  startHour: 8,
  endHour: 20,
  slotMins: 15,
};

const SLOT_HEIGHT = 16; // px por cada franja de 15 min

const DAY_NAMES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

// ── Componente droppable para cada celda ──────────────────────────────────
function DroppableSlot({
  id,
  children,
  onClick,
}: {
  id: string;
  children?: React.ReactNode;
  onClick: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`${styles.slot} ${isOver ? styles.slotOver : ""}`}
      style={{ height: SLOT_HEIGHT }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export default function AppointmentsPage() {
  const t = useTranslations("appointments");
  const toast = useToast();

  const {
    weekDays,
    timeSlots,
    rangeStart,
    rangeEnd,
    goNextWeek,
    goPrevWeek,
    goToday,
  } = useCalendar(CALENDAR_CONFIG);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Drawer estado ──────────────────────────────────────────────────────
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingAppointment, setEditing] = useState<Appointment | null>(null);
  const [defaultSlot, setDefaultSlot] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── DnD sensors ───────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  // ── Cargar citas ──────────────────────────────────────────────────────
  // En appointments/page.tsx — fetchAppointments
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await appointmentService.getAll(rangeStart, rangeEnd);

      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Error:", err);
      toast.error(
        err instanceof ApiError ? err.message : "Error al cargar citas",
      );
    } finally {
      setLoading(false);
    }
  }, [rangeStart, rangeEnd]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // ── Click en slot vacío → abrir drawer de creación ────────────────────
  function handleSlotClick(date: Date, hour: number, min: number) {
    const d = new Date(date);
    d.setHours(hour, min, 0, 0);
    // datetime-local format: "YYYY-MM-DDTHH:MM"
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
    setDefaultSlot(iso);
    setEditing(null);
    setDrawerOpen(true);
  }
  const editingRef = useRef<Appointment | null>(null);
  // ── Click en cita → abrir drawer de edición ───────────────────────────

  function handleAppointmentClick(appointment: Appointment) {
    editingRef.current = appointment; // ← actualización síncrona
    setEditing(appointment);
    setDefaultSlot(appointment.start.slice(0, 16));
    setDrawerOpen(true);
  }

  // ── Submit del formulario ─────────────────────────────────────────────
  async function handleSubmit(values: AppointmentFormValues) {
    setIsSubmitting(true);
    try {
      if (editingAppointment) {
        await appointmentService.update(editingAppointment.id, {
          start_time: values.start_time,
        });
        toast.success("Cita actualizada");
      } else {
        await appointmentService.create(values);
        toast.success("Cita creada exitosamente");
      }
      setDrawerOpen(false);
      setEditing(null);
      // ← Refrescar siempre desde el backend para tener datos normalizados
      await fetchAppointments();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Error de conexión");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Cancelar cita ─────────────────────────────────────────────────────
  async function handleDelete() {
    const appt = editingRef.current;
    if (!appt) return;
    try {
      await appointmentService.changeStatus(appt.id, "cancelled");
      toast.success("Cita cancelada");
      setDrawerOpen(false);
      editingRef.current = null;
      setEditing(null);
      await fetchAppointments();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Error al cancelar");
    }
  }

  // ── Drag & Drop ───────────────────────────────────────────────────────
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const overId = String(over.id);
    const underscoreIdx = overId.indexOf("_");
    if (underscoreIdx === -1) return;

    const datePart = overId.slice(4, underscoreIdx); // "2026-05-26"
    const timePart = overId.slice(underscoreIdx + 1); // "09-30"

    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, min] = timePart.split("-").map(Number);

    if (!year || !month || !day || hour === undefined || min === undefined)
      return;

    const appointment = appointments.find((a) => a.id === Number(active.id));
    if (!appointment) return;

    // ── Construir ISO string SIN convertir a UTC ───────────────────────
    // Usamos el formato local directo para que Laravel lo interprete correctamente
    const isoStart = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}:00`;

    // ── Para el optimistic update usamos Date local ────────────────────
    const newStart = new Date(year, month - 1, day, hour, min, 0);
    const duration =
      new Date(appointment.end).getTime() -
      new Date(appointment.start).getTime();
    const newEnd = new Date(newStart.getTime() + duration).toISOString();

    const oldStart = appointment.start;
    const oldEnd = appointment.end;

    // Optimistic update
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === appointment.id
          ? { ...a, start: newStart.toISOString(), end: newEnd }
          : a,
      ),
    );

    try {
      await appointmentService.update(appointment.id, { start_time: isoStart });
      toast.success("Cita movida");
      await fetchAppointments();
    } catch (err) {
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === appointment.id ? { ...a, start: oldStart, end: oldEnd } : a,
        ),
      );
      toast.error(err instanceof ApiError ? err.message : "Error al mover");
    }
  }

  // ── Obtener citas de un día/slot específico ────────────────────────────
  function getAppointmentsForDay(date: Date): Appointment[] {
    const dateStr = date.toISOString().split("T")[0];
    return appointments.filter((a) => {
      // Defensive: manejar tanto 'start' como 'start_time'
      const startValue = (a.start ?? (a as any).start_time) as string;
      if (!startValue) return false;
      return startValue.startsWith(dateStr);
    });
  }
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Citas</h1>
          <p className={styles.subtitle}>
            {weekDays[0].toLocaleDateString("es", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className={styles.nav}>
          <button className={styles.navBtn} onClick={goPrevWeek}>
            <ChevronLeft size={18} />
          </button>
          <button className={styles.todayBtn} onClick={goToday}>
            <CalendarDays size={14} />
            Hoy
          </button>
          <button className={styles.navBtn} onClick={goNextWeek}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Calendario */}
      <DndContext
        sensors={sensors}
        modifiers={[restrictToWindowEdges]}
        onDragEnd={handleDragEnd}
      >
        <div className={styles.calendarWrapper}>
          <table className={styles.calendar}>
            <thead>
              <tr>
                {/* Columna de horas */}
                <th className={styles.timeCol} />
                {weekDays.map((day, i) => {
                  const dateStr = day.toISOString().split("T")[0];
                  const isToday = dateStr === today;
                  return (
                    <th
                      key={i}
                      className={`${styles.dayHeader} ${isToday ? styles.dayHeaderToday : ""}`}
                    >
                      <span className={styles.dayName}>{DAY_NAMES[i]}</span>
                      <span
                        className={`${styles.dayNum} ${isToday ? styles.dayNumToday : ""}`}
                      >
                        {day.getDate()}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((slot, si) => (
                <tr key={si} className={styles.timeRow}>
                  {/* Label de hora — solo en :00 */}
                  <td className={styles.timeCell}>
                    {slot.min === 0 && (
                      <span className={styles.timeLabel} data-hour={slot.hour}>
                        {slot.label}
                      </span>
                    )}
                  </td>

                  {/* Una celda por día */}
                  {weekDays.map((day, di) => {
                    const slotId = `day-${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}_${String(slot.hour).padStart(2, "0")}-${String(slot.min).padStart(2, "0")}`;

                    // Citas que empiezan en este slot
                    const slotApps = getAppointmentsForDay(day).filter((a) => {
                      const d = new Date(a.start);
                      return (
                        d.getHours() === slot.hour &&
                        d.getMinutes() === slot.min
                      );
                    });

                    return (
                      <td key={di} className={styles.dayCell}>
                        <DroppableSlot
                          id={slotId}
                          onClick={() =>
                            handleSlotClick(day, slot.hour, slot.min)
                          }
                        >
                          {slotApps.map((app) => (
                            <AppointmentCard
                              key={app.id}
                              appointment={app}
                              slotHeight={SLOT_HEIGHT}
                              slotMins={CALENDAR_CONFIG.slotMins}
                              startHour={CALENDAR_CONFIG.startHour}
                              onClick={handleAppointmentClick}
                              onRefresh={fetchAppointments} // ← agregar
                            />
                          ))}
                        </DroppableSlot>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DndContext>

      {/* Drawer crear/editar */}
      <Drawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          editingRef.current = null;
          setEditing(null);
        }}
        title={editingRef.current ? "Editar cita" : "Nueva cita"}
        subtitle={
          editingRef.current
            ? `${editingRef.current.client_name} — ${editingRef.current.service_name}`
            : "Completa los datos de la nueva cita"
        }
      >
        <AppointmentForm
          key={editingRef.current?.id ?? "new"}
          defaultValues={{ start_time: defaultSlot }}
          appointment={editingRef.current}
          onSubmit={handleSubmit}
          onCancel={() => {
            setDrawerOpen(false);
            editingRef.current = null;
            setEditing(null);
          }}
          onDelete={editingRef.current ? handleDelete : undefined}
          isSubmitting={isSubmitting}
        />
      </Drawer>
    </div>
  );
}
