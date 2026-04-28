import Link from "next/link";
import { PublicRoutePage } from "@/components/seo/PublicRoutePage";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { buildPublicPageMetadataById, requirePublicPageById } from "@/lib/seo/public-route-utils";

export const metadata = buildPublicPageMetadataById("pricing");

const page = requirePublicPageById("pricing");

export default function PricingPage() {
  const pricingRules = [
    ["Free pickup travel", "The first hour from base to pickup is included."],
    ["Charged route", "Estimate includes pickup to dropoff and return to base."],
    ["Half-hour billing", "Total time rounds up to the next half-hour block."],
    ["Reviewed estimate", "Final pricing is reviewed against inventory, stairs, parking, and access."]
  ];

  return (
    <PublicRoutePage page={page}>
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
          {pricingRules.map(([name, description]) => (
            <Card key={name} variant="interactive">
              <CardContent className="p-6">
                <h2 className="font-display text-2xl font-semibold">{name}</h2>
                <p className="mt-3 text-text-secondary">{description}</p>
              </CardContent>
            </Card>
          ))}
      </div>
      <Card className="border-blue/30 bg-blue/10">
          <CardContent className="p-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
            <div>
              <Eyebrow>Estimate structure</Eyebrow>
              <p className="mt-3 text-lg font-semibold text-white">
                Truck/crew time + charged route km + booking/admin fee
              </p>
              <p className="mt-2 text-text-secondary">
                Labour time includes loading and unloading baseline, move type, chargeable travel, and half-hour rounding.
              </p>
            </div>
            <Button asChild className="mt-6 w-full sm:mt-0 sm:w-auto">
              <Link href="/quote">Start your estimate</Link>
            </Button>
          </CardContent>
      </Card>
    </PublicRoutePage>
  );
}
