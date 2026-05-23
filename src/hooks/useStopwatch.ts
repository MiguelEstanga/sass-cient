import { useState, useEffect, useRef } from "react";

interface UseStopwatchOptions {
  durationSeconds: number;
  startedAt:       string | null;
}

interface UseStopwatchReturn {
  elapsed:   number;
  display:   string;
  isRunning: boolean;
}

// Parsear started_at manejando formato MySQL y ISO
function parseStartedAt(startedAt: string): number {
  if (!startedAt) return Date.now();

  // Ya tiene timezone → parsear directo
  if (startedAt.includes("Z") || startedAt.includes("+")) {
    const ms = Date.parse(startedAt);
    return isNaN(ms) ? Date.now() : ms;
  }

  // Formato MySQL "2026-05-23 05:59:18" → asumir UTC
  const normalized = startedAt.replace(" ", "T") + "Z";
  const ms = Date.parse(normalized);
  return isNaN(ms) ? Date.now() : ms;
}

export function useStopwatch({
  durationSeconds,
  startedAt,
}: UseStopwatchOptions): UseStopwatchReturn {
  const isRunning = startedAt !== null;

  function calcElapsed(): number {
    if (!startedAt) return Math.max(0, durationSeconds);
    const startMs  = parseStartedAt(startedAt);
    const diffSecs = Math.floor((Date.now() - startMs) / 1000);
    return Math.max(0, durationSeconds + diffSecs);
  }

  const [elapsed, setElapsed]  = useState<number>(() => calcElapsed());
  const intervalRef            = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef           = useRef(startedAt);
  const durationRef            = useRef(durationSeconds);

  useEffect(() => {
    startedAtRef.current = startedAt;
    durationRef.current  = durationSeconds;
  }, [startedAt, durationSeconds]);

  useEffect(() => {
    // Calcular inmediatamente al cambiar props
    setElapsed(calcElapsed());

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      if (!startedAtRef.current) return;
      const startMs  = parseStartedAt(startedAtRef.current);
      const diffSecs = Math.floor((Date.now() - startMs) / 1000);
      setElapsed(Math.max(0, durationRef.current + diffSecs));
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [startedAt, durationSeconds, isRunning]);

  return {
    elapsed,
    display:   formatTime(elapsed),
    isRunning,
  };
}

function formatTime(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const h    = Math.floor(safe / 3600);
  const m    = Math.floor((safe % 3600) / 60);
  const s    = safe % 60;

  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}