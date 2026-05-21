// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/Button";
// import { PosModal } from "./components/PosModal";

// import { useToast } from "@/hooks/useToast";
// import { ApiError } from "@/lib/api/errors";
// import type { CartItem } from "@/types/pos.types"; // <-- Importar CartItem
// import type { CreateSaleDto } from "@/types/pos.types"; // <-- Importar CreateSaleDto
// import styles from "./styles/pos.module.css";
// import { saleService } from "@/services/pos/sale.service";
// import { useTranslations } from "next-intl";
// import { useLocalCache } from "@/hooks/useLocalCache";
// import { Sale } from "@/types/sale.types";
// import { SkeletonRow } from "@/components/ui/Skeleton";
// import { SalesTable } from "./SalesTable";
// import { Paginator } from "@/components/ui/Pagination";
 
// import { SaleDetailModal } from "./components/SaleDetailModal";

// const PAGE_SIZE = Number(process.env.NEXT_PUBLIC_PAGE_SIZE) || 15;
// export default function PosPage() {
//   const toast = useToast();

//   const [posOpen, setPosOpen] = useState(false);
//   const [cart, setCart] = useState<CartItem[]>([]);
//   const [isSelling, setIsSelling] = useState(false);
//   const t = useTranslations("sales");
//   const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

//   function openDetail(sale: Sale) {
//     setSelectedSale(sale);
//   }

//   const { rows, total, page, lastPage, loading, search, setSearch, setPage } =
//     useLocalCache<Sale>((params) => saleService.getAll(params), {
//       keyField: "id",
//       blockSize: 1500,
//       pageSize: PAGE_SIZE,
//     });

//   async function handleFinishSale(client: any, paymentMethod: string) {
//     // 1. VALIDACIÓN OBLIGATORIA EN EL FRONTEND
//     if (!client) {
//       toast.error("Debes seleccionar un cliente antes de cobrar");
//       return; // Frena todo aquí
//     }

//     setIsSelling(true);

//     try {
//       const itemsPayload = cart.map((item) => ({
//         product_id: item.product.id,
//         quantity: item.quantity,
//         price: parseFloat(item.product.price),
//       }));

//       const total = cart.reduce(
//         (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
//         0,
//       );

//       const payload: CreateSaleDto = {
//         type: "product",
//         client_id: client.id, // <-- Ahora siempre llega un número
//         total: total,
//         tax: 0,
//         payment_method: paymentMethod,
//         items: itemsPayload,
//       };

//       const response = await saleService.processCheckout(payload);
//       toast.success(
//         `Venta #${response.id} registrada por $${total.toFixed(2)}`,
//       );
//       setCart([]);
//       setPosOpen(false);
//     } catch (err) {
//       if (err instanceof ApiError && err.isValidationError()) {
//         toast.error(err.getAllErrors().join(", "));
//       } else {
//         toast.error(
//           err instanceof ApiError ? err.message : "Error al procesar la venta",
//         );
//       }
//     } finally {
//       setIsSelling(false);
//     }
//   }

//   return (
//     <div className={styles.page}>
//       <div className={styles.pageHeader}>
//         <div>
//           <h1 className={styles.title}>Punto de Venta</h1>
//           <p className={styles.subtitle}>
//             {cart.length > 0
//               ? `Tienes ${cart.length} productos en el carrito`
//               : "Sin productos en el carrito"}
//           </p>
//         </div>
//         <Button onClick={() => setPosOpen(true)}>
//           {cart.length > 0 ? `Abrir POS (${cart.length})` : "+ Nueva Venta"}
//         </Button>
//       </div>

//       <PosModal
//         open={posOpen}
//         onClose={() => setPosOpen(false)}
//         cart={cart}
//         setCart={setCart}
//         onCheckout={handleFinishSale} // <-- TypeScript feliz
//       />

//       {loading ? (
//         <div className={styles.tableWrapper}>
//           {Array.from({ length: PAGE_SIZE }).map((_, i) => (
//             <SkeletonRow key={i} />
//           ))}
//         </div>
//       ) : (
//         <SalesTable
//           data={rows}
//           offset={(page - 1) * PAGE_SIZE}
//           onViewDetail={openDetail} // <-- PASAR FUNCIÓN
//         />
//       )}

//       <div className={styles.pagination}>
//         <Paginator
//           page={page}
//           lastPage={lastPage}
//           total={total}
//           pageSize={PAGE_SIZE}
//           loading={loading}
//           onChange={setPage}
//         />
//       </div>
//       <SaleDetailModal
//         open={!!selectedSale}
//         onClose={() => setSelectedSale(null)}
//         sale={selectedSale}
//       />
//     </div>
//   );
// }

function Page() {
  return (
    <>0</>
  );
}
