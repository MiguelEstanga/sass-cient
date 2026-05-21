import styles from "./Table.module.css";

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  width?: string;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  emptyText?: string;
  offset?: number;
}

export function Table<T>({
  columns,
  data,
  keyField,
  emptyText = "No se encontraron resultados.",
  offset = 0,
}: Props<T>) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th style={{ width: 48 }}>#</th>
            {columns.map((col) => (
              <th key={col.key} style={{ width: col.width }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className={styles.empty}>
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr key={String(row[keyField])}>
                <td className={styles.rowNumber}>{offset + index + 1}</td>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render
                      ? col.render(row)
                      : String(
                          (row as Record<string, unknown>)[col.key] ?? ""
                        )}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export type { Column };