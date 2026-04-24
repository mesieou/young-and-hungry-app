import type { Route } from "next";
import Link from "next/link";
import { Building2, PackageCheck, Sofa, Truck } from "lucide-react";
import { PageSection } from "@/components/layout/PageSection";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { getPublicPagesByFamily } from "@/lib/seo/public-pages";

const servicePages = getPublicPagesByFamily("service");
const serviceIcons = [PackageCheck, Building2, Sofa, Truck, Truck] as const;

export function ServiceGrid({ showIntro = false }: { showIntro?: boolean }) {
  return (
    <PageSection>
      <div>
        {showIntro ? (
          <div className="mb-10 max-w-3xl">
            <Badge tone="gradient">Services</Badge>
            <h1 className="mt-5 font-display text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
              Moving services for the Melbourne jobs Young & Hungry is built to win first.
            </h1>
            <p className="mt-5 leading-8 text-text-secondary">
              The strongest first fit is small moves, apartment moves, furniture jobs, same-day requests, and other suburb-to-suburb work where route and access clarity matter.
            </p>
          </div>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {servicePages.map((page, index) => {
            const Icon = serviceIcons[index] ?? Truck;

            return (
              <Card key={page.id} className="transition duration-200 hover:-translate-y-1 hover:border-line-hover hover:shadow-lift">
                <CardContent className="p-6">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet/20 to-blue/20 text-blue-soft">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h2 className="font-display text-xl font-semibold">{page.label}</h2>
                  <p className="mt-3 text-sm leading-6 text-text-secondary">{page.cardDescription}</p>
                  <Button asChild variant="ghost" className="mt-5 px-0">
                    <Link href={page.canonicalPath as Route}>View service page</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </PageSection>
  );
}
