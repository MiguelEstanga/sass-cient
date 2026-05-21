"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table, type Column } from "@/components/ui/Table";
import type { Sale } from "@/types/sale.types";

// Diccionario para métodos de pago
const paymentLabels: Record<
  string,
  { label: string; variant: "success" | "info" | "warning" }
> = {
  cash: { label: "Efectivo", variant: "success" },
  card: { label: "Tarjeta", variant: "info" },
  transfer: { label: "Transferencia", variant: "info" },
  paypal: { label: "PayPal", variant: "warning" },
  stripe: { label: "Stripe", variant: "warning" },
  binance: { label: "Binance", variant: "warning" },
};

// Diccionario para estados
const statusLabels: Record<
  string,
  { label: string; variant: "success" | "error" | "warning" | "default" }
> = {
  pending: { label: "Pendiente", variant: "warning" },
  processed: { label: "Procesada", variant: "success" },
  cancelled: { label: "Anulada", variant: "error" },
};

interface Props {
  data: Sale[];
  offset: number;
  onViewDetail: (sale: Sale) => void; 
}

export function SalesTable({ data, offset , onViewDetail}: Props) {
  const columns: Column<Sale>[] = [
    {
      key: "created_at",
      header: "Fecha",
      width: "110px",
      render: (row) => (
        <span
          style={{
            fontSize: "var(--font-size-sm)",
            color: "var(--color-text-secondary)",
          }}
        >
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "client",
      header: "Cliente",
      render: (row) => (
        <div className="name">
          {/* Usamos client si existe, si no, user (vendedor) */}
          {row.client?.name || row.user?.name || "Consumidor Final"}
        </div>
      ),
    },
    {
      key: "items",
      header: "Items",
      width: "80px",
      render: (row) => (
        <span style={{ fontSize: "var(--font-size-sm)", fontWeight: 600 }}>
          {row.items?.length || 0}
        </span>
      ),
    },
    {
      key: "payment_method",
      header: "Método",
      width: "120px",
      render: (row) => {
        const pm = paymentLabels[row.payment_method] || {
          label: row.payment_method,
          variant: "default",
        };
        return <Badge variant={pm.variant}>{pm.label}</Badge>;
      },
    },
    {
      key: "total",
      header: "Total",
      width: "120px",
      render: (row) => (
        <strong style={{ color: "var(--color-text)" }}>
          ${parseFloat(row.total).toFixed(2)}
        </strong>
      ),
    },
    {
      key: "status",
      header: "Estado",
      width: "110px",
      render: (row) => {
        const st = statusLabels[row.status] || {
          label: row.status,
          variant: "default",
        };
        return <Badge variant={st.variant}>{st.label}</Badge>;
      },
    },
    {
      key: "payment_status",
      header: "Pago",
      width: "100px",
      render: (row) => (
        <Badge
          variant={row.payment_status === "completed" ? "success" : "warning"}
        >
          {row.payment_status === "completed" ? "Pagado" : "Pendiente"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      width: "120px",
      render: (row) => (
        <div className="actions">
          <Button variant="ghost" size="sm" onClick={() => onViewDetail(row)}>
            Ver Detalle
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
      emptyText="No se encontraron ventas"
      offset={offset}
    />
  );
}
