"use client";

import { useState } from "react";
import { clientService } from "@/services/client.service";
import { useToast } from "@/hooks/useToast";
import { useLocalCache } from "@/hooks/useLocalCache";
import { useConfirm } from "@/hooks/useConfirm";
import { ApiError } from "@/lib/api/errors";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Drawer, ConfirmDialog } from "@/components/ui/Modal";
import { Paginator } from "@/components/ui/Pagination";
import { SkeletonRow } from "@/components/ui/Skeleton";
import { ClientsTable } from "./ClientsTable";
import { ClientForm } from "./components/ClientForm";
import { PersonForm } from "@/components/ui/PersonForm";
import type { Client } from "@/types/client.types";
import type { ClientProfile } from "@/types/user.types";
import type { ClientFormValues } from "@/lib/validations/client.schema";
import type { UpdatePersonFormValues } from "@/lib/validations/person.schema";
import styles from "./styles/clients.module.css";
import { usePinConfirm } from "@/hooks/usePinConfirm";
import { PinDialog } from "@/components/ui/PinDialog/PinDialog";
import { useRole } from "@/hooks/useRole";
import { Upload } from "lucide-react";
import { ImportDrawer } from "@/components/ui/ImportDrawer/ImportDrawer";
import { importService } from "@/services/import.service";
import { ExportMenu } from "@/components/ui/ExportMenu";
import { exportService } from "@/services/export.service";
import { PageActions } from "@/components/ui/PageActions";
const PAGE_SIZE = Number(process.env.NEXT_PUBLIC_PAGE_SIZE) || 10;

export default function ClientsPage() {
  const toast = useToast();
  const { confirm, dialogProps } = useConfirm();
  const { pinConfirm, pinDialogProps } = usePinConfirm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const {
    rows,
    total,
    page,
    lastPage,
    loading,
    search,
    setSearch,
    setPage,
    refresh,
  } = useLocalCache<Client>((params) => clientService.getAll(params), {
    keyField: "id",
    blockSize: 1500,
    pageSize: PAGE_SIZE,
  });

  function openCreate() {
    setEditing(null);
    setDrawerOpen(true);
  }

  function openEdit(client: Client) {
    setEditing(client);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditing(null);
  }

  // ── Crear cliente ─────────────────────────────────────────────────────
  async function handleCreate(values: ClientFormValues) {
    setIsSubmitting(true);
    try {
      await clientService.create(values);
      toast.success(`${values.name} creado correctamente`);
      closeDrawer();
      refresh();
    } catch (err) {
      if (err instanceof ApiError && err.isValidationError()) {
        toast.error(err.getAllErrors().join(", "));
      } else {
        toast.error(
          err instanceof ApiError ? err.message : "Error de conexión",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Editar cliente — usa PersonForm ───────────────────────────────────
  async function handleUpdate(values: UpdatePersonFormValues) {
    if (!editing) return;
    setIsSubmitting(true);
    try {
      await clientService.update(editing.id, values);
      toast.success(`${values.name} actualizado correctamente`);
      closeDrawer();
      refresh();
    } catch (err) {
      if (err instanceof ApiError && err.isValidationError()) {
        toast.error(err.getAllErrors().join(", "));
      } else {
        toast.error(
          err instanceof ApiError ? err.message : "Error de conexión",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDelete(id: number, name: string) {
    console.log("hola");
    pinConfirm({
      title: "Eliminar cliente",
      message: `¿Estás seguro de que quieres eliminar a ${name}? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        setDeletingId(id);
        try {
          await clientService.delete(id);
          toast.success(`${name} eliminado correctamente`);
          refresh();
        } catch (err) {
          toast.error(
            err instanceof ApiError ? err.message : "Error al eliminar",
          );
        } finally {
          setDeletingId(null);
        }
      },
    });
  }

  // ── Convertir Client a ClientProfile para PersonForm ──────────────────
  function toClientProfile(client: Client): ClientProfile {
    return {
      ...client,
      _type: "client",
      email: client.email ?? null,
      phone: client.phone ?? null,
      notes: client.notes ?? null,
      user_id: client.user_id ?? null,
      is_busy: false,
      roles: [],
    } as ClientProfile;
  }
  const { clients } = useRole();
  const [importOpen, setImportOpen] = useState(false);
  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Clientes</h1>
          <p className={styles.subtitle}>
            {total > 0 ? `${total} clientes registrados` : ""}
          </p>
        </div>
        <PageActions>
          <ExportMenu onExport={exportService.clients} />
          <Button onClick={openCreate}>+ Nuevo Cliente</Button>
        </PageActions>
      </div>

      <div className={styles.toolbar}>
        <Input
          placeholder="Buscar por nombre, teléfono o correo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
        />
      </div>

      {loading ? (
        <div className={styles.skeletons}>
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : (
        <ClientsTable
          data={rows}
          offset={(page - 1) * PAGE_SIZE}
          deletingId={deletingId}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}

      <Paginator
        page={page}
        lastPage={lastPage}
        total={total}
        pageSize={PAGE_SIZE}
        loading={loading}
        onChange={setPage}
      />

      {/* Drawer crear / editar */}
      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={editing ? "Editar cliente" : "Nuevo cliente"}
        subtitle={
          editing
            ? `Editando a ${editing.name}`
            : "Completa los datos del nuevo cliente"
        }
      >
        {editing ? (
          // ── Editar — PersonForm completo ────────────────────────────
          <PersonForm
            key={editing.id}
            person={toClientProfile(editing)}
            onSubmit={handleUpdate}
            onCancel={closeDrawer}
            isSubmitting={isSubmitting}
          />
        ) : (
          // ── Crear — ClientForm con hint de email ────────────────────
          <ClientForm
            onSubmit={handleCreate}
            onCancel={closeDrawer}
            isSubmitting={isSubmitting}
          />
        )}
      </Drawer>

      <PinDialog {...pinDialogProps} />
    </div>
  );
}
