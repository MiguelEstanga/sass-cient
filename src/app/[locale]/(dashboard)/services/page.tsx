"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/useToast";
import { useLocalCache } from "@/hooks/useLocalCache";
import { useConfirm } from "@/hooks/useConfirm";
import { ApiError } from "@/lib/api/errors";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Drawer, ConfirmDialog } from "@/components/ui/Modal";
import { Paginator } from "@/components/ui/Pagination";
import { SkeletonRow } from "@/components/ui/Skeleton";
import { ServicesTable } from "./ServicesTable";
import { ServiceForm } from "./components/ServiceForm";
import type { ServiceFormValues } from "@/lib/validations/service.schema";

import { Service } from "@/types/services.types";
import { serviceService } from "@/services/services.service";
import styles from "./styles/services.module.css";
import { ExportMenu } from "@/components/ui/ExportMenu";
import { exportService } from "@/services/export.service";
import { PageActions } from "@/components/ui/PageActions";
const PAGE_SIZE = Number(process.env.NEXT_PUBLIC_PAGE_SIZE) || 10;

export default function ServicesPage() {
  const t = useTranslations("services");
  const toast = useToast();
  const { confirm, dialogProps } = useConfirm();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const {
    rows,
    total,
    page,
    lastPage,
    loading,
    search,
    setSearch,
    setPage,
    refresh,
  } = useLocalCache<Service>((params) => serviceService.getAll(params), {
    keyField: "id",
    blockSize: 1500,
    pageSize: PAGE_SIZE,
  });

  function openCreate() {
    setEditing(null);
    setDrawerOpen(true);
  }

  function openEdit(service: Service) {
    setEditing(service);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditing(null);
  }

  async function handleSubmit(values: ServiceFormValues) {
    setIsSubmitting(true);
    try {
      if (editing) {
        await serviceService.update(editing.id, values);
        toast.success(t("updated", { name: values.name }));
      } else {
        await serviceService.create(values);
        toast.success(t("created", { name: values.name }));
      }
      closeDrawer();
      refresh();
    } catch (err) {
      if (err instanceof ApiError && err.isValidationError()) {
        toast.error(err.getAllErrors().join(", "));
      } else {
        toast.error(
          err instanceof ApiError ? err.message : t("errorConnection"),
        );
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
          await serviceService.delete(id);
          toast.success(t("deleted", { name }));
          refresh();
        } catch (err) {
          toast.error(
            err instanceof ApiError ? err.message : t("errorDeleting"),
          );
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
        <PageActions>
          <ExportMenu onExport={exportService.services} />
          <Button onClick={openCreate}>{t("newButton")}</Button>
        </PageActions>
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
        <ServicesTable
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
          pageSize={PAGE_SIZE}
          loading={loading}
          onChange={setPage}
        />
      </div>

      {/* Drawer create/edit */}
      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={editing ? t("editTitle") : t("newTitle")}
        subtitle={
          editing ? t("editSubtitle", { name: editing.name }) : t("newSubtitle")
        }
      >
        <ServiceForm
          defaultValues={editing ?? undefined}
          onSubmit={handleSubmit}
          onCancel={closeDrawer}
          isSubmitting={isSubmitting}
        />
      </Drawer>

      {/* Confirm delete dialog */}
      <ConfirmDialog {...dialogProps} confirmLabel={t("deleteConfirm")} />
    </div>
  );
}
