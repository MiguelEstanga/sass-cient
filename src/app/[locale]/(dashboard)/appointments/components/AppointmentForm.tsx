"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ClientSelector } from "@/components/ui/post/ClientSelector";
import { EmployeeSelector } from "@/components/ui/post/EmployeeSelector";
import { useLocalCache } from "@/hooks/useLocalCache";
import { serviceService } from "@/services/services.service";
import {
  appointmentSchema,
  type AppointmentFormValues,
} from "@/lib/validations/appointment.schema";
import type { Appointment } from "@/types/appointment.types";
import type { Client } from "@/types/client.types";
import type { Employee } from "@/types/user.types";
import type { Service } from "@/types/services.types";
import styles from "./AppointmentForm.module.css";

interface Props {
  defaultValues?: Partial<AppointmentFormValues>;
  appointment?: Appointment | null;
  onSubmit: (values: AppointmentFormValues) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => void;
  isSubmitting?: boolean;
}

export function AppointmentForm({
  defaultValues,
  appointment,
  onSubmit,
  onCancel,
  onDelete,
  isSubmitting,
}: Props) {
  // ── Estado local para los objetos seleccionados ────────────────────────
  const [selectedClient, setSelectedClient] = useState<Client | null>(() =>
    appointment
      ? ({
          id: appointment.client_id,
          name: appointment.client_name,
          email: null,
          phone: null,
          is_active: true,
          company_id: 0,
          notes: null,
          type_document: null,
          document_number: null,
          address: null,
          city: null,
          number_prefix: null,
          zip: null,
          user_id: null,
          created_at: "",
          updated_at: "",
        } as Client)
      : null,
  );
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    () =>
      appointment
        ? ({
            _type: "employee", // ← agregar
            id: appointment.employee_id,
            name: appointment.employee_name,
            email: "",
            is_active: true,
            is_busy: false,
            company_id: 0,
            phone: null,
            number_prefix: null,
            type_document: null,
            document_number: null,
            address: null,
            city: null,
            zip: null,
            roles: [],
            created_at: "",
            updated_at: "",
          } as Employee)
        : null,
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues,
  });

  const { rows: services } = useLocalCache<Service>(
    (params) => serviceService.getAll({ ...params, is_active: true }),
    { keyField: "id", blockSize: 500, pageSize: 50 },
  );

  // ── Al abrir en modo edición — precargar cliente y empleado ───────────
  useEffect(() => {
    console.log("selectedEmployee", appointment);

    if (appointment) {
      setValue("client_id", appointment.client_id);
      setValue("user_id", appointment.employee_id);
      setValue("service_id", appointment.service_id);
      setValue("start_time", appointment.start?.slice(0, 16) ?? "");
    } else if (defaultValues) {
      reset(defaultValues);
    }
  }, []);
  return (
    <div className={styles.form}>
      {/* Cliente */}
      <div className={styles.field}>
        <label className={styles.label}>
          Cliente <span className={styles.required}>*</span>
        </label>
        <ClientSelector
          selectedClient={selectedClient}
          onSelect={(client) => {
            setSelectedClient(client);
            setValue("client_id", client.id);
          }}
          onClear={() => {
            setSelectedClient(null);
            setValue("client_id", undefined as any);
          }}
        />
        {errors.client_id && (
          <p className={styles.error}>{errors.client_id.message}</p>
        )}
      </div>

      {/* Empleado */}
      <div className={styles.field}>
        <label className={styles.label}>
          Empleado <span className={styles.required}>*</span>
        </label>
        <EmployeeSelector
          value={selectedEmployee}
          onChange={(emp) => {
            setSelectedEmployee(emp);
            setValue("user_id", emp?.id ?? (undefined as any));
          }}
        />
        {errors.user_id && (
          <p className={styles.error}>{errors.user_id.message}</p>
        )}
      </div>

      {/* Servicio */}
      <div className={styles.field}>
        <label className={styles.label}>
          Servicio <span className={styles.required}>*</span>
        </label>
        <Select
          options={services.map((s) => ({ value: s.id, label: s.name }))}
          placeholder="Seleccionar servicio..."
          fullWidth
          {...register("service_id", { valueAsNumber: true })}
          error={errors.service_id?.message}
        />
      </div>

      {/* Hora de inicio */}
      <div className={styles.field}>
        <label className={styles.label}>
          Hora de inicio <span className={styles.required}>*</span>
        </label>
        <Input
          type="datetime-local"
          fullWidth
          error={errors.start_time?.message}
          {...register("start_time")}
        />
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        {onDelete && appointment && (
          <Button type="button" variant="danger" onClick={onDelete}>
            Cancelar cita
          </Button>
        )}
        <div className={styles.footerRight}>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Volver
          </Button>
          <Button
            type="button"
            loading={isSubmitting}
            onClick={handleSubmit(onSubmit)}
          >
            {appointment ? "Guardar cambios" : "Crear cita"}
          </Button>
        </div>
      </div>
    </div>
  );
}
