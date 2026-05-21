import { cn } from "@/lib/utils/cn";
import styles from "./Badge.module.css";

export type BadgeVariant = "success" | "error" | "warning" | "info" | "default";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span className={cn(styles.badge, styles[variant], className)}  style={{ minWidth: '80px', justifyContent: 'center' }}>
      {children}
    </span>
  );
}