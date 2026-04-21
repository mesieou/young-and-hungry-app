import { ArrowRight, Clock3, ShieldCheck, Sparkles, Truck, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ServiceGrid } from "@/components/sections/ServiceGrid";
import { TrustStrip } from "@/components/sections/TrustStrip";

const processSteps = [
  "Tell us what is moving",
  "Get a clear quote",
  "Lock the slot with a deposit",
  "Track the job to completion"
];

const platformFeatures: Array<[string, string, LucideIcon]> = [
  ["Deterministic availability", "Every bookable job occupies normalized 15-minute buckets.", Clock3],
  ["Deposit-backed bookings", "A slot is reserved before payment and confirmed only while the hold is valid.", ShieldCheck],
  ["Operational visibility", "Failures create structured diagnostics instead of silent manual cleanup.", Sparkles]
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
              Young & Hungry turns moving enquiries into priced, scheduled, deposit-backed jobs. No directory chaos, no vague callbacks, no double booking.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/quote">
                  Start a quote <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/how-it-works">See how it works</Link>
              </Button>
            </div>
          </div>

          <Card className="animate-fade-up yh-gradient-border shadow-glow [animation-delay:120ms]">
            <CardContent className="p-6 sm:p-8">
              <div className="rounded-2xl border border-line bg-ink/60 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.3em] text-text-muted">Live job block</p>
                    <h2 className="mt-2 font-display text-3xl font-semibold">Apartment move</h2>
                  </div>
                  <div className="rounded-2xl bg-gradient-to-br from-violet to-blue p-3 shadow-glow">
                    <Truck className="h-7 w-7" />
                  </div>
                </div>
                <div className="mt-8 grid gap-3">
                  {[
                    ["Pickup", "South Yarra", "09:00"],
                    ["Dropoff", "Richmond", "10:20"],
                    ["Crew", "Verified team", "2 people"],
                    ["Status", "Deposit pending", "15 min hold"]
                  ].map(([label, value, meta]) => (
                    <div key={label} className="flex items-center justify-between rounded-xl border border-line bg-navy px-4 py-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-text-muted">{label}</p>
                        <p className="mt-1 font-medium text-white">{value}</p>
                      </div>
                      <p className="font-mono text-sm text-blue-soft">{meta}</p>
                    </div>
                  ))}
                </div>
              </div>
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
              <h2 className="mt-5 font-display text-4xl font-semibold tracking-[-0.04em]">Quote now. Book correctly next.</h2>
              <p className="mt-4 leading-7 text-text-secondary">
                The frontend starts with lead capture and quote requests. The critical booking core is already shaped around Postgres RPCs so payment and availability can be added without rewriting the foundation.
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
