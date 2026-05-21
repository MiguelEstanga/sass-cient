"use client";

import { clientService } from "@/services/client.service";
import { useLocalCache } from "@/hooks/useLocalCache";
import { Input } from "@/components/ui/Input";
import type { Client } from "@/types/client.types";
import styles from "./EmployeeSelector.module.css";

interface Props {
  value: Client | null;
  onChange: (employee: Client | null) => void;
}

export function EmployeeSelector({ value, onChange }: Props) {
  const { rows: employees, search, setSearch } = useLocalCache<Client>(
    (params) => clientService.getAll(params),
    { keyField: "id", blockSize: 1500, pageSize: 10 }
  );

  return (
    <div className={styles.container}>
      <Input
        placeholder="Buscar empleado por nombre..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        fullWidth
      />
      <div className={styles.list}>
        {value && (
          <div className={styles.selectedBox}>
            <strong>{value.name}</strong>
            <button className={styles.clearBtn} onClick={() => onChange(null)}>✕</button>
          </div>
        )}
        <div className={styles.dropdown}>
          {employees.map((emp) => (
            <div 
              className={styles.item} 
              onClick={() => { onChange(emp); setSearch(""); }}
            >
              <strong>{emp.name}</strong>
              <span className={styles.sub}>{emp.email || emp.phone || "Sin contacto"}</span>
            </div>
          ))}
        </div>
      </div>
  </div>
);
}