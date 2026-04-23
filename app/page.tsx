import { ArrowRight, Clock3, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { HomeRouteQuoteForm } from "@/components/sections/HomeRouteQuoteForm";
import { ServiceGrid } from "@/components/sections/ServiceGrid";
import { TrustStrip } from "@/components/sections/TrustStrip";

const processSteps = [
  "Tell us what is moving",
  "Ops reviews the job details",
  "Receive a clear quote",
  "Confirm the job directly"
];

const platformFeatures: Array<[string, string, LucideIcon]> = [
  ["Structured quote intake", "Every enquiry captures the details ops need to price and schedule the job.", Clock3],
  ["Ops-reviewed quotes", "Young & Hungry reviews the move before confirming timing, pricing, and next steps.", ShieldCheck],
  ["Operational visibility", "Quote requests are stored in Supabase and sent to ops by email for follow-up.", Sparkles]
];

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      <section className="relative px-6 py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="animate-fade-up">
            <Badge tone="gradient">Removalist execution platform</Badge>
            <h1 className="mt-7 max-w-4xl font-display text-5xl font-semibold tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
              Moving jobs booked with{" "}
              <span className="yh-gradient-text">real-time clarity.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-text-secondary">
              Young & Hungry turns moving enquiries into structured quote requests that can be reviewed, priced, and confirmed without directory chaos.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="secondary" size="lg">
                <Link href="/how-it-works">See how it works</Link>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <Link href="/pricing">
                  View pricing logic <ArrowRight className="h-4 w-4" />
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
      </section>

      <TrustStrip />

      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <Badge>Built for execution</Badge>
            <h2 className="mt-5 font-display text-4xl font-semibold tracking-[-0.04em]">Not a mover directory. A booking system for physical jobs.</h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {platformFeatures.map(([title, body, Icon]) => (
              <Card key={String(title)} className="transition duration-200 hover:-translate-y-1 hover:border-line-hover hover:shadow-lift">
                <CardContent className="p-6">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet/20 to-blue/20 text-blue-soft">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-2xl font-semibold">{title}</h3>
                  <p className="mt-3 leading-7 text-text-secondary">{body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <ServiceGrid />

      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl rounded-2xl border border-line bg-panel p-6 shadow-card sm:p-10">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <Badge tone="gradient">MVP path</Badge>
              <h2 className="mt-5 font-display text-4xl font-semibold tracking-[-0.04em]">Quote now. Confirm cleanly next.</h2>
              <p className="mt-4 leading-7 text-text-secondary">
                The frontend starts with lead capture and quote-review emails. The critical booking core stays ready for availability and payment later without making deposit checkout part of the first MVP.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {processSteps.map((step, index) => (
                <div key={step} className="rounded-xl border border-line bg-navy p-5">
                  <p className="font-mono text-sm text-blue-soft">0{index + 1}</p>
                  <p className="mt-3 font-medium">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
