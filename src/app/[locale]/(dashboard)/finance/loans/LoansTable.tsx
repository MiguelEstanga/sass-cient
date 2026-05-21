"use client";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, type Column } from "@/components/ui/Table";
 import type { Loan } from "@/types/finance/loan.types";
import { StatusBadge } from "@/components/StatusBadge";

interface Props {
  data: Loan[];
  offset: number;
  deletingId: number | null;
  onEdit: (loan: Loan) => void;
  onDelete: (id: number, name: string) => void;
  onOpenPayment: (loan: Loan) => void;       // <-- NUEVO
  onOpenRecord: (loan: Loan) => void;         // <-- NUEVO
}

export function LoansTable({ data, offset, deletingId, onEdit, onDelete, onOpenPayment, onOpenRecord }: Props) {
  const columns: Column<Loan>[] = [
    {
      key: "user",
      header: "Cliente",
      render: (row) => (
        <div>
          <div className="name">{row.user?.name ?? `Usuario #${row.user_id}`}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
            {row.category?.name}
          </div>
        </div>
      ),
    },
    {
      key: "loan_amount",
      header: "Monto",
      width: "110px",
      render: (row) => <strong>${parseFloat(row.loan_amount).toFixed(2)}</strong>,
    },
    {
      key: "interest_rate",
      header: "Interés",
      width: "80px",
      render: (row) => `${parseFloat(row.interest_rate)}%`,
    },
    {
      key: "term_months",
      header: "Plazo",
      width: "80px",
      render: (row) => `${row.term_months}m`,
    },
    {
      key: "status",
      header: "Estado",
      width: "100px",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions",
      header: "Acciones",
      width: "250px", // Más ancho para los 4 botones
      render: (row) => (
        <div className="actions" style={{ flexWrap: "wrap", gap: "4px" }}>
          {/* Ojito del Record */}
          <Button variant="ghost" size="sm" onClick={() => onOpenRecord(row)}>
            👁️
          </Button>
          
          {/* Pago Parcial */}
          {row.status === "active" && (
            <Button variant="ghost" size="sm" onClick={() => onOpenPayment(row)}>
              💵 Pago
            </Button>
          )}

          <Button variant="ghost" size="sm" onClick={() => onEdit(row)}>
            Editar
          </Button>
          
          <Button variant="danger" size="sm" loading={deletingId === row.id} onClick={() => onDelete(row.id, row.user?.name ?? "Préstamo")}>
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
      emptyText="No se encontraron préstamos"
      offset={offset}
    />
  );
}