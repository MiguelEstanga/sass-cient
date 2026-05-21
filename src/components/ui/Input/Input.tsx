"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils/cn";
import styles from "./Input.module.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      fullWidth,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className={cn(styles.wrapper, fullWidth && styles.fullWidth)}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
            {props.required && <span className={styles.required}>*</span>}
          </label>
        )}

        <div className={cn(styles.inputWrapper, error && styles.hasError)}>
          {leftIcon && (
            <span className={styles.leftIcon}>{leftIcon}</span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              styles.input,
              leftIcon && styles.withLeftIcon,
              rightIcon && styles.withRightIcon,
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className={styles.rightIcon}>{rightIcon}</span>
          )}
        </div>

        {error && <p className={styles.error}>{error}</p>}
        {!error && hint && <p className={styles.hint}>{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";