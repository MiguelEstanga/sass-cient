"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/lib/i18n/routing";
import { useAuthStore } from "@/stores/auth.store";
import { storage, storageName } from "@/lib/utils/storage";
import styles from "./AuthGuard.module.css";

interface Props {
  children: React.ReactNode;
}

export function AuthGuard({ children }: Props) {
  const router = useRouter();
  const { isAuthenticated, logout, _hasHydrated } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Esperar a que Zustand rehidrate desde localStorage
    if (!_hasHydrated) return;

    const token = storage.get<string>(storageName.token);

    if (!token || !isAuthenticated) {
      logout();
      router.replace("/login");
      return;
    }

    setReady(true);
  }, [_hasHydrated, isAuthenticated, logout, router]);

  // Mientras rehidrata o verifica → mostrar skeleton
  if (!ready) return <AuthGuardSkeleton />;

  return <>{children}</>;
}

function AuthGuardSkeleton() {
  return (
    <div className={styles.skeleton}>
      <div className={styles.skeletonSidebar} />
      <div className={styles.skeletonContent}>
        <div className={styles.skeletonHeader} />
        <div className={styles.skeletonBody}>
          <div className={styles.skeletonTitle} />
          <div className={styles.skeletonCard} />
          <div className={styles.skeletonCard} />
          <div className={styles.skeletonCard} />
        </div>
      </div>
    </div>
  );
}