"use client";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, type Column } from "@/components/ui/Table";
import type { Client } from "@/types/client.types";

interface Props {
  data: Client[];
  offset: number;
  deletingId: number | null;
  onEdit: (client: Client) => void;
  onDelete: (id: number, name: string) => void;
}

export function ClientsTable({
  data,
  offset,
  deletingId,
  onEdit,
  onDelete,
}: Props) {
  const columns: Column<Client>[] = [
    {
      key: "name",
      header: "Nombre",
      render: (row) => <strong>{row.name}</strong>,
    },
    {
      key: "phone",
      header: "Teléfono",
      render: (row) => row.phone ?? "—",
    },
    {
      key: "email",
      header: "Correo",
      render: (row) => row.email ?? "—",
    },
    {
      key: "appointments_count",
      header: "Citas",
      width: "80px",
      render: (row) => row.appointments_count ?? 0,
    },
    {
      key: "sales_count",
      header: "Ventas",
      width: "80px",
      render: (row) => row.sales_count ?? 0,
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
      width: "150px",
      render: (row) => (
        <div style={{ display: "flex", gap: "var(--spacing-xs)" }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(row)}
          >
            Editar
          </Button>
          <Button
            variant="danger"
            size="sm"
            loading={deletingId === row.id}
            onClick={() => onDelete(row.id, row.name)}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={data}
      keyField="id"
      emptyText="No se encontraron clientes"
      offset={offset}
    />
  );
}