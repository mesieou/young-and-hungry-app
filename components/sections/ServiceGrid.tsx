import { Building2, Home, PackageCheck, Truck, type LucideIcon } from "lucide-react";
import { PageSection } from "@/components/layout/PageSection";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";

const services: Array<[string, string, LucideIcon]> = [
  ["Small moves", "Single-item, studio, and short-distance jobs.", PackageCheck],
  ["Apartment moves", "Lift, stairs, parking, and access notes captured upfront.", Building2],
  ["House moves", "Larger blocks with deterministic duration and buffer rules.", Home],
  ["Delivery runs", "Scheduled point-to-point pickup and dropoff jobs.", Truck]
];

export function ServiceGrid({ showIntro = false }: { showIntro?: boolean }) {
  return (
    <PageSection>
      <div>
        {showIntro ? (
          <div className="mb-10 max-w-2xl">
            <Badge tone="gradient">Services</Badge>
            <h1 className="mt-5 font-display text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">Removalist services with platform discipline.</h1>
          </div>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {services.map(([title, body, Icon]) => (
            <Card key={String(title)} className="transition duration-200 hover:-translate-y-1 hover:border-line-hover hover:shadow-lift">
              <CardContent className="p-6">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet/20 to-blue/20 text-blue-soft">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="font-display text-xl font-semibold">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-text-secondary">{body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageSection>
  );
}
