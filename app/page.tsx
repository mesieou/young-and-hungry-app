import { ArrowRight, Building2, Clock3, ReceiptText, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { LocationGrid } from "@/components/sections/LocationGrid";
import { HomeRouteQuoteForm } from "@/components/sections/HomeRouteQuoteForm";
import { ServiceGrid } from "@/components/sections/ServiceGrid";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { PublicStructuredData } from "@/components/seo/PublicStructuredData";
import { PageSection } from "@/components/layout/PageSection";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { IconBadge } from "@/components/ui/IconBadge";
import { homeFeatureCards, homeProcessSteps } from "@/lib/content/site-copy";
import { buildPublicPageMetadataById, requirePublicPageById } from "@/lib/seo/public-route-utils";

export const metadata = buildPublicPageMetadataById("home");

const homePage = requirePublicPageById("home");
const featureIcons: LucideIcon[] = [Clock3, Building2, ReceiptText];

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      <PublicStructuredData page={homePage} />

      <PageSection padding="hero" className="relative">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="animate-fade-up">
            <Badge tone="gradient">{homePage.heroEyebrow}</Badge>
            <h1 className="mt-7 max-w-4xl font-display text-4xl font-semibold tracking-tight-3 text-white sm:text-6xl lg:text-7xl">
              {homePage.heroTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-text-secondary">
              {homePage.heroDescription}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {homePage.highlights?.map((highlight) => (
                <Badge key={highlight}>{highlight}</Badge>
              ))}
            </div>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/quote">Start your estimate</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/pricing">
                  See pricing
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <Card className="animate-fade-up yh-gradient-border shadow-glow [animation-delay:120ms]">
            <CardContent className="p-6 sm:p-8">
              <HomeRouteQuoteForm />
            </CardContent>
          </Card>
        </div>
      </PageSection>

      <TrustStrip />

      <PageSection>
        <div>
          <div className="max-w-3xl">
            <Badge>Why Young & Hungry</Badge>
            <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight-2 sm:text-4xl">
              Better fit for the Melbourne moves that are easy to describe badly.
            </h2>
            <p className="mt-5 leading-8 text-text-secondary">
              Smaller local moves, apartment jobs, furniture runs, and suburb-to-suburb routes often need more than a generic enquiry form. Young & Hungry keeps the estimate flow short, but still asks for the details that matter.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {homeFeatureCards.map((feature, index) => {
              const Icon = featureIcons[index] ?? ReceiptText;

              return (
                <Card key={feature.title} variant="interactive">
                  <CardContent className="p-6">
                    <IconBadge icon={Icon} shape="squircle" className="mb-5" />
                    <h3 className="font-display text-2xl font-semibold">{feature.title}</h3>
                    <p className="mt-3 leading-7 text-text-secondary">{feature.body}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </PageSection>

      <ServiceGrid />

      <LocationGrid limit={4} />

      <PageSection>
        <div className="rounded-2xl border border-line bg-panel p-6 shadow-card sm:p-10">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <Badge tone="gradient">How it works</Badge>
              <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight-2 sm:text-4xl">
                Fast estimate first. Real move details before the next step.
              </h2>
              <p className="mt-4 leading-7 text-text-secondary">
                The first version of Young & Hungry is built to help customers understand the move quickly, then give the team enough detail to confirm what happens next.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {homeProcessSteps.map((step, index) => (
                <div key={step} className="rounded-xl border border-line bg-navy p-5">
                  <p className="font-mono text-sm text-blue-soft">0{index + 1}</p>
                  <p className="mt-3 font-medium">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageSection>

      <PageSection>
        <div className="rounded-3xl border border-line bg-panel p-6 shadow-card sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-3xl">
              <Badge tone="gradient">Ready to move?</Badge>
              <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight-2 sm:text-4xl">
                Start with the route and get your Melbourne moving estimate moving.
              </h2>
              <p className="mt-4 leading-7 text-text-secondary">
                Best fit for small moves, apartment moves, furniture jobs, and other Melbourne suburb-to-suburb routes where clear pricing matters.
              </p>
            </div>
            <Button asChild size="lg" className="w-full lg:w-auto">
              <Link href="/quote">Start your estimate</Link>
            </Button>
          </div>
        </div>
      </PageSection>
    </div>
  );
}
