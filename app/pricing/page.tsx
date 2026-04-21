import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Transparent removalist pricing with versioned quotes and deposit-backed bookings."
};

export default function PricingPage() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-display text-5xl font-semibold tracking-[-0.05em]">Pricing built for clarity.</h1>
        <p className="mt-5 max-w-2xl leading-8 text-text-secondary">
          MVP pricing starts with quote requests, then moves to versioned pricebooks so accepted quotes remain reproducible even after rates change.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {["Small move", "Apartment move", "House move"].map((name) => (
            <Card key={name} className="transition duration-200 hover:-translate-y-1 hover:shadow-lift">
              <CardContent className="p-6">
                <h2 className="font-display text-2xl font-semibold">{name}</h2>
                <p className="mt-3 text-text-secondary">Request a quote with addresses, inventory, stairs, and access notes.</p>
                <Button asChild className="mt-6 w-full">
                  <Link href="/quote">Start quote</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
