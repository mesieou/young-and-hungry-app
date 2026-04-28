import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const cardVariants = cva("border border-line bg-panel shadow-card", {
  variants: {
    variant: {
      default: "",
      interactive:
        "transition duration-200 hover:-translate-y-1 hover:border-line-hover hover:shadow-lift"
    },
    radius: {
      default: "rounded-lg",
      lg: "rounded-2xl",
      xl: "rounded-3xl"
    }
  },
  defaultVariants: {
    variant: "default",
    radius: "default"
  }
});

type CardProps = HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>;

export function Card({ className, variant, radius, ...props }: CardProps) {
  return <div className={cn(cardVariants({ variant, radius }), className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6", className)} {...props} />;
}
