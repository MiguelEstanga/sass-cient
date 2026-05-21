"use client";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, type Column } from "@/components/ui/Table";
import { Service } from "@/types/services.types";
 
interface Props {
  data: Service[];
  offset: number;
  deletingId: number | null;
  onEdit: (service: Service) => void;
  onDelete: (id: number, name: string) => void;
}

export function ServicesTable({
  data,
  offset,
  deletingId,
  onEdit,
  onDelete,
}: Props) {
  const columns: Column<Service>[] = [
    {
      key: "name",
      header: "Servicio",
      render: (row) => (
        <div>
          <strong>{row.name}</strong>
          {row.description && (
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: 2 }}>
              {row.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "duration_minutes",
      header: "Duración",
      width: "100px",
      render: (row) => `${row.duration_minutes} min`,
    },
    {
      key: "price",
      header: "Precio",
      width: "100px",
      render: (row) => `$${parseFloat(row.price).toFixed(2)}`,
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
      width: "180px",
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
      emptyText="No se encontraron servicios"
      offset={offset}
    />
  );
}