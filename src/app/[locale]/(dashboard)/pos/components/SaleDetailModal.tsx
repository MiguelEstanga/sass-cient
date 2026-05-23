"use client";

import { Drawer } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Table, type Column } from "@/components/ui/Table";
import type { Sale } from "@/types/sale.types";
import styles from "./SaleDetailModal.module.css";

interface Props {
  open:    boolean;
  onClose: () => void;
  sale:    Sale | null;
  onUpdate: () => void;
}

export function SaleDetailModal({ open, onClose, sale , onUpdate }: Props) {
  if (!sale) return null;

  const paymentLabels: Record<string, string> = {
    cash:     "Efectivo",
    card:     "Tarjeta",
    transfer: "Transferencia",
    paypal:   "PayPal",
    stripe:   "Stripe",
    binance:  "Binance",
  };

  const statusVariant: Record<string, "success" | "warning" | "error"> = {
    processed: "success",
    pending:   "warning",
    cancelled: "error",
  };

  // ── Columnas de la tabla de items ──────────────────────────────────────
  const itemColumns: Column<any>[] = [
    {
      key:    "name",
      header: "Producto / Servicio",
      render: (row) => (
        <div className={styles.itemNameCell}>
          {row.product?.image_url && (
            <img
              src={row.product.image_url}
              alt=""
              className={styles.itemImage}
            />
          )}
          <span>{row.product?.name ?? row.service?.name ?? "Item"}</span>
        </div>
      ),
    },
    {
      key:    "performer",
      header: "Ejecutor",
      width:  "130px",
      render: (row) =>
        row.performer ? (
          <div className={styles.performerCell}>
            <div className={styles.performerAvatar}>
              {row.performer.name.charAt(0).toUpperCase()}
            </div>
            <span className={styles.performerName}>
              {row.performer.name}
            </span>
          </div>
        ) : (
          <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-xs)" }}>
            —
          </span>
        ),
    },
    {
      key:    "unit_price",
      header: "P. Unit.",
      width:  "80px",
      render: (row) => <span>${parseFloat(row.unit_price).toFixed(2)}</span>,
    },
    {
      key:    "quantity",
      header: "Cant.",
      width:  "60px",
      render: (row) => <span>{row.quantity}</span>,
    },
    {
      key:    "subtotal",
      header: "Subtotal",
      width:  "90px",
      render: (row) => (
        <strong>${parseFloat(row.subtotal).toFixed(2)}</strong>
      ),
    },
  ];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={`Comprobante #${sale.id}`}
      subtitle={`Generado el ${new Date(sale.created_at).toLocaleDateString()}`}
    >
      <div className={styles.receipt}>

        {/* Cabecera con estado */}
        <div className={styles.receiptHeader}>
          <h2 className={styles.companyName}>Comprobante de Venta</h2>
          <Badge variant={statusVariant[sale.status]}>
            {sale.status === "processed"
              ? "PROCESADA"
              : sale.status.toUpperCase()}
          </Badge>
        </div>

        <div className={styles.divider} />

        {/* Info general */}
        <div className={styles.infoGrid}>
          <div className={styles.infoBlock}>
            <span className={styles.infoLabel}>Método de Pago</span>
            <span className={styles.infoValue}>
              {paymentLabels[sale.payment_method] ?? sale.payment_method}
            </span>
          </div>
          <div className={styles.infoBlock}>
            <span className={styles.infoLabel}>Estado Pago</span>
            <Badge
              variant={sale.payment_status === "completed" ? "success" : "warning"}
            >
              {sale.payment_status === "completed" ? "Pagado" : "Pendiente"}
            </Badge>
          </div>
          <div className={styles.infoBlock}>
            <span className={styles.infoLabel}>Tipo</span>
            <Badge variant="info">
              {sale.type === "service" ? "Servicio" : "Producto"}
            </Badge>
          </div>
        </div>

        <div className={styles.divider} />

        {/* Datos del cliente */}
        <div className={styles.sectionTitle}>📄 Datos del Cliente</div>
        {sale.client ? (
          <div className={styles.infoGrid}>
            <div className={styles.infoBlock}>
              <span className={styles.infoLabel}>Nombre</span>
              <span className={styles.infoValue}>{sale.client.name}</span>
            </div>
            <div className={styles.infoBlock}>
              <span className={styles.infoLabel}>Documento</span>
              <span className={styles.infoValue}>
                {sale.client.type_document} -{" "}
                {sale.client.document_number ?? "N/A"}
              </span>
            </div>
            <div className={styles.infoBlock}>
              <span className={styles.infoLabel}>Teléfono</span>
              <span className={styles.infoValue}>
                {sale.client.phone ?? "No registrado"}
              </span>
            </div>
            <div className={styles.infoBlock}>
              <span className={styles.infoLabel}>Email</span>
              <span className={styles.infoValue}>
                {sale.client.email ?? "No registrado"}
              </span>
            </div>
          </div>
        ) : (
          <p className={styles.noClientText}>Venta a consumidor final</p>
        )}

        <div className={styles.divider} />

        {/* Cajero — era "Vendedor" */}
        <div className={styles.sectionTitle}>🖥️ Cajero</div>
        <div className={styles.sellerBox}>
          <span className={styles.sellerName}>
            {sale.user?.name ?? "Sistema"}
          </span>
          {sale.user?.email && (
            <span className={styles.sellerEmail}>{sale.user.email}</span>
          )}
        </div>

        <div className={styles.divider} />

        {/* Tabla de items con columna Ejecutor */}
        <div className={styles.sectionTitle}>
          {sale.type === "service" ? "✂️ Detalle de Servicios" : "🛒 Detalle de Productos"}
        </div>
        <Table
          columns={itemColumns}
          data={sale.items ?? []}
          keyField="id"
          emptyText="Sin items"
          offset={0}
        />

        {/* Totales */}
        <div className={styles.totalsSection}>
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Subtotal:</span>
            <span className={styles.totalValue}>
              ${parseFloat(sale.subtotal).toFixed(2)}
            </span>
          </div>
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Impuestos:</span>
            <span className={styles.totalValue}>
              ${parseFloat(sale.tax).toFixed(2)}
            </span>
          </div>
          <div className={styles.mainTotalRow}>
            <span className={styles.mainTotalLabel}>TOTAL A PAGAR:</span>
            <span className={styles.mainTotalValue}>
              ${parseFloat(sale.total).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Notas opcionales */}
        {sale.notes && (
          <>
            <div className={styles.divider} />
            <div className={styles.sectionTitle}>📝 Notas</div>
            <p className={styles.notesText}>{sale.notes}</p>
          </>
        )}
      </div>
    </Drawer>
  );
}