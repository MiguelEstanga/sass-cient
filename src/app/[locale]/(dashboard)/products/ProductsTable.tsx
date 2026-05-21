"use client";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, type Column } from "@/components/ui/Table";
import type { Product } from "@/types/product.types";

interface Props {
  data: Product[];
  offset: number;
  deletingId: number | null;
  onEdit: (product: Product) => void;
  onDelete: (id: number, name: string) => void;
}

export function ProductsTable({ data, offset, deletingId, onEdit, onDelete }: Props) {
  const columns: Column<Product>[] = [
    {
      key: "image_url",
      header: "Img",
      width: "60px",
      render: (row) => (
        <div style={{ 
          width: 40, height: 40, borderRadius: "var(--radius-md)", overflow: "hidden",
          background: "var(--color-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          {row.image_url ? (
            <img src={row.image_url} alt={row.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>N/A</span>
          )}
        </div>
      ),
    },
    {
      key: "name",
      header: "Producto",
      render: (row) => (
        <div>
          <div className="name">{row.name}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: 2 }}>
            {row.category?.name ?? "Sin categoría"}
          </div>
        </div>
      ),
    },
    {
      key: "barcode",
      header: "Código",
      width: "110px",
      render: (row) => (
        <span style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
          {row.barcode ?? "—"}
        </span>
      ),
    },
    {
      key: "cost_price",
      header: "Costo",
      width: "100px",
      render: (row) => `$${parseFloat(row.cost_price).toFixed(2)}`,
    },
    {
      key: "price",
      header: "Precio",
      width: "100px",
      render: (row) => (
        <strong style={{ color: "var(--color-text)" }}>
          ${parseFloat(row.price).toFixed(2)}
        </strong>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      width: "90px",
      render: (row) => {
        const isLow = row.stock <= row.min_stock;
        return (
          <Badge variant={isLow ? "warning" : "success"}>
            {row.stock} {isLow ? "(Bajo)" : ""}
          </Badge>
        );
      },
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
          <Button variant="ghost" size="sm" onClick={() => onEdit(row)}>
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
      emptyText="No se encontraron productos"
      offset={offset}
    />
  );
}