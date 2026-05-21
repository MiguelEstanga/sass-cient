"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { loanService } from "@/services/finance/loan.service";
import { loanPaymentService } from "@/services/finance/loanPayment.service";
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
import { LoansTable } from "./LoansTable";
 
import type { Loan } from "@/types/finance/loan.types";
import type { LoanPayment } from "@/types/finance/payment.types";
 
import styles from "./styles/loans.module.css";
import { LoanFormValues } from "@/lib/validations/loan.schema";
import { LoanForm } from "./components/LoanForm/LoanForm";
import { RecordPaymentModal } from "./components/RecordPaymentModal/RecordPaymentModal";
import { SlidePanel } from "@/components/ui/slidePanel/SlidePanel";
import { LoanRecordContent } from "./components/LoanRecordContent/LoanRecordContent";

const PAGE_SIZE = Number(process.env.NEXT_PUBLIC_PAGE_SIZE) || 10;

export default function LoansPage() {
  const t = useTranslations("finance.loans");
  const toast = useToast();
  const { confirm, dialogProps } = useConfirm();

  // Estados del CRUD Principal
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Loan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [categories, setCategories] = useState<{ value: number; label: string }[]>([]);

  // Estados del Modal de Pagos
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [editingPayment, setEditingPayment] = useState<{
    id: number;
    interest_paid: string;
    principal_paid: string;
    payment_date: string;
  } | null>(null);

  // Estados del Slide Panel
  const [recordPanelOpen, setRecordPanelOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  
  // Estado para forzar el refresco del historial sin recargar la página
  const [paymentRefreshKey, setPaymentRefreshKey] = useState(0);

  // Tabla principal de préstamos
  const { rows, total, page, lastPage, loading, search, setSearch, setPage, refresh } =
    useLocalCache<Loan>(
      (params) => loanService.getAll(params),
      { keyField: "id", blockSize: 1500, pageSize: PAGE_SIZE }
    );

  // Cargar categorías al montar
  useEffect(() => {
    financeCategoryService
      .getAll({ type: "loan", per_page: 100 })
      .then((res) => {
        setCategories(res.data.map((c) => ({ value: c.id, label: c.name })));
      })
      .catch(() => {});
  }, []);

  // ==========================================
  // FUNCIONES PRÉSTAMOS (CRUD)
  // ==========================================
  function openCreate() {
    setEditing(null);
    setDrawerOpen(true);
  }

  function openEdit(loan: Loan) {
    setEditing(loan);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditing(null);
  }

  async function handleSubmit(values: LoanFormValues) {
    setIsSubmitting(true);
    try {
      if (editing) {
        await loanService.update(editing.id, values);
        toast.success(t("updated"));
      } else {
        await loanService.create(values);
        toast.success(t("created"));
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
          await loanService.delete(id);
          toast.success(t("deleted"));
          refresh();
        } catch (err) {
          toast.error(err instanceof ApiError ? err.message : t("errorDeleting"));
        } finally {
          setDeletingId(null);
        }
      },
    });
  }

  // ==========================================
  // FUNCIONES PAGOS (MODAL Y PANEL)
  // ==========================================
  function openPaymentModal(loan: Loan) {
    setSelectedLoan(loan);
    setEditingPayment(null); // Asegurarnos de que estemos en modo "Crear"
    setPaymentModalOpen(true);
  }

  function openRecordPanel(loan: Loan) {
    setSelectedLoan(loan);
    setRecordPanelOpen(true);
  }

  // Se dispara desde el botón "Editar" dentro del SlidePanel
  function openEditPaymentModal(payment: LoanPayment) {
    setEditingPayment({
      id: payment.id,
      interest_paid: payment.interest_paid,
      principal_paid: payment.principal_paid,
      payment_date: payment.payment_date,
    });
    setPaymentModalOpen(true);
  }

  // Maneja tanto CREAR como ACTUALIZAR un pago
  async function handleRegisterOrUpdatePayment(
    interestPaid: number,
    principalPaid: number,
    expectedInterest: number,
    date: string,
    paymentId?: number
  ) {
    if (!selectedLoan) return;
    setIsPaying(true);
    try {
      if (paymentId) {
        // EDITAR PAGO
        await loanPaymentService.update(paymentId, {
          interest_paid: interestPaid,
          principal_paid: principalPaid,
          payment_date: date,
        });
        toast.success("Pago actualizado correctamente");
      } else {
        // CREAR PAGO
        await loanPaymentService.create({
          loan_id: selectedLoan.id,
          interest_paid: interestPaid,
          principal_paid: principalPaid,
          expected_interest: expectedInterest,
          payment_date: date,
        });
        toast.success("Pago registrado correctamente");
      }

      setPaymentModalOpen(false);
      setEditingPayment(null);
      refresh(); // Refresca la tabla principal de préstamos
      
      // LA MAGIA: Obliga al SlidePanel a re-renderizar y pedir nuevos datos
      setPaymentRefreshKey((prev) => prev + 1);
      
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Error al guardar pago");
    } finally {
      setIsPaying(false);
    }
  }

  function closePaymentModal() {
    setPaymentModalOpen(false);
    setEditingPayment(null);
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
        <LoansTable
          data={rows}
          offset={(page - 1) * PAGE_SIZE}
          deletingId={deletingId}
          onEdit={openEdit}
          onDelete={handleDelete}
          onOpenPayment={openPaymentModal}
          onOpenRecord={openRecordPanel}
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

      {/* 1. DRAWER: Crear/Editar Préstamo */}
      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={editing ? t("editTitle") : t("newTitle")}
        subtitle={editing ? t("editSubtitle") : t("newSubtitle")}
      >
        <LoanForm
          defaultValues={editing ?? undefined}
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={closeDrawer}
          isSubmitting={isSubmitting}
        />
      </Drawer>

      {/* 2. MODAL: Registrar o Editar Pago Parcial */}
      <RecordPaymentModal
        open={paymentModalOpen}
        onClose={closePaymentModal}
        onConfirm={handleRegisterOrUpdatePayment}
        isSubmitting={isPaying}
        loanInterestRate={parseFloat(selectedLoan?.interest_rate || "0")}
        loanAmount={parseFloat(selectedLoan?.loan_amount || "0")}
        editingData={editingPayment} // Si tiene datos, el modal cambia a modo "Editar"
      />

      {/* 3. SLIDE PANEL: Historial del Préstamo (Se desliza desde la derecha) */}
      <SlidePanel
        open={recordPanelOpen}
        onClose={() => setRecordPanelOpen(false)}
        title={selectedLoan ? `Historial: ${selectedLoan.user?.name}` : "Historial"}
      >
        {selectedLoan && (
          <LoanRecordContent
            loanId={selectedLoan.id}
            initialDebt={selectedLoan.loan_amount}
            refreshKey={paymentRefreshKey} // Se actualiza mágicamente al pagar
            onEditPayment={openEditPaymentModal} // Abre el modal para editar un pago específico
          />
        )}
      </SlidePanel>

      {/* 4. CONFIRM DIALOG: Eliminar Préstamo */}
      <ConfirmDialog {...dialogProps} confirmLabel={t("deleteConfirm")} />
    </div>
  );
}