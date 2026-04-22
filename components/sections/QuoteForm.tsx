"use client";

import { startTransition, useActionState, useRef } from "react";
import { CheckCircle2, Home } from "lucide-react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const idempotencyKey = useRef(createClientIdempotencyKey());
  const [state, formAction, isPending] = useActionState(submitQuoteRequest, initialQuoteFormState);
  const isSuccess = state.status === "success";

  return (
    <>
      <Card className="yh-gradient-border">
        <CardContent className="p-6 sm:p-8">
          <form action={formAction} className="grid gap-5">
            <input type="hidden" name="idempotencyKey" value={idempotencyKey.current} />
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium text-text-secondary">Name</label>
              <input id="name" name="name" className="rounded-md border border-line bg-navy px-4 py-3 text-white outline-none transition focus:border-blue focus:ring-4 focus:ring-blue/30" placeholder="Your name" aria-invalid={Boolean(state.fieldErrors?.name)} disabled={isSuccess} />
              {state.fieldErrors?.name ? <p className="text-sm text-error">{state.fieldErrors.name}</p> : null}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label htmlFor="email" className="text-sm font-medium text-text-secondary">Email</label>
                <input id="email" name="email" type="email" className="rounded-md border border-line bg-navy px-4 py-3 text-white outline-none transition focus:border-blue focus:ring-4 focus:ring-blue/30" placeholder="you@example.com" aria-invalid={Boolean(state.fieldErrors?.email)} disabled={isSuccess} />
                {state.fieldErrors?.email ? <p className="text-sm text-error">{state.fieldErrors.email}</p> : null}
              </div>
              <div className="grid gap-2">
                <label htmlFor="phone" className="text-sm font-medium text-text-secondary">Phone</label>
                <input id="phone" name="phone" className="rounded-md border border-line bg-navy px-4 py-3 text-white outline-none transition focus:border-blue focus:ring-4 focus:ring-blue/30" placeholder="+61" disabled={isSuccess} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label htmlFor="pickupAddress" className="text-sm font-medium text-text-secondary">Pickup address</label>
                <input id="pickupAddress" name="pickupAddress" className="rounded-md border border-line bg-navy px-4 py-3 text-white outline-none transition focus:border-blue focus:ring-4 focus:ring-blue/30" placeholder="Pickup suburb/address" aria-invalid={Boolean(state.fieldErrors?.pickupAddress)} disabled={isSuccess} />
                {state.fieldErrors?.pickupAddress ? <p className="text-sm text-error">{state.fieldErrors.pickupAddress}</p> : null}
              </div>
              <div className="grid gap-2">
                <label htmlFor="dropoffAddress" className="text-sm font-medium text-text-secondary">Dropoff address</label>
                <input id="dropoffAddress" name="dropoffAddress" className="rounded-md border border-line bg-navy px-4 py-3 text-white outline-none transition focus:border-blue focus:ring-4 focus:ring-blue/30" placeholder="Dropoff suburb/address" aria-invalid={Boolean(state.fieldErrors?.dropoffAddress)} disabled={isSuccess} />
                {state.fieldErrors?.dropoffAddress ? <p className="text-sm text-error">{state.fieldErrors.dropoffAddress}</p> : null}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label htmlFor="serviceType" className="text-sm font-medium text-text-secondary">Service type</label>
                <select id="serviceType" name="serviceType" defaultValue="removal" className="rounded-md border border-line bg-navy px-4 py-3 text-white outline-none transition focus:border-blue focus:ring-4 focus:ring-blue/30" disabled={isSuccess}>
                  <option value="removal">Removal / moving job</option>
                  <option value="small_move">Small move</option>
                  <option value="apartment_move">Apartment move</option>
                  <option value="house_move">House move</option>
                  <option value="delivery_run">Delivery run</option>
                </select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="preferredDate" className="text-sm font-medium text-text-secondary">Preferred date</label>
                <input id="preferredDate" name="preferredDate" type="date" className="rounded-md border border-line bg-navy px-4 py-3 text-white outline-none transition focus:border-blue focus:ring-4 focus:ring-blue/30" disabled={isSuccess} />
              </div>
            </div>
            <div className="grid gap-2">
              <label htmlFor="notes" className="text-sm font-medium text-text-secondary">Job notes</label>
              <textarea id="notes" name="notes" rows={5} className="rounded-md border border-line bg-navy px-4 py-3 text-white outline-none transition focus:border-blue focus:ring-4 focus:ring-blue/30" placeholder="Inventory, stairs, lift, parking, preferred day..." aria-invalid={Boolean(state.fieldErrors?.notes)} disabled={isSuccess} />
              {state.fieldErrors?.notes ? <p className="text-sm text-error">{state.fieldErrors.notes}</p> : null}
            </div>
            <Button type="submit" size="lg" disabled={isPending || isSuccess}>
              {isPending ? "Submitting..." : "Submit quote request"}
            </Button>
            {state.status === "error" && state.message ? (
              <div className="rounded-md border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                <p>{state.message}</p>
              </div>
            ) : (
              <p className="text-sm text-text-muted">
                Quote capture submits through the `create_quote` RPC and emails the full request to ops for review.
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      {isSuccess ? (
        <QuoteSuccessModal
          onReturnHome={() => {
            startTransition(() => {
              router.push("/");
            });
          }}
        />
      ) : null}
    </>
  );
}

export function QuoteSuccessModal({ onReturnHome }: { onReturnHome: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/85 px-6 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="quote-success-title">
      <div className="yh-gradient-border w-full max-w-lg animate-fade-up rounded-3xl bg-panel p-[1px] shadow-glow">
        <div className="rounded-3xl bg-panel p-7 text-center sm:p-9">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10 text-success shadow-glow">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <p className="mt-6 font-mono text-xs uppercase tracking-[0.28em] text-blue-soft">Quote request sent</p>
          <h2 id="quote-success-title" className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em] text-white">
            We received your move details.
          </h2>
          <p className="mt-4 leading-7 text-text-secondary">
            Young & Hungry will review the job and contact you with the next step. This confirmation stays here until you choose where to go next.
          </p>
          <div className="mt-7 rounded-2xl border border-line bg-ink/70 p-4 text-sm text-text-secondary">
            Your request has been sent to our team. You can safely return to the main page.
          </div>
          <Button type="button" size="lg" className="mt-6 w-full" onClick={onReturnHome}>
            <Home className="h-4 w-4" />
            Back to home now
          </Button>
        </div>
      </div>
    </div>
  );
}
