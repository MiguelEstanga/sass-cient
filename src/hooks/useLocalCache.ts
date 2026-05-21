import { useState, useCallback, useRef } from "react";

interface CacheOptions<T> {
  /** Cuántos registros traer por bloque */
  blockSize?: number;
  /** Cuántos registros mostrar por página en la tabla */
  pageSize?: number;
  /** Campo único para deduplicar registros */
  keyField: keyof T;
}

export interface FetchParams {
  search?: string;
  page?: number;
  per_page?: number;
}

interface PaginatedResult<T> {
  data: T[];
  total: number;
  last_page: number;
  current_page: number;
  per_page: number;
}

interface UseLocalCacheReturn<T> {
  /** Registros de la página actual */
  rows: T[];
  /** Total real (local o del backend) */
  total: number;
  /** Página actual */
  page: number;
  /** Última página */
  lastPage: number;
  /** Está cargando del backend */
  loading: boolean;
  /** Término de búsqueda actual */
  search: string;
  /** Cambiar búsqueda */
  setSearch: (value: string) => void;
  /** Cambiar página */
  setPage: (page: number) => void;
  /** Forzar recarga desde el backend (después de crear/editar/borrar) */
  refresh: () => void;
}

export function useLocalCache<T>(
  fetcher: (params: FetchParams) => Promise<PaginatedResult<T>>,
  options: CacheOptions<T>
): UseLocalCacheReturn<T> {
  const { blockSize = 1500, pageSize = 10, keyField } = options;

  // Cache principal en memoria
  const cache = useRef<T[]>([]);
  // Total real del backend (para saber si hay más registros)
  const backendTotal = useRef<number>(0);
  // Si ya hicimos el fetch inicial
  const initialized = useRef(false);

  const [rows, setRows] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPageState] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearchState] = useState("");

  /**
   * Pagina localmente sobre el cache.
   */
  const paginateLocal = useCallback(
    (data: T[], currentPage: number, currentSearch: string) => {
      // Filtrar localmente si hay búsqueda
      const filtered = currentSearch
        ? data.filter((item) =>
            Object.values(item as Record<string, unknown>).some((val) =>
              String(val ?? "")
                .toLowerCase()
                .includes(currentSearch.toLowerCase())
            )
          )
        : data;

      const totalFiltered = filtered.length;
      const lp = Math.max(1, Math.ceil(totalFiltered / pageSize));
      const safePage = Math.min(currentPage, lp);
      const start = (safePage - 1) * pageSize;
      const pageRows = filtered.slice(start, start + pageSize);

      setRows(pageRows);
      setTotal(totalFiltered);
      setLastPage(lp);
      setPageState(safePage);
    },
    [pageSize]
  );

  /**
   * Fetch desde el backend y actualiza el cache.
   */
  const fetchFromBackend = useCallback(
    async (params: FetchParams, append = false) => {
      setLoading(true);
      try {
        const result = await fetcher({
          ...params,
          per_page: blockSize,
        });

        const newData = append
          ? deduplicateByKey(
              [...cache.current, ...result.data],
              keyField
            )
          : result.data;

        cache.current = newData;
        backendTotal.current = result.total;
        initialized.current = true;

        return newData;
      } finally {
        setLoading(false);
      }
    },
    [fetcher, blockSize, keyField]
  );

  /**
   * Carga inicial o refresh forzado.
   */
  const initialize = useCallback(async () => {
    const data = await fetchFromBackend({ page: 1 });
    paginateLocal(data, 1, "");
    setSearchState("");
    setPageState(1);
  }, [fetchFromBackend, paginateLocal]);

  // Carga inicial automática
  const isFirstRender = useRef(true);
  if (isFirstRender.current) {
    isFirstRender.current = false;
    initialize();
  }

  /**
   * Cambio de búsqueda.
   * 1. Busca en cache local primero.
   * 2. Si no hay resultados Y hay más datos en backend → fetch con search.
   */
  const setSearch = useCallback(
    async (value: string) => {
      setSearchState(value);
      setPageState(1);

      if (!value) {
        // Sin búsqueda: mostrar cache completo paginado
        paginateLocal(cache.current, 1, "");
        return;
      }

      // Buscar en cache local
      const localMatches = cache.current.filter((item) =>
        Object.values(item as Record<string, unknown>).some((val) =>
          String(val ?? "")
            .toLowerCase()
            .includes(value.toLowerCase())
        )
      );

      if (localMatches.length > 0) {
        // Hay resultados locales → mostrarlos sin fetch
        paginateLocal(cache.current, 1, value);
        return;
      }

      // No hay resultados locales y hay más datos en el backend → fetch
      const cachedCount = cache.current.length;
      const hasMoreInBackend = cachedCount < backendTotal.current;

      if (hasMoreInBackend) {
        const data = await fetchFromBackend({ search: value, page: 1 });
        paginateLocal(data, 1, value);
      } else {
        // No hay más datos → mostrar vacío
        paginateLocal(cache.current, 1, value);
      }
    },
    [cache, backendTotal, fetchFromBackend, paginateLocal]
  );

  /**
   * Cambio de página.
   * Si estamos en la última página y hay más datos en backend → fetch del siguiente bloque.
   */
  const setPage = useCallback(
    async (newPage: number) => {
      const isLastPage = newPage >= lastPage;
      const hasMoreInBackend = cache.current.length < backendTotal.current;

      if (isLastPage && hasMoreInBackend && !search) {
        // Última página y hay más en backend → traer siguiente bloque
        const nextBackendPage =
          Math.floor(cache.current.length / blockSize) + 1;

        const data = await fetchFromBackend(
          { page: nextBackendPage },
          true // append = true → concatenar al cache
        );
        paginateLocal(data, newPage, search);
      } else {
        // Paginar sobre el cache actual
        paginateLocal(cache.current, newPage, search);
      }
    },
    [lastPage, cache, backendTotal, search, blockSize, fetchFromBackend, paginateLocal]
  );

  /**
   * Forzar recarga completa desde el backend.
   * Úsalo después de crear, editar o eliminar un registro.
   */
  const refresh = useCallback(() => {
    cache.current = [];
    backendTotal.current = 0;
    initialized.current = false;
    initialize();
  }, [initialize]);

  return {
    rows,
    total,
    page,
    lastPage,
    loading,
    search,
    setSearch,
    setPage,
    refresh,
  };
}

/**
 * Elimina duplicados por keyField al hacer append al cache.
 */
function deduplicateByKey<T>(data: T[], key: keyof T): T[] {
  const seen = new Set<unknown>();
  return data.filter((item) => {
    const k = item[key];
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}