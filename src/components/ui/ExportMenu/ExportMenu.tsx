"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Download, FileSpreadsheet, FileText,
  Calendar, Clock, List, ChevronDown,
} from "lucide-react";
import { useToast } from "@/hooks/useToast";
import type { ExportFilters, ExportFormat } from "@/services/export.service";
import styles from "./ExportMenu.module.css";

interface Props {
  onExport: (filters: ExportFilters) => Promise<void>;
}

export function ExportMenu({ onExport }: Props) {
  const t                             = useTranslations("export");
  const toast                         = useToast();
  const [open, setOpen]               = useState(false);
  const [loading, setLoading]         = useState(false);
  const [showDates, setShowDates]     = useState(false);
  const [format, setFormat]           = useState<ExportFormat>("xlsx");
  const [dateFrom, setDateFrom]       = useState("");
  const [dateTo, setDateTo]           = useState("");

  // Cerrar menú al hacer click fuera
  function handleBackdrop() {
    setOpen(false);
    setShowDates(false);
  }

  // Exportar con filtros predefinidos
  async function handleExport(filters: Omit<ExportFilters, "format">) {
    setLoading(true);
    setOpen(false);
    try {
      await onExport({ ...filters, format });
      toast.success(t("success"));
    } catch (err: any) {
      toast.error(err?.message ?? t("error"));
    } finally {
      setLoading(false);
    }
  }

  // Exportar con rango de fechas
  async function handleDateExport() {
    if (!dateFrom || !dateTo) return;
    setLoading(true);
    setOpen(false);
    setShowDates(false);
    try {
      await onExport({ format, date_from: dateFrom, date_to: dateTo });
      toast.success(t("success"));
    } catch (err: any) {
      toast.error(err?.message ?? t("error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Backdrop para cerrar */}
      {open && (
        <div className={styles.backdrop} onClick={handleBackdrop} />
      )}

      <div className={styles.wrapper}>
        {/* Botón trigger */}
        <button
          className={styles.trigger}
          onClick={() => setOpen(!open)}
          disabled={loading}
        >
          <Download size={15} />
          {loading ? t("exporting") : t("button")}
          <ChevronDown
            size={13}
            className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
          />
        </button>

        {/* Dropdown */}
        {open && (
          <div className={styles.menu}>

            {/* Selector de formato */}
            <div className={styles.formatSection}>
              <button
                className={`${styles.formatBtn} ${format === "xlsx" ? styles.formatActive : ""}`}
                onClick={() => setFormat("xlsx")}
              >
                <FileSpreadsheet size={14} />
                {t("excel")}
              </button>
              <button
                className={`${styles.formatBtn} ${format === "csv" ? styles.formatActive : ""}`}
                onClick={() => setFormat("csv")}
              >
                <FileText size={14} />
                {t("csv")}
              </button>
            </div>

            <div className={styles.divider} />

            {/* Opciones de filtro */}
            {!showDates ? (
              <div className={styles.options}>
                <button
                  className={styles.option}
                  onClick={() => handleExport({})}
                >
                  <List size={15} />
                  {t("all")}
                </button>

                <button
                  className={styles.option}
                  onClick={() => handleExport({ today: true })}
                >
                  <Clock size={15} />
                  {t("today")}
                </button>

                <button
                  className={styles.option}
                  onClick={() => handleExport({ last: 100 })}
                >
                  <List size={15} />
                  {t("last100")}
                </button>

                <button
                  className={styles.option}
                  onClick={() => setShowDates(true)}
                >
                  <Calendar size={15} />
                  {t("dateRange")}
                </button>
              </div>
            ) : (
              /* Rango de fechas */
              <div className={styles.dateSection}>
                <div className={styles.dateField}>
                  <label className={styles.dateLabel}>{t("from")}</label>
                  <input
                    type="date"
                    className={styles.dateInput}
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div className={styles.dateField}>
                  <label className={styles.dateLabel}>{t("to")}</label>
                  <input
                    type="date"
                    className={styles.dateInput}
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
                <div className={styles.dateActions}>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => setShowDates(false)}
                  >
                    {t("cancel")}
                  </button>
                  <button
                    className={styles.exportBtn}
                    onClick={handleDateExport}
                    disabled={!dateFrom || !dateTo}
                  >
                    <Download size={13} />
                    {t("export")}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}