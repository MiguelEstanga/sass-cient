"use client";

import { useState, useRef, useCallback, useEffect } from "react";
 
import {
  Upload, FileSpreadsheet, Download,
  CheckCircle, XCircle, AlertCircle, Loader,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Modal";
import { useImportChannel, type ImportProgress } from "@/hooks/useImportChannel";
import type { ImportResults } from "@/services/import.service";
import styles from "./ImportDrawer.module.css";
import { useTranslations } from "next-intl";
interface Props {
  open:                 boolean;
  onClose:              () => void;
  onImport:             (file: File) => Promise<ImportResults>;
  onDownloadTemplate?:  () => Promise<void>;
  title?:               string;
  entity?:              string;
}

type Stage = "upload" | "processing" | "completed" | "failed";

export function ImportDrawer({
  open, onClose, onImport, onDownloadTemplate, title, entity,
}: Props) {
  const t                               = useTranslations("import");
  const [stage, setStage]               = useState<Stage>("upload");
  const [progress, setProgress]         = useState<ImportProgress | null>(null);
  const [dragOver, setDragOver]         = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError]               = useState<string | null>(null);
  const [jobId, setJobId]               = useState<number | null>(null);
  const inputRef                        = useRef<HTMLInputElement>(null);

  // Escuchar progreso via WebSocket
  useImportChannel({
    onProgress: useCallback((data: ImportProgress) => {
      // Solo procesar eventos del job actual
      if (jobId && data.id !== jobId) return;

      setProgress(data);

      if (data.status === "completed" || data.status === "failed") {
        setStage(data.status);
      }
    }, [jobId]),
  });

  // Reset al cerrar
  function handleClose() {
    setStage("upload");
    setProgress(null);
    setSelectedFile(null);
    setError(null);
    setJobId(null);
    onClose();
  }

  // Validar archivo
  function validateFile(file: File): boolean {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(ext ?? "")) {
      setError(t("invalidFormat"));
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("El archivo no puede superar 5MB");
      return false;
    }
    return true;
  }

  function handleFileSelect(file: File) {
    setError(null);
    if (validateFile(file)) setSelectedFile(file);
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, []);

  // Iniciar importación
  async function handleImport() {
    if (!selectedFile) return;
    setError(null);

    try {
      const result = await onImport(selectedFile);
      setJobId(result.import_job_id);
      setStage("processing");
    } catch (err: any) {
      setError(err?.message ?? "Error al subir el archivo");
    }
  }

  // Porcentaje de progreso
  const pct = progress && progress.total_rows > 0
    ? Math.round(((progress.success_rows + progress.failed_rows) / progress.total_rows) * 100)
    : 0;

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title={title ?? t("title")}
      subtitle={t("subtitle")}
    >
      <div className={styles.content}>

        {/* ── Upload ──────────────────────────────────────────────── */}
        {stage === "upload" && (
          <>
            {onDownloadTemplate && (
              <button className={styles.templateBtn} onClick={onDownloadTemplate}>
                <Download size={15} />
                {t("download")}
              </button>
            )}

            <div
              className={`${styles.dropZone} ${dragOver ? styles.dropZoneActive : ""} ${selectedFile ? styles.dropZoneSelected : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className={styles.fileInput}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />

              {selectedFile ? (
                <div className={styles.fileSelected}>
                  <FileSpreadsheet size={32} className={styles.fileIcon} />
                  <p className={styles.fileName}>{selectedFile.name}</p>
                  <p className={styles.fileSize}>
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ) : (
                <div className={styles.dropContent}>
                  <Upload size={32} className={styles.uploadIcon} />
                  <p className={styles.dropText}>
                    {t("drag")} {t("or")}{" "}
                    <span className={styles.browseLink}>{t("browse")}</span>
                  </p>
                  <p className={styles.dropFormats}>{t("formats")}</p>
                </div>
              )}
            </div>

            {error && (
              <div className={styles.errorBox}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className={styles.actions}>
              <Button type="button" variant="secondary" onClick={handleClose}>
                {t("close")}
              </Button>
              <Button
                type="button"
                onClick={handleImport}
                disabled={!selectedFile}
              >
                <Upload size={16} />
                {t("button")}
              </Button>
            </div>
          </>
        )}

        {/* ── Processing — progreso en tiempo real ─────────────────── */}
        {stage === "processing" && (
          <div className={styles.processing}>
            <div className={styles.processingHeader}>
              <Loader size={20} className={styles.spinner} />
              <p className={styles.processingTitle}>{t("processing")}</p>
            </div>

            {/* Barra de progreso */}
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className={styles.progressPct}>{pct}%</p>

            {/* Stats en tiempo real */}
            {progress && (
              <div className={styles.liveStats}>
                <div className={styles.liveStat}>
                  <span className={styles.liveStatLabel}>{t("total")}</span>
                  <span className={styles.liveStatValue}>{progress.total_rows}</span>
                </div>
                <div className={`${styles.liveStat} ${styles.liveStatSuccess}`}>
                  <CheckCircle size={14} />
                  <span className={styles.liveStatLabel}>{t("imported")}</span>
                  <span className={styles.liveStatValue}>{progress.success_rows}</span>
                </div>
                <div className={`${styles.liveStat} ${styles.liveStatFailed}`}>
                  <XCircle size={14} />
                  <span className={styles.liveStatLabel}>{t("failed")}</span>
                  <span className={styles.liveStatValue}>{progress.failed_rows}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Completed / Failed ───────────────────────────────────── */}
        {(stage === "completed" || stage === "failed") && progress && (
          <>
            {/* Resumen */}
            <div className={`${styles.resultHeader} ${stage === "failed" ? styles.resultFailed : styles.resultSuccess}`}>
              {stage === "completed"
                ? <CheckCircle size={24} />
                : <XCircle    size={24} />}
              <p className={styles.resultTitle}>
                {stage === "completed"
                  ? t("success", { count: progress.success_rows })
                  : progress.error_message ?? "La importación falló"}
              </p>
            </div>

            {/* Stats */}
            <div className={styles.summary}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>{t("total")}</span>
                <span className={styles.summaryValue}>{progress.total_rows}</span>
              </div>
              <div className={`${styles.summaryItem} ${styles.summarySuccess}`}>
                <span className={styles.summaryLabel}>{t("imported")}</span>
                <span className={styles.summaryValue}>{progress.success_rows}</span>
              </div>
              <div className={`${styles.summaryItem} ${styles.summaryFailed}`}>
                <span className={styles.summaryLabel}>{t("failed")}</span>
                <span className={styles.summaryValue}>{progress.failed_rows}</span>
              </div>
            </div>

            {/* Errores detallados */}
            {progress.errors.length > 0 && (
              <div className={styles.errorList}>
                <p className={styles.errorListTitle}>
                  {t("errors", { count: progress.errors.length })}
                </p>
                {progress.errors.map((err, i) => (
                  <div key={i} className={styles.errorItem}>
                    <span className={styles.errorRow}>{t("row")} {err.row}</span>
                    <span className={styles.errorMsg}>{err.message}</span>
                  </div>
                ))}
              </div>
            )}

            <div className={styles.actions}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setStage("upload");
                  setSelectedFile(null);
                  setProgress(null);
                  setJobId(null);
                }}
              >
                {t("retry")}
              </Button>
              <Button type="button" onClick={handleClose}>
                {t("close")}
              </Button>
            </div>
          </>
        )}

      </div>
    </Drawer>
  );
}

 