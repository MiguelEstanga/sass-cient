"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { userService } from "@/services/user.service";
import { useToast } from "@/hooks/useToast";
import { useLocalCache } from "@/hooks/useLocalCache";
import { ApiError } from "@/lib/api/errors";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Drawer } from "@/components/ui/Modal";
import { Paginator } from "@/components/ui/Pagination";
import { SkeletonRow } from "@/components/ui/Skeleton";
import { UsersTable } from "./UsersTable";
import { PersonForm } from "@/components/ui/PersonForm";
 
import type { Employee, Person } from "@/types/user.types";
 import styles from "./styles/users.module.css";
 import { UserCreateForm } from "./components/UserForm";
import { UpdatePersonFormValues } from "@/lib/validations/person.schema";

const PAGE_SIZE   = Number(process.env.NEXT_PUBLIC_PAGE_SIZE) || 10;

const ROLE_OPTIONS = [
  { value: "",         label: "Todos"            },
  { value: "employee", label: "Empleados"        },
  { value: "admin",    label: "Administradores"  },
  { value: "customer", label: "Clientes"         },
];

export default function UsersPage() {
  const toast = useToast();

  const [drawerOpen, setDrawerOpen]     = useState(false);
  const [editing, setEditing]           = useState<Person | null>(null);
  const [isCreating, setIsCreating]     = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roleFilter, setRoleFilter]     = useState("");

  const fetcher = useCallback(
    (params: any) => userService.getAll({ ...params, role: roleFilter }),
    [roleFilter]
  );

  const {
    rows, total, page, lastPage,
    loading, search, setSearch, setPage, refresh,
  } = useLocalCache<Employee>(fetcher, {
    keyField:  "id",
    blockSize: Number(process.env.NEXT_PUBLIC_PAGE_SIZE) || 50,
    pageSize:  PAGE_SIZE,
  });

  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) { isFirstRun.current = false; return; }
    refresh();
  }, [roleFilter, refresh]);

  // ── Abrir crear ───────────────────────────────────────────────────────
  function openCreate() {
    setEditing(null);
    setIsCreating(true);
    setDrawerOpen(true);
  }

  // ── Abrir editar ──────────────────────────────────────────────────────
  function openEdit(user: Employee) {
    setEditing({ ...user, _type: "employee" });
    setIsCreating(false);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditing(null);
    setIsCreating(false);
  }

  // ── Submit edición ────────────────────────────────────────────────────
  async function handleUpdate(values: UpdatePersonFormValues) {
    if (!editing) return;
    setIsSubmitting(true);
    try {
      const payload = { ...values };
      if (!payload.password) delete payload.password;

      await userService.update(editing.id, payload, editing._type);
      toast.success(`${values.name} actualizado correctamente`);
      closeDrawer();
      refresh();
    } catch (err) {
      if (err instanceof ApiError && err.isValidationError()) {
        toast.error(err.getAllErrors().join(", "));
      } else {
        toast.error(err instanceof ApiError ? err.message : "Error de conexión");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Submit creación ───────────────────────────────────────────────────
  async function handleCreate(values: any) {
    setIsSubmitting(true);
    try {
      await userService.create(values);
      toast.success(`${values.name} creado correctamente`);
      closeDrawer();
      refresh();
    } catch (err) {
      if (err instanceof ApiError && err.isValidationError()) {
        toast.error(err.getAllErrors().join(", "));
      } else {
        toast.error(err instanceof ApiError ? err.message : "Error de conexión");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>

      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Usuarios</h1>
          <p className={styles.subtitle}>
            {total > 0 ? `${total} usuarios registrados` : ""}
          </p>
        </div>
        <Button onClick={openCreate}>+ Nuevo Usuario</Button>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <Input
          placeholder="Buscar por nombre o correo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
        />
        <Select
          options={ROLE_OPTIONS}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        />
      </div>

      {/* Tabla */}
      {loading ? (
        <div className={styles.skeletons}>
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : (
        <UsersTable
          data={rows}
          offset={(page - 1) * PAGE_SIZE}
          onEdit={openEdit}
        />
      )}

      {/* Paginación */}
      <Paginator
        page={page}
        lastPage={lastPage}
        total={total}
        pageSize={PAGE_SIZE}
        loading={loading}
        onChange={setPage}
      />

      {/* Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={isCreating ? "Nuevo usuario" : "Editar empleado"}
        subtitle={
          isCreating
            ? "Completa los datos del nuevo usuario"
            : editing ? `Editando a ${editing.name}` : ""
        }
      >
        {isCreating ? (
          <UserCreateForm
            onSubmit={handleCreate}
            onCancel={closeDrawer}
            isSubmitting={isSubmitting}
          />
        ) : editing ? (
          <PersonForm
            key={editing.id}
            person={editing}
            onSubmit={handleUpdate}
            onCancel={closeDrawer}
            isSubmitting={isSubmitting}
          />
        ) : null}
      </Drawer>
    </div>
  );
}