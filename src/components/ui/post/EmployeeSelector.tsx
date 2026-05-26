"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { userService } from "@/services/user.service";
import { useLocalCache } from "@/hooks/useLocalCache";
import { useTranslations } from "next-intl";
import type { Employee } from "@/types/user.types";
import type { FetchParams } from "@/hooks/useLocalCache";
import styles from "./EmployeeSelector.module.css";

interface Props {
  value: Employee | null;
  onChange: (employee: Employee | null) => void;
}

export function EmployeeSelector({ value, onChange }: Props) {
  const t = useTranslations("pos");
  const [showDropdown, setShowDropdown] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetcher = useCallback(
    (params: FetchParams) =>
      userService.getAll({ ...params, role: "employee" }),
    []
  );

  const { rows: employees, search, setSearch } = useLocalCache<Employee>(
    fetcher,
    { keyField: "id", blockSize: 500, pageSize: 8 }
  );

  // Detectar si hay espacio abajo o hay que abrir hacia arriba
  function handleOpen() {
    if (!containerRef.current) { setShowDropdown(true); return; }
    const rect = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setOpenUpward(spaceBelow < 260); // 260px = altura aprox del dropdown
    setShowDropdown(true);
  }

  // Cerrar al hacer click fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
        setSearch("");
      }
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown, setSearch]);

  return (
    <div className={styles.container} ref={containerRef}>

      {/* Box seleccionado o trigger */}
      {value ? (
        <div className={styles.selectedBox}>
          <div className={styles.avatar}>
            {value.name.charAt(0).toUpperCase()}
          </div>
          <div className={styles.selectedInfo}>
            <span className={styles.selectedName}>{value.name}</span>
            <span className={styles.selectedSub}>
              {value.phone || value.email || t("noContact")}
            </span>
          </div>
          <button
            className={styles.clearBtn}
            onClick={() => onChange(null)}
          >
            ✕
          </button>
        </div>
      ) : (
        <div className={styles.triggerBox} onClick={handleOpen}>
          <span className={styles.triggerIcon}>👤</span>
          <span>{t("selectEmployee")}</span>
        </div>
      )}

      {/* Dropdown — abre hacia arriba o abajo según espacio */}
      {showDropdown && !value && (
        <div
          className={styles.dropdown}
          style={openUpward
            ? { bottom: "calc(100% + 4px)", top: "auto" }
            : { top: "calc(100% + 4px)", bottom: "auto" }
          }
        >
          <div className={styles.dropdownSearch}>
            <input
              className={styles.searchInput}
              placeholder={t("searchEmployee")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className={styles.dropdownList}>
            {employees.length === 0 ? (
              <div className={styles.empty}>{t("noEmployees")}</div>
            ) : (
              employees.map((emp) => (
                <div
                  key={emp.id}
                  className={styles.dropdownItem}
                  onClick={() => {
                    onChange(emp);
                    setShowDropdown(false);
                    setSearch("");
                  }}
                >
                  <div className={styles.itemAvatar}>
                    {emp.name.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.itemInfo}>
                    <strong className={styles.itemName}>{emp.name}</strong>
                    <span className={styles.itemSub}>
                      {emp.phone || emp.email || t("noContact")}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}