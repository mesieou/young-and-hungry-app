import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "muted" | "gradient" | "success";
};

export function Badge({ className, tone = "muted", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 font-mono text-xs font-medium uppercase tracking-[0.18em]",
        tone === "muted" && "border border-line bg-panel text-text-secondary",
        tone === "gradient" && "bg-gradient-to-r from-violet/25 to-blue/25 text-blue-soft ring-1 ring-blue/20",
        tone === "success" && "bg-success/10 text-success ring-1 ring-success/20",
        className
      )}
      {...props}
    />
  );
}
