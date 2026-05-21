"use client";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, type Column } from "@/components/ui/Table";
import type { Transaction } from "@/types/finance/transaction.types";

interface Props { 
  data: Transaction[]; 
  offset: number; 
  deletingId: number | null; // <-- Nuevo
  onEdit: (transaction: Transaction) => void; // <-- Nuevo
  onDelete: (id: number, concept: string) => void; // <-- Nuevo
}

export function TransactionsTable({ data, offset, deletingId, onEdit, onDelete }: Props) {
  const columns: Column<Transaction>[] = [
    {
      key: "created_at",
      header: "Fecha",
      width: "100px",
      render: (row) => (
        <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "concept",
      header: "Concepto",
      render: (row) => <div className="name">{row.description || row.description}</div>,
    },
    {
      key: "category",
      header: "Categoría",
      width: "150px",
      render: (row) => (
        <span style={{ fontSize: "var(--font-size-sm)", color: row.category ? "var(--color-text)" : "var(--color-text-muted)" }}>
          {row.category?.name ?? "—"}
        </span>
      ),
    },
    {
      key: "type",
      header: "Tipo",
      width: "100px",
      render: (row) => (
        <Badge variant={row.type === "income" ? "success" : "error"}>
          {row.type === "income" ? "Entrada" : "Salida"}
        </Badge>
      ),
    },
    {
      key: "amount",
      header: "Monto",
      width: "120px",
      render: (row) => (
        <strong style={{ color: row.type === "income" ? "var(--color-success)" : "var(--color-text)" }}>
          {row.type === "income" ? "+" : "-"}${parseFloat(row.amount).toFixed(2)}
        </strong>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      width: "180px",
      render: (row) => (
        <div className="actions">
          <Button variant="ghost" size="sm" onClick={() => onEdit(row)}>
            Editar
          </Button>
          <Button 
            variant="danger" 
            size="sm" 
            loading={deletingId === row.id} 
            onClick={() => onDelete(row.id, row.description || row.description || "Este movimiento")}
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
      emptyText="No hay movimientos registrados"
      offset={offset}
    />
  );
}