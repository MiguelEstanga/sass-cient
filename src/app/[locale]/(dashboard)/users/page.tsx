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
import { UserForm } from "./components/UserForm";
import type { Employee } from "@/types/user.types";
import type { UpdateEmployeeFormValues } from "@/lib/validations/user.schema";
import styles from "./styles/users.module.css";
import { Roles } from "@/types/roles.types";
import { roleService } from "@/services/role.service";

const PAGE_SIZE = Number(process.env.NEXT_PUBLIC_PAGE_SIZE) || 10;
const PAGINATION_SIZE = Number(process.env.NEXT_PUBLIC_PAGINATION_SIZE) || 1;
const ROLE_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "employee", label: "Empleados" },
  { value: "admin", label: "Administradores" },
  { value: "customer", label: "Clientes" },
];

export default function UsersPage() {
  const toast = useToast();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roleFilter, setRoleFilter] = useState("");
  const [roles, setRoles] = useState<Roles[]>([]);
  const fetcher = useCallback(
    (params: any) => userService.getAll({ ...params, role: roleFilter }),
    [roleFilter], // Solo cambiará cuando el rol cambie de verdad
  );
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
  } = useLocalCache<Employee>(fetcher, {
    keyField: "id",
    blockSize: Number(process.env.NEXT_PUBLIC_PAGE_SIZE) || 50,
    pageSize: PAGE_SIZE,
  });
  const isFirstRun = useRef(true);

  useEffect(() => {
    roleService.getAll().then((res) => {
      console.log(res);
      setRoles(res);
    });
  }, []);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    refresh();
  }, [roleFilter, refresh]);

  function openCreate() {
    setEditing(null);
    setDrawerOpen(true);
  }

  function openEdit(user: Employee) {
    setEditing(user);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditing(null);
  }

  async function handleSubmit(values: UpdateEmployeeFormValues) {
    setIsSubmitting(true);

    try {
      // Si la contraseña está vacía, no la enviamos
      const payload = { ...values };
      if (!payload.password) delete payload.password;
      if (editing) {
        await userService.update(editing.id, payload);
        toast.success(`${values.name} actualizado correctamente`);
      }else{
        await userService.create(payload);
        toast.success(`${values.name} creado correctamente`);
      }

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

  return (
    
    <div className={styles.page}>
        {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Usuarios</h1>
          <p className={styles.subtitle}>
            {total > 0 ? `${total} clientes registrados` : ""}
          </p>
        </div>
        <Button onClick={openCreate}>+ Nuevo Usuarios</Button>
      </div>
    
      

      {/* Toolbar: search + role filter */}
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

      {/* Table */}
      {loading ? (
        <div className={styles.skeletons}>
          {Array.from({ length: 2 }).map((_, i) => (
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

      {/* Pagination */}
      <Paginator
        page={page}
        lastPage={lastPage}
        total={total}
        pageSize={PAGE_SIZE}
        loading={loading}
        onChange={setPage}
      />

      {/* Drawer edición */}
      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={editing ? `Editando a ${editing.name}` : "crear nuevo usuario"}
        subtitle={editing ? `Editando a ${editing.name}` : ""}
      >
        <UserForm
          defaultValues={editing ?? undefined}
          onSubmit={handleSubmit}
          onCancel={closeDrawer}
          isSubmitting={isSubmitting}
          roles={roles}
        />
      </Drawer>
    </div>
  );
}
