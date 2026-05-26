"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalCache } from "@/hooks/useLocalCache";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { scheduleService } from "@/services/schedule.service";
import { userService } from "@/services/user.service";
 
 
import type { EmployeeSchedule } from "@/types/schedule.types";
import type { Employee } from "@/types/user.types";
import styles from "./ScheduleForm.module.css";
import { ScheduleFormValues, scheduleSchema } from "@/lib/validations/schedule.schema";

interface Props {
  defaultValues?: Partial<EmployeeSchedule>;
  isCreating?:    boolean;
  onSubmit:       (values: ScheduleFormValues, employee: Employee | null) => Promise<void>;
  onCancel:       () => void;
  isSubmitting?:  boolean;
}

export function ScheduleForm({
  defaultValues,
  isCreating = false,
  onSubmit,
  onCancel,
  isSubmitting,
}: Props) {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [assignedIds, setAssignedIds]           = useState<number[]>([]);
  const [loadingIds, setLoadingIds]             = useState(false);
  const [search, setSearch]                     = useState("");
  const [showDropdown, setShowDropdown]         = useState(false);

  // Cargar empleados
  const { rows: employees } = useLocalCache<Employee>(
    (params) => userService.getAll({ ...params, role: "employee" }),
    { keyField: "id", blockSize: 500, pageSize: 50 }
  );

  // Cargar IDs ya asignados
  useEffect(() => {
    if (!isCreating) return;
    setLoadingIds(true);
    scheduleService.getAssignedIds()
      .then(setAssignedIds)
      .catch(() => setAssignedIds([]))
      .finally(() => setLoadingIds(false));
  }, [isCreating]);

  // Filtrar empleados sin horario
  const availableEmployees = employees.filter(
    (e) => !assignedIds.includes(e.id)
  );

  const filteredEmployees = search
    ? availableEmployees.filter((e) =>
        e.name.toLowerCase().includes(search.toLowerCase())
      )
    : availableEmployees;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
  });

  useEffect(() => {
    reset({
      check_in:    defaultValues?.check_in    ?? "08:00",
      check_out:   defaultValues?.check_out   ?? "18:00",
      break_start: defaultValues?.break_start ?? "12:00",
      break_end:   defaultValues?.break_end   ?? "13:00",
    });
  }, [defaultValues, reset]);

  return (
    <div className={styles.form}>

      {/* Selector de empleado — solo al crear */}
      {isCreating && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Empleado</h3>

          {availableEmployees.length === 0 && !loadingIds ? (
            <div className={styles.allAssigned}>
              ✅ Todos los empleados ya tienen horario asignado
            </div>
          ) : (
            <div style={{ position: "relative" }}>
              {/* Selected */}
              {selectedEmployee ? (
                <div className={styles.employeeBadge}>
                  <div className={styles.employeeAvatar}>
                    {selectedEmployee.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className={styles.employeeName}>
                      {selectedEmployee.name}
                    </span>
                    <span className={styles.employeeHint}>
                      {selectedEmployee.email}
                    </span>
                  </div>
                  <button
                    type="button"
                    className={styles.clearBtn}
                    onClick={() => setSelectedEmployee(null)}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div
                  className={styles.employeeTrigger}
                  onClick={() => setShowDropdown(true)}
                >
                  👤 Seleccionar empleado sin horario
                </div>
              )}

              {/* Dropdown */}
              {showDropdown && !selectedEmployee && (
                <div className={styles.dropdown}>
                  <input
                    className={styles.dropdownSearch}
                    placeholder="Buscar empleado..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoFocus
                  />
                  <div className={styles.dropdownList}>
                    {filteredEmployees.length === 0 ? (
                      <div className={styles.dropdownEmpty}>
                        No hay empleados disponibles
                      </div>
                    ) : (
                      filteredEmployees.map((emp) => (
                        <div
                          key={emp.id}
                          className={styles.dropdownItem}
                          onClick={() => {
                            setSelectedEmployee(emp);
                            setShowDropdown(false);
                            setSearch("");
                          }}
                        >
                          <div className={styles.dropdownAvatar}>
                            {emp.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className={styles.dropdownName}>{emp.name}</p>
                            <p className={styles.dropdownEmail}>{emp.email}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {!selectedEmployee && availableEmployees.length > 0 && (
            <p className={styles.hint}>
              Solo se muestran empleados sin horario asignado
            </p>
          )}
        </div>
      )}

      {/* Badge al editar */}
      {!isCreating && defaultValues && (
        <div className={styles.employeeBadge}>
          <div className={styles.employeeAvatar}>
            {String(defaultValues.user_id ?? "?").charAt(0)}
          </div>
          <div>
            <span className={styles.employeeName}>
              Empleado #{defaultValues.user_id}
            </span>
            <span className={styles.employeeHint}>Editando horario</span>
          </div>
        </div>
      )}

      {/* Horario laboral */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Horario laboral</h3>
        <div className={styles.row}>
          <Input
            label="Entrada"
            type="time"
            fullWidth
            error={errors.check_in?.message}
            {...register("check_in")}
          />
          <Input
            label="Salida"
            type="time"
            fullWidth
            error={errors.check_out?.message}
            {...register("check_out")}
          />
        </div>
      </div>

      {/* Descanso */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Descanso (opcional)</h3>
        <div className={styles.row}>
          <Input
            label="Inicio"
            type="time"
            fullWidth
            error={errors.break_start?.message}
            {...register("break_start")}
          />
          <Input
            label="Fin"
            type="time"
            fullWidth
            error={errors.break_end?.message}
            {...register("break_end")}
          />
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="button"
          loading={isSubmitting}
          disabled={isCreating && !selectedEmployee}
          onClick={handleSubmit((values) => onSubmit(values, selectedEmployee))}
        >
          {isCreating ? "Asignar horario" : "Guardar cambios"}
        </Button>
      </div>
    </div>
  );
}