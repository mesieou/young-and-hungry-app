"use client";

import { ArrowRight, Route, ShieldCheck } from "lucide-react";
import { AddressAutocompleteInput } from "@/components/ui/AddressAutocompleteInput";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { IconBadge } from "@/components/ui/IconBadge";
import { homeQuoteFormCopy } from "@/lib/content/site-copy";

export function HomeRouteQuoteForm() {
  return (
    <div className="rounded-2xl border border-line bg-ink/60 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Eyebrow tone="muted" size="lg">{homeQuoteFormCopy.eyebrow}</Eyebrow>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight-2 text-white sm:text-3xl">{homeQuoteFormCopy.title}</h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {homeQuoteFormCopy.description}
          </p>
        </div>
        <IconBadge icon={Route} variant="filled" size="lg" />
      </div>

      <form action="/quote" method="get" aria-label="Start your quote route" className="mt-6 grid gap-4">
        <AddressAutocompleteInput
          id="home-pickup-address"
          name="pickupAddress"
          label="Pickup address"
          placeholder="Pickup suburb/address"
          required
        />
        <AddressAutocompleteInput
          id="home-dropoff-address"
          name="dropoffAddress"
          label="Dropoff address"
          placeholder="Dropoff suburb/address"
          required
        />
        <Button type="submit" size="lg" className="mt-1 w-full">
          Continue quote <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <div className="mt-5 flex items-start gap-3 rounded-xl border border-blue/20 bg-blue/10 p-4 text-sm leading-6 text-text-secondary">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-soft" />
        <p>{homeQuoteFormCopy.reassurance}</p>
      </div>
    </div>
  );
}
