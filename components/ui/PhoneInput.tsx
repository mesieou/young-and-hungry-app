"use client";

import { Phone } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { normalizeAustralianPhone } from "@/lib/core/booking/quote-request";

type PhoneInputProps = {
  id: string;
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  onValueChange?: (value: string) => void;
};

function getInitialLocalValue(value: string) {
  const normalized = normalizeAustralianPhone(value);

  if (normalized?.startsWith("+61")) {
    return `0${normalized.slice(3)}`;
  }

  return value;
}

function getSubmittedPhone(value: string) {
  const trimmed = value.trim();

  if (!trimmed) return "";

  return normalizeAustralianPhone(trimmed) ?? trimmed;
}

export function PhoneInput({
  id,
  name,
  label,
  defaultValue = "",
  placeholder = "412 345 678",
  disabled = false,
  error,
  className,
  onValueChange
}: PhoneInputProps) {
  const [localValue, setLocalValue] = useState(getInitialLocalValue(defaultValue));
  const submittedPhone = getSubmittedPhone(localValue);

  function handleChange(nextValue: string) {
    setLocalValue(nextValue);
    onValueChange?.(getSubmittedPhone(nextValue));
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <label htmlFor={id} className="text-sm font-medium text-text-secondary">
        {label}
      </label>
      <input type="hidden" name={name} value={submittedPhone} />
      <div className="flex overflow-hidden rounded-2xl border border-line bg-ink/70 transition focus-within:border-blue focus-within:ring-4 focus-within:ring-blue/30">
        <div className="flex items-center gap-2 border-r border-line bg-ink/55 px-3 text-sm font-semibold text-text-secondary">
          <Phone className="h-4 w-4 text-text-muted" />
          +61
        </div>
        <input
          id={id}
          type="tel"
          value={localValue}
          onChange={(event) => handleChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          autoComplete="tel-national"
          className="min-w-0 flex-1 bg-transparent px-4 py-3 text-white outline-none placeholder:text-text-muted disabled:opacity-60"
        />
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-sm text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
