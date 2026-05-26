"use client";

import { useUiStore } from "@/stores/ui.store";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { cn } from "@/lib/utils/cn";
import styles from "./DashboardLayout.module.css";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useUiStore();

  return (
    <div className={styles.root} data-theme="dark"> {/* ← dark mode */}
      <Sidebar />
      <div
        className={cn(
          styles.main,
          sidebarCollapsed && styles.mainCollapsed
        )}
      >
        <Header />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}