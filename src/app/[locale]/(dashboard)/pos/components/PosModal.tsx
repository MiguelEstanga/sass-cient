"use client";

// ── Dependencias externas ──────────────────────────────────────────────────
import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";

// ── Servicios ──────────────────────────────────────────────────────────────
import { productService } from "@/services/product.service";
import { serviceService } from "@/services/services.service";
// ── Hooks ──────────────────────────────────────────────────────────────────
import { useLocalCache } from "@/hooks/useLocalCache";
import type { FetchParams } from "@/hooks/useLocalCache";

// ── Componentes UI ─────────────────────────────────────────────────────────
import { Input } from "@/components/ui/Input";
import { Paginator } from "@/components/ui/Pagination";
import { ClientSelector } from "@/components/ui/post/ClientSelector";
import { EmployeeSelector } from "@/components/ui/post/EmployeeSelector";

// ── Tipos ──────────────────────────────────────────────────────────────────
import type { Client } from "@/types/client.types";
import type { CartItem } from "@/types/pos.types";
import type { Product } from "@/types/product.types";
import type { Service } from "@/types/services.types";
import type { Employee } from "@/types/user.types";

// ── Estilos ────────────────────────────────────────────────────────────────
import styles from "./PosModal.module.css";

interface Props {
  open: boolean;
  onClose: () => void;
  mode: "product" | "service";
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  onCheckout: (
    client: Client | null,
    paymentMethod: string,
    mode: "product" | "service",
  ) => void;
}

// ── Métodos de pago disponibles ────────────────────────────────────────────
const PAYMENT_METHODS = [
  { key: "cash", label: "💵 Efectivo" },
  { key: "card", label: "💳 Tarjeta" },
  { key: "transfer", label: "🏦 Transfer" },
];

export function PosModal({
  open,
  onClose,
  mode,
  cart,
  setCart,
  onCheckout,
}: Props) {
  const t = useTranslations("pos");

  // ── Estado local ───────────────────────────────────────────────────────
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  // ── Fetchers memorizados ───────────────────────────────────────────────
  const productFetcher = useCallback(
    (params: FetchParams) => productService.getAll(params),
    [],
  );

  const serviceFetcher = useCallback(
    (params: FetchParams) =>
      serviceService.getAll({ ...params, is_active: true }),
    [],
  );

  // ── Caché de items ─────────────────────────────────────────────────────
  const {
    rows: items,
    page: itemPage,
    lastPage: itemLastPage,
    loading: itemsLoading,
    search: itemSearch,
    setSearch: setItemSearch,
    setPage: setItemPage,
    refresh: refreshItems,
  } = useLocalCache<Product | Service>(
    mode === "product" ? productFetcher : serviceFetcher,
    { keyField: "id", blockSize: 1500, pageSize: 12 },
  );

  // ── Re-inicializar cache cuando cambia el modo ─────────────────────────
  const prevMode = useRef(mode);
  useEffect(() => {
    if (prevMode.current !== mode) {
      prevMode.current = mode;
      refreshItems();
      setItemSearch("");
    }
  }, [mode, refreshItems, setItemSearch]);

  // ── Reset al abrir ─────────────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      setSelectedClient(null);
      setPaymentMethod("cash");
      setItemSearch("");
    }
  }, [open, setItemSearch]);

  // ── Bloquear scroll del body ───────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // ── Agregar item al carrito con employeeId null por defecto ────────────
  const addToCart = (item: Product | Service) => {
    if (!item) return;
    const isProduct = mode === "product";

    setCart((prev) => {
      const exists = prev.find(
        (i) => (i.product?.id ?? i.service?.id) === item.id,
      );
      if (exists) {
        return prev.map((i) =>
          (i.product?.id ?? i.service?.id) === item.id
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        );
      }
      return [
        ...prev,
        {
          product: isProduct ? (item as Product) : null,
          service: !isProduct ? (item as Service) : null,
          quantity: 1,
          price: parseFloat(String(item.price)),
          employeeId: null, // ← se asigna en la tabla del carrito
        },
      ];
    });
  };

  // ── Actualizar empleado de un item específico ──────────────────────────
  const updateItemEmployee = (itemId: number, employee: Employee | null) => {
    setCart((prev) =>
      prev.map((i) =>
        (i.product?.id ?? i.service?.id) === itemId
          ? { ...i, employeeId: employee?.id ?? null }
          : i,
      ),
    );
  };

  // ── Actualizar cantidad ────────────────────────────────────────────────
  const updateQuantity = (id: number, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        (item.product?.id ?? item.service?.id) === id
          ? { ...item, quantity: newQty }
          : item,
      ),
    );
  };

  // ── Eliminar item ──────────────────────────────────────────────────────
  const removeFromCart = (id: number) => {
    setCart((prev) =>
      prev.filter((item) => item.product?.id !== id && item.service?.id !== id),
    );
  };

  // ── Totales ────────────────────────────────────────────────────────────
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = 0;
  const total = subtotal + tax;

  // ── Validación: en servicio, todos los items deben tener ejecutor ──────
  const allItemsHaveEmployee =
    mode === "product" || cart.every((i) => i.employeeId !== null);

  const canCheckout =
    cart.length > 0 && selectedClient !== null && allItemsHaveEmployee;

  const handleCheckout = () => {
    if (!canCheckout) return;
    onCheckout(selectedClient, paymentMethod, mode);
  };

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={(e) => e.stopPropagation()}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* ══ IZQUIERDA ════════════════════════════════════════════════ */}
        <div className={styles.leftPanel}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <span className={styles.modeTag}>
                {mode === "product" ? "🛒 Productos" : "✂️ Servicios"}
              </span>
              <h2 className={styles.title}>Punto de Venta</h2>
            </div>
            <button className={styles.closeBtn} onClick={onClose}>
              ✕
            </button>
          </div>

          {/* Buscador */}
          <div className={styles.searchContainer}>
            <Input
              placeholder={
                mode === "product" ? t("searchProduct") : t("searchService")
              }
              value={itemSearch}
              onChange={(e) => setItemSearch(e.target.value)}
              fullWidth
            />
          </div>

          {/* Tabla del carrito */}
          <div className={styles.cartTableWrapper}>
            {cart.length === 0 ? (
              <div className={styles.emptyCart}>
                <span className={styles.emptyCartIcon}>
                  {mode === "product" ? "🛒" : "✂️"}
                </span>
                <p>{t("emptyCart")}</p>
              </div>
            ) : (
              <table className={styles.cartTable}>
                <thead>
                  <tr>
                    <th>{t("product")}</th>
                    {/* Columna ejecutor solo visible en modo servicio */}
                    {mode === "service" && (
                      <th style={{ minWidth: 160 }}>{t("employee")}</th>
                    )}
                    <th className={styles.center}>{t("qty")}</th>
                    <th className={styles.right}>{t("price")}</th>
                    <th className={styles.right}>{t("total")}</th>
                    <th style={{ width: 28 }} />
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, index) => {
                    const itemId =
                      item.product?.id ?? item.service?.id ?? index;
                    const itemName =
                      item.product?.name ?? item.service?.name ?? "—";

                    // Empleado actualmente asignado a este item
                    const currentEmployee = item.employeeId
                      ? ({
                          id: item.employeeId,
                          name: "Cargando...",
                        } as Employee)
                      : null;

                    return (
                      <tr key={`${itemId}-${index}`}>
                        {/* Nombre del item */}
                        <td>
                          <div className={styles.itemName}>{itemName}</div>
                          <div className={styles.itemSub}>
                            {mode === "product" ? "Producto" : "Servicio"}
                          </div>
                        </td>

                        {/* Selector de ejecutor por item — solo en servicios */}
                        {mode === "service" && (
                          <td style={{ verticalAlign: "middle" }}>
                            <EmployeeSelector
                              value={currentEmployee}
                              onChange={(emp) =>
                                updateItemEmployee(itemId, emp)
                              }
                            />
                          </td>
                        )}

                        {/* Controles de cantidad */}
                        <td style={{ textAlign: "center" }}>
                          <div className={styles.qtyControls}>
                            <button
                              className={styles.qtyBtn}
                              onClick={() =>
                                updateQuantity(itemId, item.quantity - 1)
                              }
                            >
                              −
                            </button>
                            <span className={styles.qtyValue}>
                              {item.quantity}
                            </span>
                            <button
                              className={styles.qtyBtn}
                              onClick={() =>
                                updateQuantity(itemId, item.quantity + 1)
                              }
                            >
                              +
                            </button>
                          </div>
                        </td>

                        {/* Precio unitario */}
                        <td className={styles.priceCell}>
                          ${item.price.toFixed(2)}
                        </td>

                        {/* Subtotal del item */}
                        <td className={styles.totalCell}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </td>

                        {/* Eliminar */}
                        <td>
                          <button
                            className={styles.removeBtn}
                            onClick={() => removeFromCart(itemId)}
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer totales */}
          <div className={styles.cartFooter}>
            <div className={styles.footerRow}>
              <span className={styles.footerLabel}>{t("subtotal")}</span>
              <span className={styles.footerValue}>${subtotal.toFixed(2)}</span>
            </div>
            <div className={styles.footerRow}>
              <span className={styles.footerLabel}>{t("tax")}</span>
              <span className={styles.footerValue}>${tax.toFixed(2)}</span>
            </div>
            <hr className={styles.footerDivider} />
            <div className={styles.footerRow}>
              <span className={styles.totalLabel}>{t("total")}</span>
              <span className={styles.totalValue}>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* ══ DERECHA: shortcuts + checkout ════════════════════════════ */}
        <div className={styles.rightPanel}>
          {/* Grid de shortcuts */}
          <div className={styles.shortcutsGrid}>
            {itemsLoading && items.length === 0
              ? Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className={styles.skeletonCard} />
                ))
              : items.map((item) => {
                  const product = mode === "product" ? (item as Product) : null;
                  return (
                    <div
                      key={item.id}
                      className={styles.shortcutCard}
                      onClick={() => addToCart(item)}
                    >
                      <div className={styles.shortcutIcon}>
                        {product?.image_url ? (
                          <img
                            src={product.image_url}
                            alt=""
                            style={{
                              width: 32,
                              height: 32,
                              objectFit: "cover",
                              borderRadius: 4,
                            }}
                          />
                        ) : mode === "product" ? (
                          "📦"
                        ) : (
                          "✂️"
                        )}
                      </div>
                      <span className={styles.shortcutName}>
                        {item.name ?? "—"}
                      </span>
                      <span className={styles.shortcutPrice}>
                        ${parseFloat(String(item.price)).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
          </div>

          {/* Paginación */}
          {itemLastPage > 1 && (
            <div className={styles.paginationContainer}>
              <Paginator
                page={itemPage}
                lastPage={itemLastPage}
                total={0}
                pageSize={12}
                loading={itemsLoading}
                onChange={setItemPage}
              />
            </div>
          )}

          {/* Checkout */}
          <div className={styles.checkoutSection}>
            {/* Cliente */}
            <div className={styles.checkoutField}>
              <label className={styles.checkoutLabel}>
                {t("client")}
                {!selectedClient && <span className={styles.required}>*</span>}
              </label>
              <ClientSelector
                selectedClient={selectedClient}
                onSelect={setSelectedClient}
                onClear={() => setSelectedClient(null)}
              />
            </div>

            {/* Aviso si faltan ejecutores */}
            {mode === "service" && cart.length > 0 && !allItemsHaveEmployee && (
              <p
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--color-warning)",
                  margin: 0,
                }}
              >
                ⚠️ Asigna un ejecutor a cada servicio
              </p>
            )}

            {/* Método de pago */}
            <div className={styles.checkoutField}>
              <label className={styles.checkoutLabel}>
                {t("paymentMethod")}
              </label>
              <div className={styles.paymentMethods}>
                {PAYMENT_METHODS.map((pm) => (
                  <button
                    key={pm.key}
                    className={`${styles.methodBtn} ${
                      paymentMethod === pm.key ? styles.methodActive : ""
                    }`}
                    onClick={() => setPaymentMethod(pm.key)}
                  >
                    {pm.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Botón cobrar */}
            <button
              className={styles.checkoutBtn}
              onClick={handleCheckout}
              disabled={!canCheckout}
            >
              {!canCheckout && cart.length > 0
                ? !selectedClient
                  ? t("selectClientFirst")
                  : !allItemsHaveEmployee
                    ? "Asigna ejecutores"
                    : t("checkout")
                : `${t("checkout")} $${total.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
