import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

type StepShellProps = {
  sidebar: ReactNode;
  mobileAccessory?: ReactNode;
  footer: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function StepShell({ sidebar, mobileAccessory, footer, children, className, contentClassName }: StepShellProps) {
  return (
    <Card className={cn("overflow-clip rounded-3xl border-line bg-panel shadow-card", className)}>
      <CardContent className="p-0">
        <div className="grid min-h-0 lg:grid-cols-[22rem_minmax(0,1fr)] xl:grid-cols-sidebar-form">
          <div className="hidden lg:block">{sidebar}</div>
          <div className="flex min-h-0 min-w-0 flex-col bg-panel">
            {mobileAccessory ? <div className="border-b border-line bg-panel/95 p-4 backdrop-blur lg:hidden">{mobileAccessory}</div> : null}
            <main className={cn("min-w-0 flex-1 p-5 sm:p-8 lg:p-12", contentClassName)}>{children}</main>
            <div className="border-t border-line bg-panel/95 p-5 backdrop-blur lg:px-12">{footer}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
