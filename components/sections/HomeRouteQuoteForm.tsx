"use client";

import { ArrowRight, Route, ShieldCheck } from "lucide-react";
import { AddressAutocompleteInput } from "@/components/ui/AddressAutocompleteInput";
import { Button } from "@/components/ui/Button";

export function HomeRouteQuoteForm() {
  return (
    <div className="rounded-2xl border border-line bg-ink/60 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-text-muted">Get an estimate</p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.04em] text-white">Start with the route</h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Enter pickup and dropoff here. The next screen continues with truck, timing, move details, and contact.
          </p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-violet to-blue p-3 shadow-glow">
          <Route className="h-7 w-7" />
        </div>
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
        <p>No payment or booking hold yet. Young & Hungry reviews the quote before confirming anything.</p>
      </div>
    </div>
  );
}
