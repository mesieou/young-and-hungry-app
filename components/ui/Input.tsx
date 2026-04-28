import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export const inputShellClasses =
  "w-full min-w-0 rounded-2xl border border-line bg-ink/70 px-4 py-4 text-white outline-none transition placeholder:text-text-muted focus:border-blue focus:ring-4 focus:ring-blue/30 disabled:opacity-60";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  name: string;
  label?: string;
  error?: string;
  hint?: string;
  leadingIcon?: ReactNode;
  containerClassName?: string;
};

export function Input({
  id,
  name,
  label,
  error,
  hint,
  leadingIcon,
  className,
  containerClassName,
  ...props
}: InputProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={cn("grid gap-2", containerClassName)}>
      {label ? (
        <label htmlFor={id} className="text-sm font-medium text-text-secondary">
          {label}
        </label>
      ) : null}
      <div className="relative">
        {leadingIcon ? (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
            {leadingIcon}
          </span>
        ) : null}
        <input
          id={id}
          name={name}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(inputShellClasses, leadingIcon && "pl-11", className)}
          {...props}
        />
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-sm text-error">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
