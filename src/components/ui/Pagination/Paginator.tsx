"use client";

 
import { getPageNumbers } from "@/helpers/getPageNumbers";
import { Icon } from "@/helpers/icons";
import styles from "./Pagination.module.css";
interface Props {
  page: number;
  lastPage: number;
  total: number;
  pageSize: number;
  offset?: number;
  loading?: boolean;
  onChange: (page: number) => void;
}

export function Paginator({
  page,
  lastPage,
  total,
  pageSize,
  offset = 0,
  loading,
  onChange,
}: Props) {
  if (lastPage <= 1) return null;

  const from = offset + (page - 1) * pageSize + 1;
  const to = Math.min(offset + page * pageSize, total);

  return (
    <div className={styles.pagination}>
      <span className={styles.info}>
        {from}–{to} de {total}
      </span>

      <button
        className={[
          styles.btn,
          page === 1 || loading ? styles.disabled : "",
        ].join(" ")}
        onClick={() => onChange(page - 1)}
        disabled={page === 1 || loading}
      >
        <Icon name="chevronLeft" size={14} />
      </button>

      {getPageNumbers(page, lastPage).map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className={styles.dots}>
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(Number(p))}
            className={[
              styles.btn,
              page === p ? styles.btnActive : "",
            ].join(" ")}
            disabled={loading}
          >
            {p}
          </button>
        )
      )}

      <button
        className={[
          styles.btn,
          page === lastPage || loading ? styles.disabled : "",
        ].join(" ")}
        onClick={() => onChange(page + 1)}
        disabled={page === lastPage || loading}
      >
        <Icon name="chevronRight" size={14} />
      </button>
    </div>
  );
}