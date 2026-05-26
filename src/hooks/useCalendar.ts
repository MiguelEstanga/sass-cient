import { useState, useMemo } from "react";
import type { CalendarConfig } from "@/types/appointment.types";

export interface CalendarSlot {
  date: Date;
  hour: number;
  min: number;
  label: string; // "08:00", "08:15"...
}

export function useCalendar(config: CalendarConfig) {
  const { startHour, endHour, slotMins } = config;

  // src/hooks/useCalendar.ts — el useState inicial
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const now = new Date();
    const day = now.getDay(); // 0=Dom, 1=Lun...
    const diff = day === 0 ? -6 : 1 - day; // Lunes como inicio
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });
  // 7 días de la semana actual
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(currentWeekStart);
      d.setDate(currentWeekStart.getDate() + i);
      return d;
    });
  }, [currentWeekStart]);

  // Slots de tiempo (franjas horarias)
  const timeSlots = useMemo(() => {
    const slots: { hour: number; min: number; label: string }[] = [];
    for (let h = startHour; h < endHour; h++) {
      for (let m = 0; m < 60; m += slotMins) {
        slots.push({
          hour: h,
          min: m,
          label: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
        });
      }
    }
    return slots;
  }, [startHour, endHour, slotMins]);

  function goNextWeek() {
    setCurrentWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  }

  function goPrevWeek() {
    setCurrentWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  }

  function goToday() {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    setCurrentWeekStart(monday);
  }

  // Rango ISO para el fetch
  const rangeStart = weekDays[0].toISOString().split("T")[0];
  const rangeEnd = weekDays[6].toISOString().split("T")[0] + "T23:59:59";

  return {
    weekDays,
    timeSlots,
    currentWeekStart,
    rangeStart,
    rangeEnd,
    goNextWeek,
    goPrevWeek,
    goToday,
  };
}
