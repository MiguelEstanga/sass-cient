"use client";

import { Drawer } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Table, type Column } from "@/components/ui/Table";
import type { Sale } from "@/types/sale.types";
import styles from "./SaleDetailModal.module.css";

interface Props {
  open: boolean;
  onClose: () => void;
  sale: Sale | null;
}

export function SaleDetailModal({ open, onClose, sale }: Props) {
  if (!sale) return null;

  const paymentLabels: Record<string, string> = {
    cash: "Efectivo",
    card: "Tarjeta",
    transfer: "Transferencia",
    paypal: "PayPal",
    stripe: "Stripe",
    binance: "Binance",
  };

  const statusVariant: Record<string, "success" | "warning" | "error"> = {
    processed: "success",
    pending: "warning",
    cancelled: "error",
  };

  const itemColumns: Column<any>[] = [
    {
      key: "name",
      header: "Producto / Servicio",
      render: (row) => (
        <div className={styles.itemNameCell}>
          {row.product?.image_url && (
            <img src={row.product.image_url} alt="" className={styles.itemImage} />
          )}
          <span>{row.product?.name || row.service?.name || "Item"}</span>
        </div>
      ),
    },
    {
      key: "unit_price",
      header: "P. Unitario",
      width: "100px",
      render: (row) => <span>${parseFloat(row.unit_price).toFixed(2)}</span>,
    },
    {
      key: "quantity",
      header: "Cant.",
      width: "70px",
      render: (row) => <span>{row.quantity}</span>,
    },
    {
      key: "subtotal",
      header: "Subtotal",
      width: "100px",
      render: (row) => <strong>${parseFloat(row.subtotal).toFixed(2)}</strong>,
    },
  ];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={`Comprobante #${sale.id}`} // <-- Mejorado aquí
      subtitle={`Generado el ${new Date(sale.created_at).toLocaleDateString()}`} // <-- String simple aquí
    >
      <div className={styles.receipt}>
        
        {/* Cabecera */}
        <div className={styles.receiptHeader}>
          <h2 className={styles.companyName}>
            Comprobante de Venta
          </h2>
          <Badge variant={statusVariant[sale.status]} >
            {sale.status === 'processed' ? 'PROCESADA' : sale.status.toUpperCase()}
          </Badge>
        </div>

        <div className={styles.divider} />

        {/* Info General */}
        <div className={styles.infoGrid}>
          <div className={styles.infoBlock}>
            <span className={styles.infoLabel}>Método de Pago</span>
            <span className={styles.infoValue}>{paymentLabels[sale.payment_method] || sale.payment_method}</span>
          </div>
          <div className={styles.infoBlock}>
            <span className={styles.infoLabel}>Estado Pago</span>
            <Badge variant={sale.payment_status === 'completed' ? 'success' : 'warning'}>
              {sale.payment_status === 'completed' ? 'Pagado' : 'Pendiente'}
            </Badge>
          </div>
        </div>

        <div className={styles.divider} />

        {/* Cliente */}
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
                {sale.client.type_document} - {sale.client.document_number || 'N/A'}
              </span>
            </div>
            <div className={styles.infoBlock}>
              <span className={styles.infoLabel}>Teléfono</span> {/* <-- AQUÍ ESTABA EL FALTO DE styles. */}
              <span className={styles.infoValue}>{sale.client.phone || 'No registrado'}</span>
            </div>
            <div className={styles.infoBlock}>
              <span className={styles.infoLabel}>Email</span>
              <span className={styles.infoValue}>{sale.client.email || 'No registrado'}</span>
            </div>
          </div>
        ) : (
          <p className={styles.noClientText}>Venta a consumidor final</p>
        )}

        <div className={styles.divider} />

        {/* Vendedor */}
        <div className={styles.sectionTitle}>👤 Vendedor</div>
        <div className={styles.sellerBox}>
          <span className={styles.sellerName}>{sale.user?.name || 'Sistema'}</span>
          {sale.user?.email && <span className={styles.sellerEmail}>{sale.user.email}</span>}
        </div>

        <div className={styles.divider} />

        {/* Tabla de Items */}
        <div className={styles.sectionTitle}>🛒 Detalle de Productos</div>
        
        <Table
          columns={itemColumns}
          data={sale.items || []}
          keyField="id"
          emptyText="Sin productos"
          offset={0}
        />

        {/* Totales */}
        <div className={styles.totalsSection}>
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Subtotal:</span>
            <span className={styles.totalValue}>${parseFloat(sale.subtotal).toFixed(2)}</span>
          </div>
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Impuestos:</span>
            <span className={styles.totalValue}>${parseFloat(sale.tax).toFixed(2)}</span>
          </div>
          
          <div className={styles.mainTotalRow}>
            <span className={styles.mainTotalLabel}>TOTAL A PAGAR:</span>
            <span className={styles.mainTotalValue}>${parseFloat(sale.total).toFixed(2)}</span>
          </div>
        </div>

        {/* Notas */}
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