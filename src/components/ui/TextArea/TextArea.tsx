"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils/cn";
import styles from "./TextArea.module.css";

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, hint, fullWidth, className, id, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;

    return (
      <div className={cn(styles.wrapper, fullWidth && styles.fullWidth)}>
        {label && (
          <label htmlFor={textareaId} className={styles.label}>
            {label}
            {props.required && <span className={styles.required}>*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            styles.textarea,
            error && styles.hasError,
            className
          )}
          {...props}
        />
        {error && <p className={styles.error}>{error}</p>}
        {!error && hint && <p className={styles.hint}>{hint}</p>}
      </div>
    );
  }
);

TextArea.displayName = "TextArea";