import { cn } from "@/lib/utils/cn";
import styles from "./Skeleton.module.css";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  rounded?: boolean;
}

export function Skeleton({ width, height, className, rounded }: SkeletonProps) {
  return (
    <span
      className={cn(styles.skeleton, rounded && styles.rounded, className)}
      style={{ width, height }}
    />
  );
}

export function SkeletonRow() {
  return (
    <div className={styles.row}>
      <Skeleton width="40%" height={16} />
      <Skeleton width="25%" height={16} />
      <Skeleton width="20%" height={16} />
      <Skeleton width={60} height={24} rounded />
    </div>
  );
}