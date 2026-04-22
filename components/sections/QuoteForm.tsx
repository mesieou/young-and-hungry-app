"use client";

import { useActionState, useRef } from "react";
import { submitQuoteRequest } from "@/app/quote/actions";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { initialQuoteFormState } from "@/lib/core/booking/quote-request";

function createClientIdempotencyKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `quote_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function QuoteForm() {
  const idempotencyKey = useRef(createClientIdempotencyKey());
  const [state, formAction, isPending] = useActionState(submitQuoteRequest, initialQuoteFormState);

  return (
    <Card className="yh-gradient-border">
      <CardContent className="p-6 sm:p-8">
        <form action={formAction} className="grid gap-5">
          <input type="hidden" name="idempotencyKey" value={idempotencyKey.current} />
          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm font-medium text-text-secondary">Name</label>
            <input id="name" name="name" className="rounded-md border border-line bg-navy px-4 py-3 text-white outline-none transition focus:border-blue focus:ring-4 focus:ring-blue/30" placeholder="Your name" aria-invalid={Boolean(state.fieldErrors?.name)} />
            {state.fieldErrors?.name ? <p className="text-sm text-error">{state.fieldErrors.name}</p> : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium text-text-secondary">Email</label>
              <input id="email" name="email" type="email" className="rounded-md border border-line bg-navy px-4 py-3 text-white outline-none transition focus:border-blue focus:ring-4 focus:ring-blue/30" placeholder="you@example.com" aria-invalid={Boolean(state.fieldErrors?.email)} />
              {state.fieldErrors?.email ? <p className="text-sm text-error">{state.fieldErrors.email}</p> : null}
            </div>
            <div className="grid gap-2">
              <label htmlFor="phone" className="text-sm font-medium text-text-secondary">Phone</label>
              <input id="phone" name="phone" className="rounded-md border border-line bg-navy px-4 py-3 text-white outline-none transition focus:border-blue focus:ring-4 focus:ring-blue/30" placeholder="+61" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="pickupAddress" className="text-sm font-medium text-text-secondary">Pickup address</label>
              <input id="pickupAddress" name="pickupAddress" className="rounded-md border border-line bg-navy px-4 py-3 text-white outline-none transition focus:border-blue focus:ring-4 focus:ring-blue/30" placeholder="Pickup suburb/address" aria-invalid={Boolean(state.fieldErrors?.pickupAddress)} />
              {state.fieldErrors?.pickupAddress ? <p className="text-sm text-error">{state.fieldErrors.pickupAddress}</p> : null}
            </div>
            <div className="grid gap-2">
              <label htmlFor="dropoffAddress" className="text-sm font-medium text-text-secondary">Dropoff address</label>
              <input id="dropoffAddress" name="dropoffAddress" className="rounded-md border border-line bg-navy px-4 py-3 text-white outline-none transition focus:border-blue focus:ring-4 focus:ring-blue/30" placeholder="Dropoff suburb/address" aria-invalid={Boolean(state.fieldErrors?.dropoffAddress)} />
              {state.fieldErrors?.dropoffAddress ? <p className="text-sm text-error">{state.fieldErrors.dropoffAddress}</p> : null}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="serviceType" className="text-sm font-medium text-text-secondary">Service type</label>
              <select id="serviceType" name="serviceType" defaultValue="removal" className="rounded-md border border-line bg-navy px-4 py-3 text-white outline-none transition focus:border-blue focus:ring-4 focus:ring-blue/30">
                <option value="removal">Removal / moving job</option>
                <option value="small_move">Small move</option>
                <option value="apartment_move">Apartment move</option>
                <option value="house_move">House move</option>
                <option value="delivery_run">Delivery run</option>
              </select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="preferredDate" className="text-sm font-medium text-text-secondary">Preferred date</label>
              <input id="preferredDate" name="preferredDate" type="date" className="rounded-md border border-line bg-navy px-4 py-3 text-white outline-none transition focus:border-blue focus:ring-4 focus:ring-blue/30" />
            </div>
          </div>
          <div className="grid gap-2">
            <label htmlFor="notes" className="text-sm font-medium text-text-secondary">Job notes</label>
            <textarea id="notes" name="notes" rows={5} className="rounded-md border border-line bg-navy px-4 py-3 text-white outline-none transition focus:border-blue focus:ring-4 focus:ring-blue/30" placeholder="Inventory, stairs, lift, parking, preferred day..." aria-invalid={Boolean(state.fieldErrors?.notes)} />
            {state.fieldErrors?.notes ? <p className="text-sm text-error">{state.fieldErrors.notes}</p> : null}
          </div>
          <Button type="submit" size="lg" disabled={isPending}>
            {isPending ? "Submitting..." : "Submit quote request"}
          </Button>
          {state.message ? (
            <div className={`rounded-md border px-4 py-3 text-sm ${state.status === "success" ? "border-success/30 bg-success/10 text-success" : "border-error/30 bg-error/10 text-error"}`}>
              <p>{state.message}</p>
              {state.quoteId ? <p className="mt-2 font-mono text-xs">Quote ID: {state.quoteId}</p> : null}
            </div>
          ) : (
            <p className="text-sm text-text-muted">
              Quote capture submits through the `create_quote` RPC and emails the full request to ops for review.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
