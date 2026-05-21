"use client";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, type Column } from "@/components/ui/Table";
import type { FinanceCategory } from "@/types/finance/category.types";

interface Props {
  data: FinanceCategory[];
  offset: number;
  deletingId: number | null;
  onEdit: (category: FinanceCategory) => void;
  onDelete: (id: number, name: string) => void;
}

const typeLabels: Record<string, string> = {
  loan: "Préstamo",
  payment: "Pago",
  other: "Otro",
};

export function CategoriesTable({ data, offset, deletingId, onEdit, onDelete }: Props) {
  const columns: Column<FinanceCategory>[] = [
    {
      key: "name",
      header: "Nombre",
      render: (row) => (
        <div>
          <div className="name">{row.name}</div>
          {row.description && (
            <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: 2 }}>
              {row.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "type",
      header: "Tipo",
      width: "120px",
      render: (row) => <Badge variant="info">{typeLabels[row.type] || row.type}</Badge>,
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
        <div className="actions">
          <Button variant="ghost" size="sm" onClick={() => onEdit(row)}>Editar</Button>
          <Button variant="danger" size="sm" loading={deletingId === row.id} onClick={() => onDelete(row.id, row.name)}>
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
      emptyText="No se encontraron categorías"
      offset={offset}
    />
  );
}