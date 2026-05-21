"use client";

import { Badge } from "@/components/ui/Badge";
import { Table, type Column } from "@/components/ui/Table";
import type { LoanPayment } from "@/types/finance/payment.types";

interface Props { data: LoanPayment[]; offset: number; }

export function PaymentsTable({ data, offset }: Props) {
  const columns: Column<LoanPayment>[] = [
    {
      key: "loan",
      header: "Cliente",
      render: (row) => <div className="name">{row.loan?.user?.name ?? `Préstamo #${row.loan_id}`}</div>,
    },
    {
      key: "payment_number",
      header: "Cuota #",
      width: "90px",
      render: (row) => row.payment_number,
    },
    {
      key: "payment_amount",
      header: "Monto",
      width: "120px",
      render: (row) => <strong>${parseFloat(row.payment_amount).toFixed(2)}</strong>,
    },
    {
      key: "payment_date",
      header: "Fecha",
      width: "120px",
      render: (row) => new Date(row.payment_date).toLocaleDateString(),
    },
    {
      key: "status",
      header: "Estado",
      width: "110px",
      render: (row) => (
        <Badge variant={row.status === "completed" ? "success" : row.status === "failed" ? "error" : "warning"}>
          {row.status === "completed" ? "Completado" : row.status === "failed" ? "Fallido" : "Pendiente"}
        </Badge>
      ),
    },
  ];

  return <Table columns={columns} data={data} keyField="id" emptyText="No hay pagos registrados" offset={offset} />;
}