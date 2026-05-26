import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const scheduleSchema = z
  .object({
    check_in: z
      .string()
      .regex(timeRegex, "Formato inválido (HH:MM)"),
    check_out: z
      .string()
      .regex(timeRegex, "Formato inválido (HH:MM)"),
    break_start: z
      .string()
      .regex(timeRegex, "Formato inválido (HH:MM)")
      .optional()
      .or(z.literal("")),
    break_end: z
      .string()
      .regex(timeRegex, "Formato inválido (HH:MM)")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => data.check_out > data.check_in,
    { message: "La salida debe ser después de la entrada", path: ["check_out"] }
  )
  .refine(
    (data) => {
      if (!data.break_start || !data.break_end) return true;
      return data.break_end > data.break_start;
    },
    { message: "El fin del descanso debe ser después del inicio", path: ["break_end"] }
  );

// ← Este es el tipo que necesitas
export type ScheduleFormValues = z.infer<typeof scheduleSchema>;