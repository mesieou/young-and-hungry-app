import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

const iconBadgeVariants = cva(
  "inline-flex shrink-0 items-center justify-center",
  {
    variants: {
      variant: {
        soft: "bg-gradient-to-br from-violet/20 to-blue/20 text-blue-soft",
        filled: "bg-gradient-to-br from-violet to-blue text-white shadow-glow",
        violet: "bg-violet/12 text-violet-soft",
        success: "bg-success/10 text-success shadow-glow"
      },
      size: {
        sm: "h-9 w-9",
        md: "h-11 w-11",
        lg: "h-12 w-12",
        xl: "h-16 w-16"
      },
      shape: {
        square: "rounded-2xl",
        squircle: "rounded-xl"
      }
    },
    defaultVariants: {
      variant: "soft",
      size: "md",
      shape: "square"
    }
  }
);

const iconSizeMap = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-5 w-5",
  xl: "h-9 w-9"
} as const;

type IconBadgeProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof iconBadgeVariants> & {
    icon: LucideIcon;
  };

export function IconBadge({ className, variant, size, shape, icon: Icon, ...props }: IconBadgeProps) {
  return (
    <span className={cn(iconBadgeVariants({ variant, size, shape }), className)} {...props}>
      <Icon className={iconSizeMap[size ?? "md"]} aria-hidden="true" />
    </span>
  );
}
