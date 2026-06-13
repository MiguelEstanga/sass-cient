import styles from "./PageActions.module.css";

interface Props {
  children: React.ReactNode;
}

export function PageActions({ children }: Props) {
  return <div className={styles.actions}>{children}</div>;
}