"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { PosModal } from "./components/PosModal";
import { SaleTypeModal } from "./components/SaleTypeModal";
import { SaleDetailModal } from "./components/SaleDetailModal";
import { SalesTable } from "./SalesTable";
import { useToast } from "@/hooks/useToast";
import { ApiError } from "@/lib/api/errors";
import type { CartItem, CreateSaleDto } from "@/types/pos.types";
import type { Client } from "@/types/client.types";
import styles from "./styles/pos.module.css";
import { saleService } from "@/services/pos/sale.service";
import type { Sale } from "@/types/sale.types";

export default function PosPage() {
  const toast = useToast();

  // ── Ref para llamar refresh de SalesTable desde afuera ────────────────
  const salesTableRefreshRef = useRef<(() => void) | null>(null);

  // ── Estado de modales ──────────────────────────────────────────────────
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [posOpen, setPosOpen] = useState(false);
  const [saleMode, setSaleMode] = useState<"product" | "service">("product");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  // ── Estado del carrito ─────────────────────────────────────────────────
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSelling, setIsSelling] = useState(false);

  // ── Paso 1: abrir selector de tipo ────────────────────────────────────
  function handleNewSale() {
    setTypeModalOpen(true);
  }

  // ── Paso 2: elegir tipo → abrir POS ───────────────────────────────────
  function handleTypeSelect(type: "product" | "service") {
    setSaleMode(type);
    setCart([]);
    setTypeModalOpen(false);
    setPosOpen(true);
  }

  // ── Paso 3: procesar checkout ──────────────────────────────────────────
  async function handleFinishSale(
    client: Client | null,
    paymentMethod: string,
    mode: "product" | "service",
    membershipData?: {
      membership_subscription_id: number;
      credits_used: number;
      discount_applied: number;
    },
  ) {
    if (!client) {
      toast.error("Debes seleccionar un cliente antes de cobrar");
      return;
    }

    if (mode === "service") {
      const missingEmployee = cart.some((item) => !item.employeeId);
      if (missingEmployee) {
        toast.error("Asigna un ejecutor a cada servicio antes de cobrar");
        return;
      }
    }

    setIsSelling(true);

    try {
      const itemsPayload = cart
        .map((item) => {
          if (mode === "product" && item.product) {
            return {
              product_id: item.product.id,
              quantity: item.quantity,
              price: parseFloat(String(item.product.price)),
              status: "pending",
            };
          }
          if (mode === "service" && item.service) {
            return {
              service_id: item.service.id,
              quantity: item.quantity,
              price: parseFloat(String(item.service.price)),
              performance_id: item.employeeId,
              status: "pending",
            };
          }
          return null;
        })
        .filter(Boolean);

      const totalAmount = cart.reduce(
        (sum, item) =>
          sum +
          parseFloat(
            String(
              mode === "product" ? item.product?.price : item.service?.price,
            ),
          ) *
            item.quantity,
        0,
      );

      const payload: CreateSaleDto = {
        type: mode,
        client_id: client.id,
        total: totalAmount,
        tax: 0,
        payment_method: paymentMethod,
        items: itemsPayload as CreateSaleDto["items"],
        membership_subscription_id:
          membershipData?.membership_subscription_id ?? null,
        credits_used: membershipData?.credits_used ?? null,
        discount_applied: membershipData?.discount_applied ?? null,
      };

      const response = await saleService.processCheckout(payload);
      toast.success(
        `Venta #${response.id} registrada por $${totalAmount.toFixed(2)}`,
      );
      setCart([]);
      setPosOpen(false);

      // ── Refrescar tabla después de nueva venta ─────────────────────────
      salesTableRefreshRef.current?.();
    } catch (err) {
      if (err instanceof ApiError && err.isValidationError()) {
        toast.error(err.getAllErrors().join(", "));
      } else {
        toast.error(
          err instanceof ApiError ? err.message : "Error al procesar la venta",
        );
      }
    } finally {
      setIsSelling(false);
    }
  }

  return (
    <div className={styles.page}>
      {/* Header */}
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

      {/* Tabla — expone su refresh via onRefreshReady ─────────────────── */}
      <SalesTable
        onViewDetail={setSelectedSale}
        onRefreshReady={(fn) => {
          salesTableRefreshRef.current = fn;
        }}
      />

      <SaleTypeModal
        open={typeModalOpen}
        onSelect={handleTypeSelect}
        onClose={() => setTypeModalOpen(false)}
      />

      <PosModal
        open={posOpen}
        onClose={() => setPosOpen(false)}
        mode={saleMode}
        cart={cart}
        setCart={setCart}
        onCheckout={handleFinishSale}
      />

      {/* Detalle — refresca tabla al cambiar estado ───────────────────── */}
      <SaleDetailModal
        open={!!selectedSale}
        onClose={() => setSelectedSale(null)}
        sale={selectedSale}
        onUpdate={() => salesTableRefreshRef.current?.()}
      />
    </div>
  );
}
