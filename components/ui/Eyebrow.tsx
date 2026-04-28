import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const eyebrowVariants = cva("font-mono font-semibold uppercase", {
  variants: {
    tone: {
      "blue-soft": "text-blue-soft",
      muted: "text-text-muted",
      secondary: "text-text-secondary"
    },
    size: {
      sm: "text-[11px] tracking-eyebrow-sm",
      md: "text-xs tracking-eyebrow-md",
      lg: "text-xs tracking-eyebrow-lg"
    }
  },
  defaultVariants: {
    tone: "blue-soft",
    size: "md"
  }
});

type EyebrowProps = HTMLAttributes<HTMLParagraphElement> & VariantProps<typeof eyebrowVariants>;

export function Eyebrow({ className, tone, size, ...props }: EyebrowProps) {
  return <p className={cn(eyebrowVariants({ tone, size }), className)} {...props} />;
}
