"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { PosModal } from "./components/PosModal";
 
import { useToast } from "@/hooks/useToast";
import { ApiError } from "@/lib/api/errors";
import type { CartItem, CreateSaleDto } from "@/types/pos.types";
import type { Client } from "@/types/client.types";
import styles from "./styles/pos.module.css";
import { saleService } from "@/services/pos/sale.service";
import { useTranslations } from "next-intl";
import { useLocalCache } from "@/hooks/useLocalCache";
import type { Sale } from "@/types/sale.types";
import { SkeletonRow } from "@/components/ui/Skeleton";
import { SalesTable } from "./SalesTable";
import { Paginator } from "@/components/ui/Pagination";
import { SaleDetailModal } from "./components/SaleDetailModal";
import { SaleTypeModal } from "./components/SaleTypeModal";

const PAGE_SIZE = Number(process.env.NEXT_PUBLIC_PAGE_SIZE) || 15;

export default function PosPage() {
  const toast = useToast();
  const t = useTranslations("sales");

  // Modales
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [posOpen, setPosOpen] = useState(false);
  const [saleMode, setSaleMode] = useState<"product" | "service">("product");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSelling, setIsSelling] = useState(false);

  const { rows, total, page, lastPage, loading, search, setSearch, setPage, refresh } =
    useLocalCache<Sale>(
      (params) => saleService.getAll(params),
      { keyField: "id", blockSize: 1500, pageSize: PAGE_SIZE }
    );

  // 1. Click en Nueva Venta → abre modal de tipo
  function handleNewSale() {
    setTypeModalOpen(true);
  }

  // 2. Usuario elige tipo → cierra type modal, abre POS con el modo
  function handleTypeSelect(type: "product" | "service") {
    setSaleMode(type);
    setCart([]); // Limpiar carrito al empezar nueva venta
    setTypeModalOpen(false);
    setPosOpen(true);
  }

  // 3. Checkout — maneja productos Y servicios
  async function handleFinishSale(
    client: Client | null,
    paymentMethod: string,
    mode: "product" | "service",
    employeeId?: number | null
  ) {
    if (!client) {
      toast.error("Debes seleccionar un cliente antes de cobrar");
      return;
    }

    if (mode === "service" && !employeeId) {
      toast.error("Debes seleccionar un ejecutor para el servicio");
      return;
    }

    setIsSelling(true);

    try {
      const itemsPayload = cart.map((item) => {
        if (mode === "product" && item.product) {
          return {
            product_id: item.product.id,
            quantity: item.quantity,
            price: parseFloat(String(item.product.price)),
          };
        } else if (mode === "service" && item.service) {
          return {
            service_id: item.service.id,
            quantity: item.quantity,
            price: parseFloat(String(item.service.price)),
            ...(employeeId ? { performance_id: employeeId } : {}),
          };
        }
        return null;
      }).filter(Boolean);

      const totalAmount = cart.reduce(
        (sum, item) => sum + parseFloat(String(
          mode === "product" ? item.product?.price : item.service?.price
        )) * item.quantity,
        0
      );

      const payload: CreateSaleDto = {
        type: mode,
        client_id: client.id,
        total: totalAmount,
        tax: 0,
        payment_method: paymentMethod,
        items: itemsPayload as CreateSaleDto["items"],
      };

      const response = await saleService.processCheckout(payload);
      toast.success(
        `Venta #${response.id} registrada por $${totalAmount.toFixed(2)}`
      );
      setCart([]);
      setPosOpen(false);
      refresh(); // Recargar tabla de ventas
    } catch (err) {
      if (err instanceof ApiError && err.isValidationError()) {
        toast.error(err.getAllErrors().join(", "));
      } else {
        toast.error(
          err instanceof ApiError ? err.message : "Error al procesar la venta"
        );
      }
    } finally {
      setIsSelling(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Punto de Venta</h1>
          <p className={styles.subtitle}>
            {cart.length > 0
              ? `Tienes ${cart.length} items en el carrito`
              : "Sin items en el carrito"}
          </p>
        </div>
        <Button onClick={handleNewSale} loading={isSelling}>
          {cart.length > 0 ? `Abrir POS (${cart.length})` : "+ Nueva Venta"}
        </Button>
      </div>

      {/* Tabla de ventas */}
      {loading ? (
        <div className={styles.tableWrapper}>
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : (
        <SalesTable
          data={rows}
          offset={(page - 1) * PAGE_SIZE}
          onViewDetail={setSelectedSale}
        />
      )}

      <div className={styles.pagination}>
        <Paginator
          page={page}
          lastPage={lastPage}
          total={total}
          pageSize={PAGE_SIZE}
          loading={loading}
          onChange={setPage}
        />
      </div>

      {/* Modal selección de tipo */}
      <SaleTypeModal
        open={typeModalOpen}
        onSelect={handleTypeSelect}
        onClose={() => setTypeModalOpen(false)}
      />

      {/* POS Modal */}
      <PosModal
        open={posOpen}
        onClose={() => setPosOpen(false)}
        mode={saleMode}
        cart={cart}
        setCart={setCart}
        onCheckout={handleFinishSale}
      />

      {/* Detalle de venta */}
      <SaleDetailModal
        open={!!selectedSale}
        onClose={() => setSelectedSale(null)}
        sale={selectedSale}
      />
    </div>
  );
}