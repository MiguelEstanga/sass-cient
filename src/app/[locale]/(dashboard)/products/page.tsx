"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { productService } from "@/services/product.service";
import { useToast } from "@/hooks/useToast";
import { useLocalCache } from "@/hooks/useLocalCache";
import { useConfirm } from "@/hooks/useConfirm";
import { ApiError } from "@/lib/api/errors";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Drawer, ConfirmDialog } from "@/components/ui/Modal";
import { Paginator } from "@/components/ui/Pagination";
import { SkeletonRow } from "@/components/ui/Skeleton";
 
import type { Product } from "@/types/product.types";
import type { ProductFormValues } from "@/lib/validations/product.schema";
import styles from "./styles/products.module.css";
import { ProductForm } from "./components/ProductForm";
import { ProductsTable } from "./ProductsTable";

const PAGE_SIZE = Number(process.env.NEXT_PUBLIC_PAGE_SIZE) || 10;
const PAGE_PAGINATE = Number(process.env.NEXT_PUBLIC_PAGE_PAGINATE) || 1;
export default function ProductsPage() {
  const t = useTranslations("products");
  const toast = useToast();
  const { confirm, dialogProps } = useConfirm();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const { rows, total, page, lastPage, loading, search, setSearch, setPage, refresh } =
    useLocalCache<Product>(
      (params) => productService.getAll(params),
      { keyField: "id", blockSize: 1500, pageSize: PAGE_SIZE }
    );

  function openCreate() {
    setEditing(null);
    setDrawerOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditing(null);
  }

  async function handleSubmit(values: ProductFormValues, image: File | null) {
    setIsSubmitting(true);
    try {
      const payload:any = { ...values, image };
      
      if (editing) {
        await productService.update(editing.id, payload);
        toast.success(t("updated", { name: values.name }));
      } else {
        await productService.create(payload);
        toast.success(t("created", { name: values.name }));
      }
      closeDrawer();
      refresh();
    } catch (err) {
      if (err instanceof ApiError && err.isValidationError()) {
        toast.error(err.getAllErrors().join(", "));
      } else {
        toast.error(err instanceof ApiError ? err.message : t("errorConnection"));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDelete(id: number, name: string) {
    confirm({
      title: t("deleteTitle"),
      message: t("deleteMessage", { name }),
      onConfirm: async () => {
        setDeletingId(id);
        try {
          await productService.delete(id);
          toast.success(t("deleted", { name }));
          refresh();
        } catch (err) {
          toast.error(err instanceof ApiError ? err.message : t("errorDeleting"));
        } finally {
          setDeletingId(null);
        }
      },
    });
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.subtitle}>
            {total > 0 ? t("subtitle", { count: total }) : ""}
          </p>
        </div>
        <Button onClick={openCreate}>{t("newButton")}</Button>
      </div>

      <div className={styles.toolbar}>
        <Input
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
        />
      </div>

      {loading ? (
        <div className={styles.tableWrapper}>
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : (
        <ProductsTable
          data={rows}
          offset={(page - 1) * PAGE_SIZE}
          deletingId={deletingId}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}

      <div className={styles.pagination}>
        <Paginator
          page={page}
          lastPage={lastPage}
          total={total}
          pageSize={1}
          loading={loading}
          onChange={setPage}
          
        />
      </div>

      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={editing ? t("editTitle") : t("newTitle")}
        subtitle={editing ? t("editSubtitle", { name: editing.name }) : t("newSubtitle")}
      >
        <ProductForm
          defaultValues={editing ?? undefined}
          onSubmit={handleSubmit}
          onCancel={closeDrawer}
          isSubmitting={isSubmitting}
          categories={categories}
        />
      </Drawer>

      <ConfirmDialog {...dialogProps} confirmLabel={t("deleteConfirm")} />
    </div>
  );
}