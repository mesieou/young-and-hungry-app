import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

const widths = {
  compact: "max-w-4xl",
  narrow: "max-w-5xl",
  default: "max-w-7xl",
  full: "max-w-none"
} as const;

type SiteContainerProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  width?: keyof typeof widths;
  children: ReactNode;
};

export function SiteContainer({
  as: Component = "div",
  width = "default",
  className,
  children,
  ...props
}: SiteContainerProps) {
  return (
    <Component className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", widths[width], className)} {...props}>
      {children}
    </Component>
  );
}
