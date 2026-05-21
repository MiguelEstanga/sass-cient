"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { productService } from "@/services/product.service";
import { useLocalCache } from "@/hooks/useLocalCache";
import { Input } from "@/components/ui/Input";
import { Paginator } from "@/components/ui/Pagination";
import type { Client } from "@/types/client.types";
import type { CartItem } from "@/types/pos.types";
import styles from "./PosModal.module.css";
import type { Product } from "@/types/product.types";
import type { Service } from "@/types/services.types";
import { serviceService } from "@/services/services.service";
import { ClientSelector } from "@/components/ui/post/ClientSelector";
import { EmployeeSelector } from "@/components/ui/post/EmployeeSelector";
import { PaymentMethodSelector } from "@/components/ui/post/PaymentMethodSelector";
import { refresh } from "next/cache";
import type { FetchParams } from "@/hooks/useLocalCache";
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
    employeeId?: number | null,
  ) => void;
}

export function PosModal({
  open,
  onClose,
  mode,
  cart,
  setCart,
  onCheckout,
}: Props) {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Client | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [serviceQty, setServiceQty] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  // ✅ Después — fetchers separados con is_active ya incluido
  const productFetcher = useCallback(
    (params: FetchParams) => productService.getAll(params),
    [],
  );

  const serviceFetcher = useCallback(
    (params: FetchParams) =>
      serviceService.getAll({ ...params, is_active: true }),
    [],
  );

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
    { keyField: "id", blockSize: 1500, pageSize: 16 },
  );

  // Re-inicializar cache cuando cambia el modo
  const prevMode = useRef(mode);
  useEffect(() => {
    if (prevMode.current !== mode) {
      prevMode.current = mode;
      refreshItems();
      setItemSearch("");
    }
  }, [mode, refreshItems, setItemSearch]);
  // Reset al abrir
  useEffect(() => {
    if (open) {
      setSelectedClient(null);
      setSelectedEmployee(null);
      setSelectedService(null);
      setServiceQty(1);
      setPaymentMethod("cash");
      setItemSearch("");
    }
  }, [open, refresh]);

  // Scroll lock
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  const addToCart = (item: Product | Service) => {
    if (!item) return;
    const isProduct = mode === "product";
    const newItem: CartItem = {
      product: isProduct ? (item as Product) : null,
      service: !isProduct ? (item as Service) : null,
      quantity: !isProduct ? serviceQty : 1,
      price: parseFloat(String(item.price)),
    };

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
      return [...prev, newItem];
    });
  };

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

  const removeFromCart = (id: number) => {
    setCart((prev) =>
      prev.filter((item) => item.product?.id !== id && item.service?.id !== id),
    );
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const canCheckout =
    cart.length > 0 &&
    selectedClient !== null &&
    (mode === "product" || selectedEmployee !== null);

  const handleCheckout = () => {
    if (!canCheckout) return;
    onCheckout(
      selectedClient,
      paymentMethod,
      mode,
      selectedEmployee?.id ?? null,
    );
  };

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={(e) => e.stopPropagation()}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* ===== IZQUIERDA: Grid de items ===== */}
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

          {/* Search */}
          <div className={styles.searchContainer}>
            <Input
              placeholder={
                mode === "product"
                  ? "Buscar por nombre o SKU..."
                  : "Buscar servicio..."
              }
              value={itemSearch}
              onChange={(e) => setItemSearch(e.target.value)}
              fullWidth
            />
          </div>

          {/* Grid */}
          <div className={styles.itemGrid}>
            {itemsLoading && items.length === 0
              ? Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className={styles.skeletonCard} />
                ))
              : items.map((item) => {
                  const product = mode === "product" ? (item as Product) : null;
                  return (
                    <div
                      key={item.id}
                      className={styles.itemCard}
                      onClick={() => addToCart(item)}
                    >
                      <div className={styles.imageContainer}>
                        {product?.image_url ? (
                          <img
                            src={product.image_url}
                            alt=""
                            className={styles.itemImage}
                          />
                        ) : (
                          <div className={styles.itemImagePlaceholder}>
                            {mode === "product" ? "📦" : "✂️"}
                          </div>
                        )}
                      </div>
                      <div className={styles.itemInfo}>
                        <h4 className={styles.itemTitle}>
                          {item.name ?? "Item"}
                        </h4>
                        <div className={styles.itemSub}>
                          {product?.barcode && (
                            <span className={styles.itemMeta}>
                              {product.barcode}
                            </span>
                          )}
                          <span className={styles.itemPrice}>
                            ${parseFloat(String(item.price)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <button className={styles.addBtn}>+ Agregar</button>
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
                pageSize={16}
                loading={itemsLoading}
                onChange={setItemPage}
              />
            </div>
          )}
        </div>

        {/* ===== DERECHA: Cart + Checkout ===== */}
        <div className={styles.rightPanel}>
          {/* Cart header */}
          <div className={styles.cartHeader}>
            <span>Carrito</span>
            <span className={styles.cartCount}>{cart.length} items</span>
          </div>

          {/* Lista de items del carrito */}
          <div className={styles.cartItems}>
            {cart.length === 0 ? (
              <div className={styles.emptyCart}>
                <span className={styles.emptyCartIcon}>
                  {mode === "product" ? "🛒" : "✂️"}
                </span>
                <p>Agrega {mode === "product" ? "productos" : "servicios"}</p>
              </div>
            ) : (
              cart.map((item, index) => {
                const itemId = item.product?.id ?? item.service?.id ?? index;
                const itemName = item.product?.name ?? item.service?.name;
                return (
                  <div key={`${itemId}-${index}`} className={styles.cartItem}>
                    <div className={styles.cartItemInfo}>
                      <p className={styles.cartItemName}>{itemName}</p>
                      <p className={styles.cartItemPrice}>
                        ${item.price.toFixed(2)} c/u
                      </p>
                    </div>
                    <div className={styles.qtyControls}>
                      <button
                        className={styles.qtyBtn}
                        onClick={() =>
                          updateQuantity(itemId, item.quantity - 1)
                        }
                      >
                        −
                      </button>
                      <span className={styles.qtyValue}>{item.quantity}</span>
                      <button
                        className={styles.qtyBtn}
                        onClick={() =>
                          updateQuantity(itemId, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                    <div className={styles.cartItemTotal}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeFromCart(itemId)}
                    >
                      ×
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Checkout section */}
          <div className={styles.checkoutSection}>
            {/* Cliente */}
            <div className={styles.checkoutField}>
              <label className={styles.checkoutLabel}>
                Cliente{" "}
                {!selectedClient && <span className={styles.required}>*</span>}
              </label>
              <ClientSelector
                selectedClient={selectedClient}
                onSelect={setSelectedClient}
                onClear={() => setSelectedClient(null)}
              />
            </div>

            {/* Empleado — solo en modo servicio */}
            {mode === "service" && (
              <div className={styles.checkoutField}>
                <label className={styles.checkoutLabel}>
                  Ejecutor{" "}
                  {!selectedEmployee && (
                    <span className={styles.required}>*</span>
                  )}
                </label>
                <EmployeeSelector
                  value={selectedEmployee}
                  onChange={setSelectedEmployee}
                />
              </div>
            )}

            {/* Método de pago */}
            <div className={styles.checkoutField}>
              <label className={styles.checkoutLabel}>Método de pago</label>
              <PaymentMethodSelector
                value={paymentMethod}
                onChange={setPaymentMethod}
              />
            </div>

            {/* Total */}
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Total</span>
              <span className={styles.totalValue}>${total.toFixed(2)}</span>
            </div>

            {/* Botón cobrar */}
            <button
              className={styles.checkoutBtn}
              onClick={handleCheckout}
              disabled={!canCheckout}
            >
              {!canCheckout && cart.length > 0
                ? !selectedClient
                  ? "Selecciona un cliente"
                  : "Selecciona un ejecutor"
                : `Cobrar $${total.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
