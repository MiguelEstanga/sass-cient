"use client";

import { useState, useCallback, useEffect } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table, type Column } from "@/components/ui/Table";
import { Paginator } from "@/components/ui/Pagination";
import { SkeletonRow } from "@/components/ui/Skeleton";
import {
  DropdownMenu,
  type DropdownMenuItem,
} from "@/components/ui/DropdownMenu";
import { useLocalCache } from "@/hooks/useLocalCache";
import { useToast } from "@/hooks/useToast";
import { ApiError } from "@/lib/api/errors";
import { saleService } from "@/services/pos/sale.service";
import type { Sale } from "@/types/sale.types";
import type { FetchParams } from "@/hooks/useLocalCache";
import styles from "./styles/sales.module.css";
import { Icon } from "@/helpers/icons";

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

const statusLabels: Record<
  string,
  { label: string; variant: "success" | "error" | "warning" | "default" }
> = {
  pending: { label: "Pendiente", variant: "warning" },
  processed: { label: "Procesada", variant: "success" },
  cancelled: { label: "Anulada", variant: "error" },
};

type SaleType = "all" | "product" | "service";

const TABS: { key: SaleType; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "product", label: "🛒 Productos" },
  { key: "service", label: "✂️ Servicios" },
];

const PAGE_SIZE = Number(process.env.NEXT_PUBLIC_PAGE_SIZE) || 15;

interface Props {
  onViewDetail: (sale: Sale) => void;
  onRefreshReady?: (fn: () => void) => void;
}

export function SalesTable({ onViewDetail, onRefreshReady }: Props) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<SaleType>("all");
  // Tracking de qué fila está en loading
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [loadingType, setLoadingType] = useState<"status" | "payment" | null>(
    null,
  );

  const fetcher = useCallback(
    (params: FetchParams) =>
      saleService.getAll({
        ...params,
        ...(activeTab !== "all" ? { type: activeTab } : {}),
      }),
    [activeTab],
  );

  const { rows, total, page, lastPage, loading, setPage, refresh } =
    useLocalCache<Sale>(fetcher, {
      keyField: "id",
      blockSize: 1500,
      pageSize: PAGE_SIZE,
    });

  useEffect(() => {
    onRefreshReady?.(refresh);
  }, [refresh, onRefreshReady]);

  // ── Cambiar estado de la venta ─────────────────────────────────────────
  async function handleUpdateStatus(
    id: number,
    status: "pending" | "processed" | "cancelled",
  ) {
    setLoadingId(id);
    setLoadingType("status");
    try {
      await saleService.updateStatus(id, status);
      toast.success("Estado actualizado");
      refresh();
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Error al actualizar",
      );
    } finally {
      setLoadingId(null);
      setLoadingType(null);
    }
  }

  // ── Cambiar estado de pago ─────────────────────────────────────────────
  async function handleUpdatePaymentStatus(
    id: number,
    payment_status: "pending" | "completed" | "failed",
  ) {
    setLoadingId(id);
    setLoadingType("payment");
    try {
      await saleService.updatePaymentStatus(id, payment_status);
      toast.success("Estado de pago actualizado");
      refresh();
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Error al actualizar",
      );
    } finally {
      setLoadingId(null);
      setLoadingType(null);
    }
  }

  // ── Construir items del dropdown según el estado actual de la fila ─────
  function buildMenuItems(row: Sale): DropdownMenuItem[] {
    const isLoadingThis = loadingId === row.id;
    const items: DropdownMenuItem[] = [];

    // ── Estado de la venta ─────────────────────────────────────────────────
    if (row.status === "pending") {
      items.push({
        label: "Marcar procesada",
        icon: <Icon name="check" size={14} />,
        variant: "success",
        loading: isLoadingThis && loadingType === "status",
        onClick: () => handleUpdateStatus(row.id, "processed"),
      });
      items.push({
        label: "Cancelar venta",
        icon: <Icon name="close" size={14} />,
        variant: "danger",
        loading: isLoadingThis && loadingType === "status",
        onClick: () => handleUpdateStatus(row.id, "cancelled"),
      });
    }

    if (row.status === "processed") {
      items.push({
        label: "Procesada",
        icon: <Icon name="check" size={14} />,
        variant: "success",
        disabled: true,
        onClick: () => {},
      });
    }

    if (row.status === "cancelled") {
      items.push({
        label: "Reactivar venta",
        icon: <Icon name="refresh" size={14} />,
        loading: isLoadingThis && loadingType === "status",
        onClick: () => handleUpdateStatus(row.id, "pending"),
      });
    }

    // ── Separador ──────────────────────────────────────────────────────────
    items.push({ divider: true, label: "", onClick: () => {} });

    // ── Estado de pago ─────────────────────────────────────────────────────
    if (row.payment_status !== "completed") {
      items.push({
        label: "Marcar como pagado",
        icon: <Icon name="check" size={14} />,
        variant: "success",
        loading: isLoadingThis && loadingType === "payment",
        onClick: () => handleUpdatePaymentStatus(row.id, "completed"),
      });
    } else {
      items.push({
        label: "Pagado",
        icon: <Icon name="check" size={14} />,
        variant: "success",
        disabled: true,
        onClick: () => {},
      });
      items.push({
        label: "Revertir pago",
        icon: <Icon name="refresh" size={14} />,
        variant: "danger",
        loading: isLoadingThis && loadingType === "payment",
        onClick: () => handleUpdatePaymentStatus(row.id, "pending"),
      });
    }

    // ── Separador ──────────────────────────────────────────────────────────
    items.push({ divider: true, label: "", onClick: () => {} });

    // ── Ver detalle ────────────────────────────────────────────────────────
    items.push({
      label: "Ver detalle",
      icon: <Icon name="eye" size={14} />,
      onClick: () => onViewDetail(row),
    });

    return items;
  }

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
      key: "type",
      header: "Tipo",
      width: "100px",
      render: (row) => (
        <Badge variant={row.type === "service" ? "info" : "default"}>
          {row.type === "service" ? "✂️ Servicio" : "🛒 Producto"}
        </Badge>
      ),
    },
    {
      key: "client",
      header: "Cliente",
      render: (row) => (
        <div>{row.client?.name ?? row.user?.name ?? "Consumidor Final"}</div>
      ),
    },
    {
      key: "items",
      header: "Items",
      width: "70px",
      render: (row) => (
        <span style={{ fontSize: "var(--font-size-sm)", fontWeight: 600 }}>
          {row.items?.length ?? 0}
        </span>
      ),
    },
    {
      key: "payment_method",
      header: "Método",
      width: "120px",
      render: (row) => {
        const pm = paymentLabels[row.payment_method] ?? {
          label: row.payment_method,
          variant: "default" as const,
        };
        return <Badge variant={pm.variant}>{pm.label}</Badge>;
      },
    },
    {
      key: "total",
      header: "Total",
      width: "110px",
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
        const st = statusLabels[row.status] ?? {
          label: row.status,
          variant: "default" as const,
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
      width: "80px",
      render: (row) => <DropdownMenu items={buildMenuItems(row)} />,
    },
  ];

  return (
    <div>
      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
        <span className={styles.tabCount}>{total} registros</span>
      </div>

      {/* Tabla */}
      {loading ? (
        <div>
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : (
        <Table
          columns={columns}
          data={rows}
          keyField="id"
          emptyText="No se encontraron ventas"
          offset={(page - 1) * PAGE_SIZE}
        />
      )}

      {/* Paginación */}
      <Paginator
        page={page}
        lastPage={lastPage}
        total={total}
        pageSize={PAGE_SIZE}
        loading={loading}
        onChange={setPage}
      />
    </div>
  );
}
