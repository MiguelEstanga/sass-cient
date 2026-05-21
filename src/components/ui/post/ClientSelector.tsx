"use client";

import { useState } from "react";
import { clientService } from "@/services/client.service";
import { useLocalCache } from "@/hooks/useLocalCache";
import { useToast } from "@/hooks/useToast";
import { Input } from "@/components/ui/Input";
import { Drawer } from "@/components/ui/Modal";
 import { ApiError } from "@/lib/api/errors";
import type { Client } from "@/types/client.types";
import type { ClientFormValues } from "@/lib/validations/client.schema";
import styles from "./ClientSelector.module.css";
import { ClientForm } from "@/app/[locale]/(dashboard)/clients/components/ClientForm";
import { useTranslations } from "next-intl";
interface Props {
  selectedClient: Client | null;
  onSelect: (client: Client) => void;
  onClear: () => void;
}

export function ClientSelector({ selectedClient, onSelect, onClear }: Props) {
  const toast = useToast();
  const [showDropdown, setShowDropdown] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations("pos");
  // Caché de clientes
  const {
    rows: clients,
    search,
    setSearch,
    refresh, // <-- La magia para refrescar sin recargar página
  } = useLocalCache<Client>(
    (params) => clientService.getAll(params),
    { keyField: "id", blockSize: 1500, pageSize: 10 }
  );

  // Se ejecuta al crear un cliente nuevo desde aquí
  async function handleCreateClient(values: ClientFormValues) {
    setIsSubmitting(true);
    try {
      const newClient = await clientService.create(values);
      toast.success(`${values.name} creado correctamente`);
      
      setDrawerOpen(false);
      refresh(); // <-- Forzamos al hook a traerse al nuevo cliente de la BD
      onSelect(newClient); // <-- Seleccionamos automáticamente el cliente nuevo
      setSearch(""); // Limpiamos el buscador
    } catch (err) {
      if (err instanceof ApiError && err.isValidationError()) {
        toast.error(err.getAllErrors().join(", "));
      } else {
        toast.error(err instanceof ApiError ? err.message : "Error al crear cliente");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.container}>
      {selectedClient ? (
        <div className={styles.selectedBox}>
          <div>
            <span className={styles.selectedName}>{selectedClient.name}</span>
            <div className={styles.selectedInfo}>
              {selectedClient.phone || selectedClient.email || "Sin contacto"}
            </div>
          </div>
          <button className={styles.clearBtn} onClick={onClear}>✕ Quitar</button>
        </div>
      ) : (
        <div className={styles.triggerBox} onClick={() => setShowDropdown(true)}>
          <span>+ Seleccionar Cliente</span>
        </div>
      )}

      {/* Dropdown de Búsqueda */}
      {showDropdown && !selectedClient && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownSearch}>
            <Input
              placeholder="Buscar por nombre, teléfono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
              autoFocus
            />
          </div>
          
          <div className={styles.dropdownList}>
            {clients.map((client) => (
              <div
                key={client.id}
                className={styles.dropdownItem}
                onClick={() => {
                  onSelect(client);
                  setShowDropdown(false);
                  setSearch("");
                }}
              >
                <strong>{client.name}</strong>
                <span className={styles.dropdownItemSub}>
                  {client.phone || client.email || "Sin contacto"}
                </span>
              </div>
            ))}
            {clients.length === 0 && (
              <div className={styles.emptyDropdown}>No se encontraron clientes</div>
            )}
          </div>

          <button 
            className={styles.newClientBtn} 
            onClick={() => { setShowDropdown(false); setDrawerOpen(true); }}
          >
            + Crear nuevo cliente
          </button>
        </div>
      )}

      {/* Drawer para Crear Cliente */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Nuevo Cliente"
        subtitle="Se añadirá automáticamente a la venta"
      >
        <ClientForm
          onSubmit={handleCreateClient}
          onCancel={() => setDrawerOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Drawer>
    </div>
  );
}