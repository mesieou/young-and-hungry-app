import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { PageSection } from "@/components/layout/PageSection";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

type HeroCta = {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
  icon?: boolean;
};

type HeroSectionProps = {
  eyebrow: string;
  title: string;
  description: string;
  highlights?: readonly string[];
  primaryCta: HeroCta;
  secondaryCta?: HeroCta;
  sideCard?: ReactNode;
};

export function HeroSection({
  eyebrow,
  title,
  description,
  highlights,
  primaryCta,
  secondaryCta,
  sideCard
}: HeroSectionProps) {
  return (
    <PageSection padding="hero" className="relative">
      <div className="grid gap-8 lg:grid-cols-split-hero lg:items-center lg:gap-12">
        <div className="animate-fade-up">
          <Badge tone="gradient">{eyebrow}</Badge>
          <h1 className="mt-7 max-w-4xl font-display text-4xl font-semibold tracking-tight-3 text-white sm:text-6xl lg:text-7xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-text-secondary">{description}</p>
          {highlights?.length ? (
            <div className="mt-6 flex flex-wrap gap-3">
              {highlights.map((highlight) => (
                <Badge key={highlight}>{highlight}</Badge>
              ))}
            </div>
          ) : null}
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <HeroCtaButton cta={primaryCta} />
            {secondaryCta ? <HeroCtaButton cta={secondaryCta} /> : null}
          </div>
        </div>

        {sideCard ? (
          <Card className="animate-fade-up yh-gradient-border shadow-glow [animation-delay:120ms]">
            <CardContent className="p-6 sm:p-8">{sideCard}</CardContent>
          </Card>
        ) : null}
      </div>
    </PageSection>
  );
}

function HeroCtaButton({ cta }: { cta: HeroCta }) {
  return (
    <Button asChild size="lg" variant={cta.variant ?? "primary"}>
      <Link href={cta.href as Route}>
        {cta.label}
        {cta.icon ? <ArrowRight className="h-4 w-4" /> : null}
      </Link>
    </Button>
  );
}
