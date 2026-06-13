"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Phone, FileText, Shield, Upload } from "lucide-react";
import {
  configService,
  type PrefixItem,
  type DocumentItem,
} from "@/services/config.service";
import { pinService } from "@/services/pin.service";
import { useToast } from "@/hooks/useToast";
import { useRole } from "@/hooks/useRole";
import { ApiError } from "@/lib/api/errors";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import styles from "./settings.module.css";
import { PageActions } from "@/components/ui/PageActions";
import { ImportDrawer } from "@/components/ui/ImportDrawer/ImportDrawer";
import { importService } from "@/services/import.service";

type Tab = "prefixes" | "documents" | "pin";

export default function SettingsPage() {
  const toast = useToast();
  const { settings } = useRole();
  const [activeTab, setActiveTab] = useState<Tab>("prefixes");

  // ── Prefijos ────────────────────────────────────────────────────────
  const [prefixes, setPrefixes] = useState<PrefixItem[]>([]);
  const [newPrefix, setNewPrefix] = useState("");
  const [loadingPfx, setLoadingPfx] = useState(false);

  // ── Documentos ──────────────────────────────────────────────────────
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [newDocument, setNewDocument] = useState("");
  const [loadingDoc, setLoadingDoc] = useState(false);

  // ── PIN ─────────────────────────────────────────────────────────────
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loadingPin, setLoadingPin] = useState(false);

  // ── Cargar datos iniciales ─────────────────────────────────────────
  const [importDocsOpen, setImportDocsOpen] = useState(false);

  useEffect(() => {
    loadPrefixes();
    loadDocuments();
  }, []);

  async function loadPrefixes() {
    try {
      const data = await configService.getPrefixes();
      setPrefixes(data);
    } catch {
      /* silencioso */
    }
  }

  async function loadDocuments() {
    try {
      const data = await configService.getDocuments();
      setDocuments(data);
    } catch {
      /* silencioso */
    }
  }

  // ── Crear prefijo ────────────────────────────────────────────────────
  async function handleAddPrefix() {
    if (!newPrefix.trim()) return;
    setLoadingPfx(true);
    try {
      const created = await configService.createPrefix(newPrefix.trim());
      setPrefixes((prev) => [...prev, created]);
      setNewPrefix("");
      toast.success("Prefijo agregado");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Error al agregar");
    } finally {
      setLoadingPfx(false);
    }
  }

  // ── Eliminar prefijo ─────────────────────────────────────────────────
  async function handleDeletePrefix(id: number) {
    try {
      await configService.deletePrefix(id);
      setPrefixes((prev) => prev.filter((p) => p.id !== id));
      toast.success("Prefijo eliminado");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Error al eliminar");
    }
  }

  // ── Crear documento ──────────────────────────────────────────────────
  async function handleAddDocument() {
    if (!newDocument.trim()) return;
    setLoadingDoc(true);
    try {
      const created = await configService.createDocument(newDocument.trim());
      setDocuments((prev) => [...prev, created]);
      setNewDocument("");
      toast.success("Documento agregado");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Error al agregar");
    } finally {
      setLoadingDoc(false);
    }
  }

  // ── Eliminar documento ───────────────────────────────────────────────
  async function handleDeleteDocument(id: number) {
    try {
      await configService.deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      toast.success("Documento eliminado");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Error al eliminar");
    }
  }

  // ── Cambiar PIN ──────────────────────────────────────────────────────
  async function handleChangePin() {
    if (newPin !== confirmPin) {
      toast.error("Los PINs no coinciden");
      return;
    }
    if (newPin.length !== 6 || !/^\d+$/.test(newPin)) {
      toast.error("El PIN debe ser de 6 dígitos numéricos");
      return;
    }
    setLoadingPin(true);
    try {
      await pinService.change(currentPin, newPin);
      toast.success("PIN actualizado correctamente");
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "PIN actual incorrecto",
      );
    } finally {
      setLoadingPin(false);
    }
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Configuración</h1>
          <p className={styles.subtitle}>
            Personaliza los datos del sistema para tu empresa
          </p>
        </div>
      </div>

      {/* Tabs */}
      {/* ── Tabs ────────────────────────────────────────────── */}
<div className={styles.tabs}>
  <button
    className={`${styles.tab} ${activeTab === "prefixes" ? styles.tabActive : ""}`}
    onClick={() => setActiveTab("prefixes")}
  >
    <Phone size={15} /> Prefijos telefónicos
  </button>
  <button
    className={`${styles.tab} ${activeTab === "documents" ? styles.tabActive : ""}`}
    onClick={() => setActiveTab("documents")}
  >
    <FileText size={15} /> Tipos de documento
  </button>
  {settings.canChangePin && (
    <button
      className={`${styles.tab} ${activeTab === "pin" ? styles.tabActive : ""}`}
      onClick={() => setActiveTab("pin")}
    >
      <Shield size={15} /> PIN de seguridad
    </button>
  )}
</div>

{/* ── Contenido del tab — FUERA de los botones de tab ── */}
{activeTab === "documents" && (
  <div className={styles.section}>
    <p className={styles.sectionDesc}>
      Tipos de documento de identidad aceptados en el sistema.
    </p>

    {/* Toolbar AQUÍ — no dentro del tab button */}
    <div className={styles.addRow}>
      <Input
        placeholder="Ej: Cédula, Pasaporte, DNI"
        value={newDocument}
        onChange={(e) => setNewDocument(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAddDocument()}
        fullWidth
      />
      <Button type="button" loading={loadingDoc} onClick={handleAddDocument}>
        <Plus size={16} /> Agregar
      </Button>
      <Button type="button" variant="secondary" onClick={() => setImportDocsOpen(true)}>
        <Upload size={16} /> Importar
      </Button>
    </div>

    {/* Lista */}
    <div className={styles.tagList}>
      {documents.length === 0 ? (
        <p className={styles.empty}>No hay tipos de documento configurados</p>
      ) : (
        documents.map((d) => (
          <div key={d.id} className={styles.tag}>
            <span>{d.name}</span>
            <button className={styles.tagDelete} onClick={() => handleDeleteDocument(d.id)}>
              <Trash2 size={12} />
            </button>
          </div>
        ))
      )}
    </div>
  </div>
)}
      {/* ── Tab Prefijos ──────────────────────────────────────────────── */}
      {activeTab === "prefixes" && (
        <div className={styles.section}>
          <p className={styles.sectionDesc}>
            Prefijos telefónicos disponibles al registrar clientes y empleados.
          </p>

          {/* Agregar */}
          <div className={styles.addRow}>
            <Input
              placeholder="Ej: +1, +34, +57"
              value={newPrefix}
              onChange={(e) => setNewPrefix(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddPrefix()}
              fullWidth
            />
            <Button
              type="button"
              loading={loadingPfx}
              onClick={handleAddPrefix}
            >
              <Plus size={16} /> Agregar
            </Button>
          </div>

          {/* Lista */}
          <div className={styles.tagList}>
            {prefixes.length === 0 ? (
              <p className={styles.empty}>No hay prefijos configurados</p>
            ) : (
              prefixes.map((p) => (
                <div key={p.id} className={styles.tag}>
                  <span>{p.prefix}</span>
                  <button
                    className={styles.tagDelete}
                    onClick={() => handleDeletePrefix(p.id)}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
 
      {/* ── Tab PIN ───────────────────────────────────────────────────── */}
      {activeTab === "pin" && (
        <div className={styles.section}>
          <p className={styles.sectionDesc}>
            El PIN de 6 dígitos protege acciones sensibles como eliminar
            registros. Por defecto es <strong>123456</strong>.
          </p>

          <div className={styles.pinForm}>
            <Input
              label="PIN actual"
              type="password"
              placeholder="••••••"
              maxLength={6}
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ""))}
              fullWidth
            />
            <Input
              label="Nuevo PIN"
              type="password"
              placeholder="••••••"
              maxLength={6}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
              fullWidth
            />
            <Input
              label="Confirmar nuevo PIN"
              type="password"
              placeholder="••••••"
              maxLength={6}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
              fullWidth
            />
            <Button
              type="button"
              loading={loadingPin}
              onClick={handleChangePin}
              disabled={!currentPin || !newPin || !confirmPin}
            >
              <Shield size={16} /> Cambiar PIN
            </Button>
          </div>
        </div>
      )}

      <ImportDrawer
        open={importDocsOpen}
        onClose={() => {
          setImportDocsOpen(false);
          loadDocuments();
        }}
        onImport={importService.importTypeDocuments}
        onDownloadTemplate={importService.downloadTypeDocumentTemplate}
        title="Importar tipos de documento"
        entity="type_documents"
      />
    </div>
  );
}
