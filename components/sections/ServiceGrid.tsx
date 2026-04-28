import type { Route } from "next";
import Link from "next/link";
import { Building2, PackageCheck, Sofa, Truck } from "lucide-react";
import { PageSection } from "@/components/layout/PageSection";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { IconBadge } from "@/components/ui/IconBadge";
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
            <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight-3 sm:text-5xl">
              Moving services for the Melbourne jobs Young & Hungry is built to win first.
            </h1>
            <p className="mt-5 leading-8 text-text-secondary">
              The strongest first fit is small moves, apartment moves, furniture jobs, same-day requests, and other suburb-to-suburb work where route and access clarity matter.
            </p>
          </div>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {servicePages.map((page, index) => {
            const Icon = serviceIcons[index] ?? Truck;

            return (
              <Card key={page.id} variant="interactive">
                <CardContent className="p-6">
                  <IconBadge icon={Icon} shape="squircle" className="mb-5" />
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
