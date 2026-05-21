"use client";

import styles from "./SlidePanel.module.css";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function SlidePanel({ open, onClose, title, children }: Props) {
  return (
    <>
      {/* Overlay oscuro */}
      <div 
        className={`${styles.overlay} ${open ? styles.overlayVisible : ""}`} 
        onClick={onClose} 
      />
      
      {/* Panel que se desliza */}
      <div 
        className={`${styles.panel} ${open ? styles.panelVisible : ""}`}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </>
  );
}