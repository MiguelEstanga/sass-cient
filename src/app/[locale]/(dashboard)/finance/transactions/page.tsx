"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { transactionService } from "@/services/finance/transaction.service";
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
import { TransactionsTable } from "./TransactionsTable";
import { TransactionForm } from "./components/TransactionForm";
import type { Transaction } from "@/types/finance/transaction.types";
 import styles from "./styles/transactions.module.css";
import { TransactionFormValues } from "@/lib/validations/transaction.schema";

const PAGE_SIZE = Number(process.env.NEXT_PUBLIC_PAGE_SIZE) || 15;

export default function TransactionsPage() {
  const t = useTranslations("finance.transactions");
  const toast = useToast();
  const { confirm, dialogProps } = useConfirm();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null); // <-- Nuevo estado
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [categories, setCategories] = useState<{ value: number; label: string }[]>([]);

  const { rows, total, page, lastPage, loading, search, setSearch, setPage, refresh } =
    useLocalCache<Transaction>(
      (params) => transactionService.getAll(params),
      { keyField: "id", blockSize: 1500, pageSize: PAGE_SIZE }
    );

  useEffect(() => {
    financeCategoryService.getAll({ per_page: 100 }).then((res) => {
      setCategories(res.data.map((c) => ({ value: c.id, label: c.name })));
    }).catch(() => {});
  }, []);

  // <-- NUEVAS FUNCIONES
  function openCreate() {
    setEditing(null);
    setDrawerOpen(true);
  }

  function openEdit(transaction: Transaction) {
    setEditing(transaction);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditing(null);
  }

  async function handleSubmit(values: TransactionFormValues) {
    setIsSubmitting(true);
    try {
      if (editing) {
        await transactionService.update(editing.id, values);
        toast.success(t("updated"));
      } else {
        await transactionService.create(values);
        toast.success(values.type === "income" ? t("incomeCreated") : t("expenseCreated"));
      }
      closeDrawer();
      refresh();
    } catch (err) {
      if (err instanceof ApiError && err.isValidationError()) {
        toast.error(err.getAllErrors().join(", "));
      } else {
        toast.error(err instanceof ApiError ? err.message : "Error al guardar");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDelete(id: number, concept: string) {
    confirm({
      title: t("deleteTitle"),
      message: t("deleteMessage", { concept }),
      onConfirm: async () => {
        setDeletingId(id);
        try {
          await transactionService.delete(id);
          toast.success(t("deleted"));
          refresh();
        } catch (err) {
          toast.error(err instanceof ApiError ? err.message : "Error al eliminar");
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
          <p className={styles.subtitle}>{t("subtitle")}</p>
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
        <TransactionsTable 
          data={rows} 
          offset={(page - 1) * PAGE_SIZE} 
          deletingId={deletingId}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}

      <div className={styles.pagination}>
        <Paginator page={page} lastPage={lastPage} total={total} pageSize={PAGE_SIZE} loading={loading} onChange={setPage} />
      </div>

      {/* Drawer actualizado para editar o crear */}
      <Drawer 
        open={drawerOpen} 
        onClose={closeDrawer} 
        title={editing ? t("editTitle") : t("newTitle")} 
        subtitle={editing ? t("editSubtitle") : t("newSubtitle")}
      >
        <TransactionForm 
          defaultValues={editing ?? undefined} 
          categories={categories} 
          onSubmit={handleSubmit} 
          onCancel={closeDrawer} 
          isSubmitting={isSubmitting} 
        />
      </Drawer>

      <ConfirmDialog {...dialogProps} confirmLabel={t("deleteConfirm")} />
    </div>
  );
}