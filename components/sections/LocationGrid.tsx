import type { Route } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { PageSection } from "@/components/layout/PageSection";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { getPublicPagesByFamily } from "@/lib/seo/public-pages";

const locationPages = getPublicPagesByFamily("location");

export function LocationGrid({
  showIntro = false,
  limit
}: {
  showIntro?: boolean;
  limit?: number;
}) {
  const visibleLocations = typeof limit === "number" ? locationPages.slice(0, limit) : locationPages;

  return (
    <PageSection>
      <div>
        {showIntro ? (
          <div className="mb-10 max-w-3xl">
            <Badge tone="gradient">Melbourne suburbs</Badge>
            <h1 className="mt-5 font-display text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
              Local moving pages for the first Melbourne suburbs we want to win.
            </h1>
            <p className="mt-5 leading-8 text-text-secondary">
              Young & Hungry is starting with Melbourne suburbs where apartment access, traffic, parking, and short local routes have a real impact on the move.
            </p>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {visibleLocations.map((page) => (
            <Card key={page.id} className="transition duration-200 hover:-translate-y-1 hover:border-line-hover hover:shadow-lift">
              <CardContent className="p-6">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet/20 to-blue/20 text-blue-soft">
                  <MapPin className="h-6 w-6" />
                </div>
                <h2 className="font-display text-xl font-semibold">{page.label}</h2>
                <p className="mt-3 text-sm leading-6 text-text-secondary">{page.cardDescription}</p>
                <Button asChild variant="ghost" className="mt-5 px-0">
                    <Link href={page.canonicalPath as Route}>View suburb page</Link>
                  </Button>
                </CardContent>
              </Card>
          ))}
        </div>
      </div>
    </PageSection>
  );
}
