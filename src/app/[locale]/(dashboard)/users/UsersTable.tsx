"use client";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, type Column } from "@/components/ui/Table";
import type { Employee } from "@/types/user.types";

interface Props {
  data: Employee[];
  offset: number;
  onEdit: (user: Employee) => void;
}

export function UsersTable({ data, offset, onEdit }: Props) {
  const columns: Column<Employee>[] = [
    {
      key: "name",
      header: "Nombre",
      render: (row) => (
        <div>
          <strong>{row.name}</strong>
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
            {row.email}
          </p>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Teléfono",
      render: (row) =>
        row.number_prefix && row.phone
          ? `${row.number_prefix} ${row.phone}`
          : row.phone ?? "—",
    },
    {
      key: "type_document",
      header: "Tipo de documento",
      render: (row) => row.type_document ?? "—",
    },
    {
      key:"document_number",
      header: "Número de documento",
      render: (row) => row.document_number ?? "—",
    },
    {
      key: "roles",
      header: "Rol",
      width: "120px",
      render: (row) => (
        <Badge variant="info">
          {row.roles[0]?.name ?? "—"}
        </Badge>
      ),
    },
    {
      key: "is_busy",
      header: "Disponibilidad",
      width: "130px",
      render: (row) => (
        <Badge variant={row.is_busy ? "warning" : "success"}>
          {row.is_busy ? "Ocupado" : "Disponible"}
        </Badge>
      ),
    },
    {
      key: "is_active",
      header: "Estado",
      width: "100px",
      render: (row) => (
        <Badge variant={row.is_active ? "success" : "error"}>
          {row.is_active ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      width: "100px",
      render: (row) => (
        <Button variant="ghost" size="sm" onClick={() => onEdit(row)}>
          Editar
        </Button>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={data}
      keyField="id"
      emptyText="No se encontraron usuarios"
      offset={offset}
    />
  );
}