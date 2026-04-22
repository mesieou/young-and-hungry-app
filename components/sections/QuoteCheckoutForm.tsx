"use client";

import { useActionState, useRef } from "react";
import { beginQuoteCheckout } from "@/app/quote/[quoteId]/actions";
import { Button } from "@/components/ui/Button";
import { initialQuoteCheckoutFormState } from "@/lib/core/booking/quote-checkout";

function createClientIdempotencyKey(quoteId: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `quote-checkout:${quoteId}:${crypto.randomUUID()}`;
  }

  return `quote-checkout:${quoteId}:${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency
  }).format(cents / 100);
}

function formatHeldUntil(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Australia/Melbourne"
  }).format(new Date(value));
}

type QuoteCheckoutFormProps = {
  quoteId: string;
  depositCents: number;
  currency: string;
};

export function QuoteCheckoutForm({ quoteId, depositCents, currency }: QuoteCheckoutFormProps) {
  const idempotencyKey = useRef(createClientIdempotencyKey(quoteId));
  const [state, formAction, isPending] = useActionState(beginQuoteCheckout, initialQuoteCheckoutFormState);

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="idempotencyKey" value={idempotencyKey.current} />
      <input type="hidden" name="quoteId" value={quoteId} />
      <input type="hidden" name="holdMinutes" value="15" />

      <div className="rounded-xl border border-line bg-ink/70 p-4">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-text-muted">Deposit due</p>
        <p className="mt-2 font-display text-3xl font-semibold">{formatMoney(depositCents, currency)}</p>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          The database creates a 15-minute hold before Stripe is asked to charge the deposit.
        </p>
      </div>

      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? "Reserving slot..." : "Reserve slot for deposit checkout"}
      </Button>

      {state.message ? (
        <div
          className={`rounded-md border px-4 py-3 text-sm ${
            state.status === "success"
              ? "border-success/30 bg-success/10 text-success"
              : "border-error/30 bg-error/10 text-error"
          }`}
        >
          <p>{state.message}</p>
          {state.code ? <p className="mt-2 font-mono text-xs">Code: {state.code}</p> : null}
          {state.bookingId ? <p className="mt-2 font-mono text-xs">Booking ID: {state.bookingId}</p> : null}
          {state.heldUntil ? <p className="mt-1 font-mono text-xs">Held until: {formatHeldUntil(state.heldUntil)}</p> : null}
          {state.paymentIntentInput ? (
            <p className="mt-2 text-xs text-text-secondary">
              Stripe checkout next receives {formatMoney(state.paymentIntentInput.amountCents, state.paymentIntentInput.currency)}.
            </p>
          ) : null}
        </div>
      ) : (
        <p className="text-sm leading-6 text-text-muted">
          This currently stops at the safe booking-hold boundary. Stripe checkout plugs in next.
        </p>
      )}
    </form>
  );
}
