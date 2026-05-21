"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { financeCategoryService } from "@/services/finance/category.service";
import { useToast } from "@/hooks/useToast";
import { useLocalCache } from "@/hooks/useLocalCache";
import { useConfirm } from "@/hooks/useConfirm";
import { ApiError } from "@/lib/api/errors";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Drawer, ConfirmDialog } from "@/components/ui/Modal";
import { Paginator } from "@/components/ui/Pagination";
import { SkeletonRow } from "@/components/ui/Skeleton";
import { CategoriesTable } from "./CategoriesTable";
import { CategoryForm } from "./components/CategoryForm";
import type { FinanceCategory } from "@/types/finance/category.types";
import styles from "./styles/categories.module.css";
import { FinanceCategoryFormValues } from "@/lib/validations/category.schema";

const PAGE_SIZE = Number(process.env.NEXT_PUBLIC_PAGE_SIZE) || 10;

export default function FinanceCategoriesPage() {
  const t = useTranslations("finance.categories");
  const toast = useToast();
  const { confirm, dialogProps } = useConfirm();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<FinanceCategory | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { rows, total, page, lastPage, loading, search, setSearch, setPage, refresh } =
    useLocalCache<FinanceCategory>(
      (params) => financeCategoryService.getAll(params),
      { keyField: "id", blockSize: 1500, pageSize: PAGE_SIZE }
    );

  function openCreate() { setEditing(null); setDrawerOpen(true); }
  function openEdit(cat: FinanceCategory) { setEditing(cat); setDrawerOpen(true); }
  function closeDrawer() { setDrawerOpen(false); setEditing(null); }

  async function handleSubmit(values: FinanceCategoryFormValues) {
    setIsSubmitting(true);
    try {
      if (editing) {
        await financeCategoryService.update(editing.id, values);
        toast.success(t("updated", { name: values.name }));
      } else {
        await financeCategoryService.create(values);
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
          await financeCategoryService.delete(id);
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
          <p className={styles.subtitle}>{total > 0 ? t("subtitle", { count: total }) : ""}</p>
        </div>
        <Button onClick={openCreate}>{t("newButton")}</Button>
      </div>

      <div className={styles.toolbar}>
        <Input placeholder={t("searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} fullWidth />
      </div>

      {loading ? (
        <div className={styles.tableWrapper}>
          {Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : (
        <CategoriesTable data={rows} offset={(page - 1) * PAGE_SIZE} deletingId={deletingId} onEdit={openEdit} onDelete={handleDelete} />
      )}

      <div className={styles.pagination}>
        <Paginator page={page} lastPage={lastPage} total={total} pageSize={PAGE_SIZE} loading={loading} onChange={setPage} />
      </div>

      <Drawer open={drawerOpen} onClose={closeDrawer} title={editing ? t("editTitle") : t("newTitle")} subtitle={editing ? t("editSubtitle", { name: editing.name }) : t("newSubtitle")}>
        <CategoryForm defaultValues={editing ?? undefined} onSubmit={handleSubmit} onCancel={closeDrawer} isSubmitting={isSubmitting} />
      </Drawer>

      <ConfirmDialog {...dialogProps} confirmLabel={t("deleteConfirm")} />
    </div>
  );
}