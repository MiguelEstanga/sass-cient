"use client";

import { useState } from "react";
import styles from "./InterestSlider.module.css";

interface Props {
  value: number;
  onChange: (value: number) => void;
}

export function InterestSlider({ value, onChange }: Props) {
  // Para mostrar el valor mientras se arrastra sin afectar el formulario hasta soltar
  const [localValue, setLocalValue] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setLocalValue(val);
    onChange(val);
  };

  // Calcular color dinámico (verde a rojo)
  const getColor = () => {
    if (localValue <= 20) return "var(--color-success)";
    if (localValue <= 50) return "var(--color-warning)";
    return "var(--color-error)";
  };

  return (
    <div className={styles.container}>
      <label className={styles.label}>Tasa de Interés (%)</label>
      
      <div className={styles.display}>
        <span className={styles.value} style={{ color: getColor() }}>
          {localValue}%
        </span>
      </div>

      <div className={styles.sliderWrapper}>
        <input
          type="range"
          min="1"
          max="100"
          value={localValue}
          onChange={handleChange}
          className={styles.slider}
          style={{
            background: `linear-gradient(to right, ${getColor()} 0%, ${getColor()} ${localValue}%, var(--color-border) ${localValue}%, var(--color-border) 100%)`
          }}
        />
        <div className={styles.labels}>
          <span>1%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}