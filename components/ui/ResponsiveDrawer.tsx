"use client";

import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type ResponsiveDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  side?: "right" | "bottom";
  className?: string;
  children: ReactNode;
};

export function ResponsiveDrawer({
  open,
  onOpenChange,
  title,
  description,
  side = "right",
  className,
  children
}: ResponsiveDrawerProps) {
  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onOpenChange, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70]" aria-hidden={false}>
      <button
        type="button"
        aria-label={`Close ${title}`}
        className="absolute inset-0 bg-ink/85 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "absolute border-line bg-panel shadow-lift",
          side === "right"
            ? "right-0 top-0 h-full w-full max-w-sm border-l"
            : "bottom-0 left-0 right-0 max-h-[85vh] overflow-hidden rounded-t-[2rem] border-t",
          className
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="font-display text-2xl font-semibold tracking-tight-2 text-white">{title}</p>
            {description ? <p className="mt-1 text-sm leading-6 text-text-secondary">{description}</p> : null}
          </div>
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-ink/70 text-text-secondary transition hover:border-line-hover hover:text-white"
            aria-label={`Close ${title}`}
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[calc(85vh-5.5rem)] overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
      </div>
    </div>
  );
}
