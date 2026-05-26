import { z } from "zod";

export const appointmentSchema = z.object({
  client_id:  z.number(),
  user_id:    z.number(),
  service_id: z.number(),
  start_time: z.string().min(1, "La hora de inicio es obligatoria"),
});

export type AppointmentFormValues = z.infer<typeof appointmentSchema>;