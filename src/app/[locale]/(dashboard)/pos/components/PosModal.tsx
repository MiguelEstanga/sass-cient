"use client";

import { useState, useEffect } from "react";
import { productService } from "@/services/product.service";

import { useLocalCache } from "@/hooks/useLocalCache";
import { Input } from "@/components/ui/Input";
import { Paginator } from "@/components/ui/Pagination";

import type { Product } from "@/types/product.types";

import type { Client } from "@/types/client.types";
import type { CartItem } from "@/types/pos.types";
import styles from "./PosModal.module.css";
import { Service } from "@/types/services.types";
import { serviceService } from "@/services/services.service";
import { PaymentMethodSelector } from "@/components/ui/post/PaymentMethodSelector";
import { ClientSelector } from "@/components/ui/post/ClientSelector";
import { EmployeeSelector } from "@/components/ui/post/EmployeeSelector";

interface Props {
  open: boolean;
  onClose: () => void;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  onCheckout: (
    client: Client,
    paymentMethod: string,
    mode: "product" | "service",
    employeeId?: number | null,
  ) => void;
}

export function PosModal({ open, onClose, cart, setCart, onCheckout }: Props) {
  const [mode, setMode] = useState<"product" | "service">("product"); // <-- NUEVO ESTADO
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Client | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [serviceQty, setServiceQty] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  // Cachés
  const {
    rows: products,
    page: productPage,
    lastPage: productLastPage,
    loading: productsLoading,
    search: productSearch,
    setSearch: setProductSearch,
    setPage: setProductPage,
  } = useLocalCache<Product>((params) => productService.getAll(params), {
    keyField: "id",
    blockSize: 1500,
    pageSize: 12,
  });

  const { rows: services, search: serviceSearch } = useLocalCache<Service>(
    (params) => serviceService.getAll({ ...params, is_active: true }),
    { keyField: "id", blockSize: 1500, pageSize: 1500 }, // Traer todos los servicios para el buscador
  );

  // Scroll lock
  useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

  // Resetear estado al cambiar de modo
  useEffect(() => {
    setSelectedService(null);
    setSelectedEmployee(null);
    setServiceQty(1);
  }, [mode]);

  // Lógica del Carrito (Se adapta a Producto o Servicio)
  const addToCart = (item: Product | Service) => {
    if (mode === "product") {
      setCart((prev) => {
        const exists = prev.find((i) => i.product?.id === item.id);
        if (exists) {
          return prev.map((i) =>
            i.product?.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
          );
        }
        return [
          ...prev,
          {
            product: item,
            service: null,
            quantity: 1,
            price: parseFloat(item.price),
          },
        ];
      });
    } else {
      if (!selectedService || serviceQty < 1) return; // Validación rápida
      setCart((prev) => {
        return [
          ...prev,
          {
            product: null,
            service: selectedService,
            quantity: serviceQty,
            price: parseFloat(selectedService.price),
          },
        ];
      });
    }
  };

  const updateQuantity = (id: number, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product?.id === id || item.service?.id === id
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

  const handleCheckout = () => {
    if (
      mode === "service" &&
      (!selectedService || !selectedClient || !selectedEmployee)
    )
      return;
    if (mode === "product" && !selectedClient) return;
    if (selectedClient === null) return;
    onCheckout(selectedClient, paymentMethod, mode, selectedEmployee?.id);
  };

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation}>
        {/* CABECERA CON TOGGLE */}
        <div className={styles.header}>
          <h2 className={styles.title}>Punto de Venta</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* TOGGLE PRODUCTO / SERVICIO */}
        <div className={styles.modeToggle}>
          <button
            className={`${styles.toggleBtn} ${mode === "product" ? styles.active : ""}`}
            onClick={() => setMode("product")}
          >
            🛒 Productos
          </button>
          <button
            className={`${styles.toggleBtn} ${mode === "service" ? styles.active : ""}`}
            onClick={() => setMode("service")}
          >
            🛎 Servicios
          </button>
        </div>

        {/* LADO IZQUIERDO: Modo Producto */}
        {mode === "product" && (
          <>
            <div className={styles.searchContainer}>
              <Input
                placeholder="Buscar por nombre o SKU..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                fullWidth
              />
            </div>
            <div className={styles.productGrid}>
              {productsLoading && products.length === 0
                ? Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className={styles.skeletonCard} />
                  ))
                : products.map((product) => (
                    <div
                      key={product.id}
                      className={styles.productCard}
                      onClick={() => addToCart(product)}
                    >
                      <div className={styles.imageContainer}>
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className={styles.productImage}
                          />
                        ) : (
                          <div className={styles.productImagePlaceholder}>
                            📦
                          </div>
                        )}
                      </div>
                      <div className={styles.productInfo}>
                        <h4 title={product.name}>{product.name}</h4>
                        <span className={styles.productSku}>
                          {product.barcode || "Sin SKU"}
                        </span>
                      </div>
                      <div className={styles.productFooter}>
                        <span className={styles.productPrice}>
                          ${parseFloat(product.price).toFixed(2)}
                        </span>
                        <button className={styles.addBtn}>+ Agregar</button>
                      </div>
                    </div>
                  ))}
            </div>
            {productLastPage > 1 && (
              <div className={styles.paginationContainer}>
                <Paginator
                  page={productPage}
                  lastPage={productLastPage}
                  total={0}
                  pageSize={12}
                  loading={productsLoading}
                  onChange={setProductPage}
                />
              </div>
            )}
          </>
        )}

        {/* LADO IZQUIERDO: Modo Servicio */}
        {mode === "service" && (
          <div className={styles.serviceView}>
            {/* 1. Buscar Servicio */}
            <div className={styles.serviceField}>
              <label className={styles.label}>1. Seleccionar Servicio *</label>
              <Input
                placeholder="Buscar servicio..."
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                fullWidth
              />
              <div className={styles.dropdown}>
                {services.map((service) => (
                  <div
                    key={service.id}
                    className={styles.dropdownItem}
                    onClick={() => {
                      setSelectedService(service);
                      setServiceSearch("");
                    }}
                  >
                    <strong>{service.name}</strong>
                    <span className={styles.dropdownItemSub}>
                      ${parseFloat(service.price).toFixed(2)} c/u
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Seleccionar Cliente */}
            <div className={styles.serviceField}>
              <label className={styles.label}>2. Seleccionar Cliente *</label>
              <ClientSelector
                selectedClient={selectedClient}
                onSelect={setSelectedClient}
                onClear={() => setSelectedClient(null)}
              />
            </div>

            {/* 3. Seleccionar Ejecutor (Empleado) */}
            <div className={styles.serviceField}>
              <label className={styles.label}>3. Seleccionar Ejecutor *</label>
              <EmployeeSelector
                value={selectedEmployee}
                onChange={setSelectedEmployee}
              />
            </div>

            {/* 4. Cantidad y Botón */}
            <div className={styles.serviceActionRow}>
              <div className={styles.qtyContainer}>
                <label className={styles.label}>4. Cantidad *</label>
                <input
                  type="number"
                  className={styles.qtyInput}
                  type="number"
                  min="1"
                  value={serviceQty}
                  onChange={(e) => setServiceQty(parseInt(e.target.value) || 1)}
                />
              </div>
              <button
                className={styles.addServiceBtn}
                onClick={() => addToCart(selectedService!)}
                disabled={!selectedService || serviceQty < 1}
              >
                + Agregar al carrito
              </button>
            </div>
          </div>
        )}

        {/* LADO DERECHO: Carrito (Igual para ambos) */}
        <div className={styles.rightPanel}>
          {/* Cliente (Siempre visible en ambos modos) */}
          {mode === "product" && (
            <div className={styles.clientSection}>
              <ClientSelector
                selectedClient={selectedClient}
                onSelect={setSelectedClient}
                onClear={() => setSelectedClient(null)}
              />
            </div>
          )}

          <div className={styles.cartSection}>
            <div className={styles.cartHeader}>
              Carrito ({cart.length} items)
            </div>

            {cart.length === 0 ? (
              <div className={styles.emptyCart}>
                {mode === "service"
                  ? "Selecciona un servicio para agregar"
                  : "Haz clic en un producto para agregar"}
              </div>
            ) : (
              <div className={styles.cartItems}>
                {cart.map((item, index) => (
                  <div
                    key={`${item.product?.id || item.service?.id}-${index}`}
                    className={styles.cartItem}
                  >
                    <div className={styles.cartItemInfo}>
                      {/* Mostrar nombre de producto O servicio */}
                      <div className={styles.cartItemName}>
                        {item.product?.name ||
                          item.service?.name ||
                          "Error: Item sin nombre"}
                      </div>
                      <div className={styles.cartItemPrice}>
                        ${item.price.toFixed(2)} c/u
                      </div>
                    </div>

                    {/* Controles de Cantidad */}
                    <div className={styles.qtyControls}>
                      <button
                        className={styles.qtyBtn}
                        onClick={() =>
                          updateQuantity(
                            item.product?.id || item.service?.id,
                            item.quantity - 1,
                          )
                        }
                      >
                        -
                      </button>
                      <span className={styles.qtyValue}>{item.quantity}</span>
                      <button
                        className={styles.qtyBtn}
                        onClick={() =>
                          updateQuantity(
                            item.product?.id || item.service?.id,
                            item.quantity + 1,
                          )
                        }
                      >
                        +
                      </button>
                    </div>

                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "var(--font-size-sm)",
                        width: "70px",
                        textAlign: "right",
                      }}
                    >
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>

                    <button
                      className={styles.removeBtn}
                      onClick={() =>
                        removeFromCart(item.product?.id || item.service?.id)
                      }
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className={styles.cartFooter}>
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Total a Pagar:</span>
                <span className={styles.totalValue}>${total.toFixed(2)}</span>
              </div>

              <PaymentMethodSelector
                value={paymentMethod}
                onChange={setPaymentMethod}
              />

              <button
                className={styles.checkoutBtn}
                onClick={handleCheckout}
                disabled={cart.length === 0}
              >
                Cobrar Venta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
