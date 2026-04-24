import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { SiteContainer } from "@/components/layout/SiteContainer";

const paddingVariants = {
  compact: "py-8 sm:py-12",
  default: "py-16 sm:py-20",
  hero: "py-14 sm:py-20 lg:py-24"
} as const;

type PageSectionProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  width?: "compact" | "narrow" | "default" | "full";
  padding?: keyof typeof paddingVariants;
  containerClassName?: string;
  children: ReactNode;
};

export function PageSection({
  as: Component = "section",
  width = "default",
  padding = "default",
  className,
  containerClassName,
  children,
  ...props
}: PageSectionProps) {
  return (
    <Component className={cn(paddingVariants[padding], className)} {...props}>
      <SiteContainer width={width} className={containerClassName}>
        {children}
      </SiteContainer>
    </Component>
  );
}
