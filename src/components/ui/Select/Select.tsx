"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils/cn";
import styles from "./Select.module.css";

export interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, fullWidth, className, id, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;

    return (
      <div className={cn(styles.wrapper, fullWidth && styles.fullWidth)}>
        {label && (
          <label htmlFor={selectId} className={styles.label}>
            {label}
            {props.required && <span className={styles.required}>*</span>}
          </label>
        )}
        <div className={cn(styles.selectWrapper, error && styles.hasError)}>
          <select
            id={selectId}
            ref={ref}
            className={cn(styles.select, className)}
            {...props}
            
          >
            {placeholder && (
              <option value="">{placeholder}</option>
            )}
            {options.map((opt) => (
              <option 
                
                key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className={styles.arrow}>▾</span>
        </div>
        {error && <p className={styles.error}>{error}</p>}
        {!error && hint && <p className={styles.hint}>{hint}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";