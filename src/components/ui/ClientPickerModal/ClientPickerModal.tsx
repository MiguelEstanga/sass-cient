"use client";

import { useState } from "react";
import { clientService } from "@/services/client.service";
import { useLocalCache } from "@/hooks/useLocalCache";
import { Input } from "@/components/ui/Input";
import { Paginator } from "@/components/ui/Pagination";
import { SkeletonRow } from "@/components/ui/Skeleton";
import type { Client } from "@/types/client.types";
import styles from "./ClientPickerModal.module.css";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (client: Client) => void;
}

export function ClientPickerModal({ open, onClose, onSelect }: Props) {
  // Usamos tu hook con un pageSize pequeño (ej. 6) para que quepa en el modal
  const {
    rows,
    total,
    page,
    lastPage,
    loading,
    search,
    setSearch,
    setPage,
  } = useLocalCache<Client>(
    (params) => clientService.getAll(params),
    { keyField: "id", blockSize: 1500, pageSize: 6 } // 6 clientes por página en el modal
  );

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        <div className={styles.header}>
          <h3 className={styles.title}>Seleccionar Cliente</h3>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.searchContainer}>
          <Input
            placeholder="Buscar por nombre, teléfono, correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            autoFocus
          />
        </div>

        <div className={styles.listContainer}>
          {loading && rows.length === 0 ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
          ) : rows.length === 0 ? (
            <div className={styles.empty}>No se encontraron clientes</div>
          ) : (
            <ul className={styles.list}>
              {rows.map((client) => (
                <li
                  key={client.id}
                  className={styles.listItem}
                  onClick={() => onSelect(client)}
                >
                  <div className={styles.itemInfo}>
                    <strong className={styles.itemName}>{client.name}</strong>
                    <span className={styles.itemDetail}>
                      {client.phone || client.email || "Sin contacto"}
                    </span>
                  </div>
                  <span className={styles.itemArrow}>→</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {total > 6 && (
          <div className={styles.paginationContainer}>
            <Paginator
              page={page}
              lastPage={lastPage}
              total={total}
              pageSize={6}
              loading={loading}
              onChange={setPage}
            />
          </div>
        )}

      </div>
    </div>
  );
}