"use client";

import { useState, useCallback } from "react";
import { userService } from "@/services/user.service";
import { useLocalCache } from "@/hooks/useLocalCache";
import { useTranslations } from "next-intl";
import type { Employee } from "@/types/user.types";
import styles from "./EmployeeSelector.module.css";

interface Props {
  value: Employee | null;
  onChange: (employee: Employee | null) => void;
}

export function EmployeeSelector({ value, onChange }: Props) {
  const t = useTranslations("pos");
  const [showDropdown, setShowDropdown] = useState(false);

  const fetcher = useCallback(
    (params: any) =>
      userService.getAll({ ...params, role: "employee" }),
    []
  );

  const { rows: employees, search, setSearch } = useLocalCache<Employee>(
    fetcher,
    { keyField: "id", blockSize: 500, pageSize: 10 }
  );

  return (
    <div className={styles.container}>
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
        <div
          className={styles.triggerBox}
          onClick={() => setShowDropdown(true)}
        >
          <span className={styles.triggerIcon}>👤</span>
          <span>{t("selectEmployee")}</span>
        </div>
      )}

      {showDropdown && !value && (
        <div className={styles.dropdown}>
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