import type { Metadata } from "next";
import Link from "next/link";
import { PageSection } from "@/components/layout/PageSection";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Transparent removalist pricing through ops-reviewed quote requests."
};

export default function PricingPage() {
  const pricingRules = [
    ["Free pickup travel", "The first hour from base to pickup is included."],
    ["Charged route", "Estimate includes pickup to dropoff and return to base."],
    ["Half-hour billing", "Total time rounds up to the next half-hour block."],
    ["Reviewed estimate", "Final pricing is reviewed against inventory, stairs, parking, and access."]
  ];

  return (
    <PageSection width="narrow">
      <div>
        <h1 className="font-display text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">Pricing built for clarity.</h1>
        <p className="mt-5 max-w-2xl leading-8 text-text-secondary">
          The quote flow shows a reviewed estimate range before contact details. It uses route data, truck size, move type, return-base travel, and simple billing rules that are easy to understand.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {pricingRules.map(([name, description]) => (
            <Card key={name} className="transition duration-200 hover:-translate-y-1 hover:shadow-lift">
              <CardContent className="p-6">
                <h2 className="font-display text-2xl font-semibold">{name}</h2>
                <p className="mt-3 text-text-secondary">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="mt-10 border-blue/30 bg-blue/10">
          <CardContent className="p-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-blue-soft">Estimate formula</p>
              <p className="mt-3 text-lg font-semibold text-white">
                Truck/crew time + charged route km + booking/admin fee
              </p>
              <p className="mt-2 text-text-secondary">
                Labour time includes loading/unloading baseline, move type, chargeable travel, and half-hour rounding.
              </p>
            </div>
            <Button asChild className="mt-6 w-full sm:mt-0 sm:w-auto">
              <Link href="/quote">Start quote</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageSection>
  );
}
