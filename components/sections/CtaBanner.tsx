import type { Route } from "next";
import Link from "next/link";
import { PageSection } from "@/components/layout/PageSection";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type CtaBannerProps = {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
};

export function CtaBanner({ eyebrow, title, description, ctaLabel, ctaHref }: CtaBannerProps) {
  return (
    <PageSection>
      <div className="rounded-3xl border border-line bg-panel p-6 shadow-card sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-3xl">
            <Badge tone="gradient">{eyebrow}</Badge>
            <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight-2 sm:text-4xl">{title}</h2>
            <p className="mt-4 leading-7 text-text-secondary">{description}</p>
          </div>
          <Button asChild size="lg" className="w-full lg:w-auto">
            <Link href={ctaHref as Route}>{ctaLabel}</Link>
          </Button>
        </div>
      </div>
    </PageSection>
  );
}
