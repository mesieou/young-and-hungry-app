import { Building2, Clock3, ReceiptText, type LucideIcon } from "lucide-react";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { HeroSection } from "@/components/sections/HeroSection";
import { HomeRouteQuoteForm } from "@/components/sections/HomeRouteQuoteForm";
import { IntroFeatureCards, type IntroFeatureCardItem } from "@/components/sections/IntroFeatureCards";
import { LocationGrid } from "@/components/sections/LocationGrid";
import { ServiceGrid } from "@/components/sections/ServiceGrid";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { PublicStructuredData } from "@/components/seo/PublicStructuredData";
import { PageSection } from "@/components/layout/PageSection";
import { Badge } from "@/components/ui/Badge";
import { homeFeatureCards, homeProcessSteps } from "@/lib/content/site-copy";
import { buildPublicPageMetadataById, requirePublicPageById } from "@/lib/seo/public-route-utils";

export const metadata = buildPublicPageMetadataById("home");

const homePage = requirePublicPageById("home");
const featureIcons: LucideIcon[] = [Clock3, Building2, ReceiptText];

const features: IntroFeatureCardItem[] = homeFeatureCards.map((feature, index) => ({
  icon: featureIcons[index] ?? ReceiptText,
  title: feature.title,
  body: feature.body
}));

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      <PublicStructuredData page={homePage} />

      <HeroSection
        eyebrow={homePage.heroEyebrow}
        title={homePage.heroTitle}
        description={homePage.heroDescription}
        highlights={homePage.highlights}
        primaryCta={{ label: "Start your estimate", href: "/quote" }}
        secondaryCta={{ label: "See pricing", href: "/pricing", variant: "secondary", icon: true }}
        sideCard={<HomeRouteQuoteForm />}
      />

      <TrustStrip />

      <IntroFeatureCards
        eyebrow="Why Young & Hungry"
        title="Better fit for the Melbourne moves that are easy to describe badly."
        description="Smaller local moves, apartment jobs, furniture runs, and suburb-to-suburb routes often need more than a generic enquiry form. Young & Hungry keeps the estimate flow short, but still asks for the details that matter."
        features={features}
      />

      <ServiceGrid />

      <LocationGrid limit={4} />

      <PageSection>
        <div className="rounded-2xl border border-line bg-panel p-6 shadow-card sm:p-10">
          <div className="grid gap-6 lg:grid-cols-split-form lg:items-center lg:gap-10">
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

      <CtaBanner
        eyebrow="Ready to move?"
        title="Start with the route and get your Melbourne moving estimate moving."
        description="Best fit for small moves, apartment moves, furniture jobs, and other Melbourne suburb-to-suburb routes where clear pricing matters."
        ctaLabel="Start your estimate"
        ctaHref="/quote"
      />
    </div>
  );
}
