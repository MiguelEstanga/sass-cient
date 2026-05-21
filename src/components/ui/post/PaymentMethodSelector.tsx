"use client";

import styles from "./PaymentMethodSelector.module.css";

interface Props {
  value: string;
  onChange: (method: string) => void;
}

const methods = [
  { id: 'cash', label: 'Efectivo', icon: '💵' },
  { id: 'card', label: 'Tarjeta', icon: '💳' },
  { id: 'transfer', label: 'Transferencia', icon: '🏦' },
];

export function PaymentMethodSelector({ value, onChange }: Props) {
  return (
    <div className={styles.container}>
      {methods.map((method) => (
        <button
          key={method.id}
          type="button"
          className={`${styles.btn} ${value === method.id ? styles.active : ''}`}
          onClick={() => onChange(method.id)}
        >
          <span className={styles.icon}>{method.icon}</span>
          {method.label}
        </button>
      ))}
    </div>
  );
}