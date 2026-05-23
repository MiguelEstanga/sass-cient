"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { Icon } from "@/helpers/icons";
import styles from "./DropdownMenu.module.css";

export interface DropdownMenuItem {
  label:     string;
  icon?:     React.ReactNode;
  onClick:   () => void;
  variant?:  "default" | "danger" | "success";
  disabled?: boolean;
  loading?:  boolean;
  divider?:  boolean; // ← separador visual
}

interface Props {
  items:    DropdownMenuItem[];
  trigger?: React.ReactNode;
}

export function DropdownMenu({ items, trigger }: Props) {
  const [open, setOpen]             = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef                = useRef<HTMLDivElement>(null);

  function handleOpen() {
    if (!containerRef.current) { setOpen(true); return; }
    const rect       = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setOpenUpward(spaceBelow < 220);
    setOpen(true);
  }

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className={styles.container} ref={containerRef}>

      {/* Trigger — MoreVertical por defecto */}
      <button
        className={styles.trigger}
        onClick={open ? () => setOpen(false) : handleOpen}
        aria-label="Acciones"
      >
        {trigger ?? <Icon name="moreVertical" size={16} />}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className={styles.menu}
          style={
            openUpward
              ? { bottom: "calc(100% + 4px)", top: "auto" }
              : { top:    "calc(100% + 4px)", bottom: "auto" }
          }
        >
          {items.map((item, i) => {
            // Separador visual
            if (item.divider) {
              return <div key={i} className={styles.divider} />;
            }

            return (
              <button
                key={i}
                className={cn(
                  styles.item,
                  item.variant === "danger"  && styles.itemDanger,
                  item.variant === "success" && styles.itemSuccess,
                  item.disabled              && styles.itemDisabled,
                )}
                disabled={item.disabled || item.loading}
                onClick={() => {
                  if (!item.disabled && !item.loading) {
                    item.onClick();
                    setOpen(false);
                  }
                }}
              >
                {/* Spinner si está cargando, ícono si tiene, nada si no */}
                {item.loading ? (
                  <Icon name="loader" size={14} className={styles.spin} />
                ) : item.icon ? (
                  <span className={styles.itemIcon}>{item.icon}</span>
                ) : null}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}