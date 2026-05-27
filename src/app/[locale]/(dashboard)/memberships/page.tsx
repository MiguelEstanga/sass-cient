"use client";

import { useState, useCallback, useRef } from "react";
import { Crown, UserPlus, Plus } from "lucide-react";
import { membershipService } from "@/services/membership/membership.service";
import { useToast } from "@/hooks/useToast";
import { useConfirm } from "@/hooks/useConfirm";
import { useLocalCache } from "@/hooks/useLocalCache";
import { ApiError } from "@/lib/api/errors";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Drawer, ConfirmDialog } from "@/components/ui/Modal";
import { SkeletonRow } from "@/components/ui/Skeleton";
import { PlanCard } from "./components/PlanCard";
import { SubscriptionCard } from "./components/SubscriptionCard";
import { PlanForm } from "./components/PlanForm";
import { SubscribeForm } from "./components/SubscribeForm";
import type { MembershipPlan, MembershipSubscription } from "@/types/membership.types";
import type { PlanFormValues, SubscriptionFormValues } from "@/lib/validations/membership.schema";
import styles from "./memberships.module.css";

type Tab = "plans" | "subscriptions";

export default function MembershipsPage() {
  const toast                       = useToast();
  const { confirm, dialogProps }    = useConfirm();
  const [activeTab, setActiveTab]   = useState<Tab>("plans");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"plan" | "subscribe">("plan");
  const [editingPlan, setEditingPlan]   = useState<MembershipPlan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [planSearch, setPlanSearch]     = useState("");
  const [subSearch, setSubSearch]       = useState("");
  const [subStatus, setSubStatus]       = useState("");

  // ── Cache planes ───────────────────────────────────────────────────────
  const planFetcher = useCallback(
    (p: any) => membershipService.getPlans({ ...p, search: planSearch }),
    [planSearch]
  );
  const {
    rows: plans, loading: plansLoading, refresh: refreshPlans,
  } = useLocalCache<MembershipPlan>(planFetcher, {
    keyField: "id", blockSize: 100, pageSize: 50,
  });

  // ── Cache suscripciones ────────────────────────────────────────────────
  const subFetcher = useCallback(
    (p: any) => membershipService.getSubscriptions({
      ...p, search: subSearch, status: subStatus || undefined,
    }),
    [subSearch, subStatus]
  );
  const {
    rows: subscriptions, loading: subsLoading, refresh: refreshSubs,
  } = useLocalCache<MembershipSubscription>(subFetcher, {
    keyField: "id", blockSize: 500, pageSize: 20,
  });

  // ── Abrir drawers ──────────────────────────────────────────────────────
  function openCreatePlan() {
    setEditingPlan(null);
    setDrawerMode("plan");
    setDrawerOpen(true);
  }

  function openEditPlan(plan: MembershipPlan) {
    setEditingPlan(plan);
    setDrawerMode("plan");
    setDrawerOpen(true);
  }

  function openSubscribe() {
    setDrawerMode("subscribe");
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditingPlan(null);
  }

  // ── Submit plan ────────────────────────────────────────────────────────
  async function handlePlanSubmit(values: PlanFormValues) {
    setIsSubmitting(true);
    try {
      if (editingPlan) {
        await membershipService.updatePlan(editingPlan.id, values);
        toast.success("Plan actualizado correctamente");
      } else {
        await membershipService.createPlan(values);
        toast.success("Plan creado correctamente");
      }
      closeDrawer();
      refreshPlans();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Error al guardar");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Submit suscripción ─────────────────────────────────────────────────
  async function handleSubscribeSubmit(values: SubscriptionFormValues) {
    setIsSubmitting(true);
    try {
      await membershipService.subscribe(values);
      toast.success("Cliente suscrito correctamente");
      closeDrawer();
      refreshSubs();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Error al suscribir");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Eliminar plan ──────────────────────────────────────────────────────
  function handleDeletePlan(plan: MembershipPlan) {
    confirm({
      title:   "Eliminar plan",
      message: `¿Eliminar el plan "${plan.name}"? Solo se puede eliminar si no tiene suscripciones activas.`,
      onConfirm: async () => {
        try {
          await membershipService.deletePlan(plan.id);
          toast.success("Plan eliminado");
          refreshPlans();
        } catch (err) {
          toast.error(err instanceof ApiError ? err.message : "Error al eliminar");
        }
      },
    });
  }

  // ── Toggle activo/inactivo plan ────────────────────────────────────────
  async function handleTogglePlan(plan: MembershipPlan) {
    try {
      await membershipService.updatePlan(plan.id, { is_active: !plan.is_active });
      toast.success(plan.is_active ? "Plan desactivado" : "Plan activado");
      refreshPlans();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Error al actualizar");
    }
  }

  // ── Actualizar suscripción en el estado local ──────────────────────────
  function handleSubUpdate(updated: MembershipSubscription) {
    refreshSubs();
  }

  const STATUS_OPTIONS = [
    { value: "",          label: "Todos los estados" },
    { value: "active",    label: "Activas"           },
    { value: "paused",    label: "Pausadas"          },
    { value: "cancelled", label: "Canceladas"        },
    { value: "expired",   label: "Expiradas"         },
  ];

  return (
    <div className={styles.page}>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Membresías</h1>
          <p className={styles.subtitle}>
            {plans.length} planes · {subscriptions.length} suscripciones
          </p>
        </div>
        <div className={styles.headerActions}>
          {activeTab === "plans" && (
            <Button onClick={openCreatePlan}>
              <Plus size={16} /> Nuevo plan
            </Button>
          )}
          {activeTab === "subscriptions" && (
            <Button onClick={openSubscribe}>
              <UserPlus size={16} /> Suscribir cliente
            </Button>
          )}
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────── */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "plans" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("plans")}
        >
          <Crown size={15} /> Planes
        </button>
        <button
          className={`${styles.tab} ${activeTab === "subscriptions" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("subscriptions")}
        >
          <UserPlus size={15} /> Suscripciones
        </button>
      </div>

      {/* ── Planes ──────────────────────────────────────────────────── */}
      {activeTab === "plans" && (
        <div>
          <Input
            placeholder="Buscar plan..."
            value={planSearch}
            onChange={(e) => setPlanSearch(e.target.value)}
            fullWidth
          />
          {plansLoading ? (
            <div className={styles.skeletons}>
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
          ) : plans.length === 0 ? (
            <div className={styles.empty}>
              <Crown size={32} />
              <p>No hay planes creados</p>
              <Button onClick={openCreatePlan}>Crear primer plan</Button>
            </div>
          ) : (
            <div className={styles.cardsGrid}>
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onEdit={openEditPlan}
                  onDelete={handleDeletePlan}
                  onToggle={handleTogglePlan}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Suscripciones ───────────────────────────────────────────── */}
      {activeTab === "subscriptions" && (
        <div className={styles.subsContent}>
          <div className={styles.subsToolbar}>
            <Input
              placeholder="Buscar cliente..."
              value={subSearch}
              onChange={(e) => setSubSearch(e.target.value)}
              fullWidth
            />
            <select
              className={styles.statusFilter}
              value={subStatus}
              onChange={(e) => setSubStatus(e.target.value)}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {subsLoading ? (
            <div className={styles.skeletons}>
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
          ) : subscriptions.length === 0 ? (
            <div className={styles.empty}>
              <UserPlus size={32} />
              <p>No hay suscripciones</p>
              <Button onClick={openSubscribe}>Suscribir primer cliente</Button>
            </div>
          ) : (
            <div className={styles.cardsGrid}>
              {subscriptions.map((sub) => (
                <SubscriptionCard
                  key={sub.id}
                  subscription={sub}
                  onUpdate={handleSubUpdate}
                  onHistory={() => {}}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Drawer ──────────────────────────────────────────────────── */}
      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={
          drawerMode === "plan"
            ? editingPlan ? "Editar plan" : "Nuevo plan"
            : "Suscribir cliente"
        }
        subtitle={
          drawerMode === "plan"
            ? editingPlan ? `Editando ${editingPlan.name}` : "Configura los beneficios del plan"
            : "Asigna un plan de membresía a un cliente"
        }
      >
        {drawerMode === "plan" ? (
          <PlanForm
            key={editingPlan?.id ?? "new"}
            defaultValues={editingPlan ?? undefined}
            onSubmit={handlePlanSubmit}
            onCancel={closeDrawer}
            isSubmitting={isSubmitting}
          />
        ) : (
          <SubscribeForm
            onSubmit={handleSubscribeSubmit}
            onCancel={closeDrawer}
            isSubmitting={isSubmitting}
          />
        )}
      </Drawer>

      <ConfirmDialog {...dialogProps} confirmLabel="Sí, eliminar" />
    </div>
  );
}