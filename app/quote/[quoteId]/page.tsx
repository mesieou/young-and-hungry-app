import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageSection } from "@/components/layout/PageSection";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { QuoteCheckoutForm } from "@/components/sections/QuoteCheckoutForm";
import { YH_DEFAULT_BUSINESS } from "@/lib/business/config";
import type { BookingStatus, QuoteStatus } from "@/lib/core/status";
import { createSupabaseAdminClient } from "@/lib/database/supabase/admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Quote Details",
  description: "Review your Young & Hungry move details, quote total, and current booking status."
};

type QuoteCheckoutQuote = {
  id: string;
  status: QuoteStatus;
  customer_name: string | null;
  customer_email: string | null;
  pickup_address: string | null;
  dropoff_address: string | null;
  service_type: string;
  price_cents: number | null;
  deposit_cents: number;
  currency: string;
  job_start_at: string | null;
  job_block_minutes: number | null;
  expires_at: string | null;
  pricing_version: string;
};

type QuoteCheckoutBooking = {
  id: string;
  status: BookingStatus;
  held_until: string | null;
  confirmed_at: string | null;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function formatMoney(cents: number | null, currency: string) {
  if (cents === null) {
    return "To be confirmed";
  }

  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency
  }).format(cents / 100);
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not scheduled yet";
  }

  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: YH_DEFAULT_BUSINESS.timezone
  }).format(new Date(value));
}

function formatDuration(minutes: number | null) {
  if (!minutes) {
    return "Not set";
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = minutes / 60;
  return `${hours} hr${hours === 1 ? "" : "s"}`;
}

async function getQuoteCheckoutData(quoteId: string) {
  if (!isUuid(quoteId)) {
    notFound();
  }

  const supabase = createSupabaseAdminClient();
  const quoteResult = await supabase
    .from("quotes")
    .select(
      "id,status,customer_name,customer_email,pickup_address,dropoff_address,service_type,price_cents,deposit_cents,currency,job_start_at,job_block_minutes,expires_at,pricing_version"
    )
    .eq("id", quoteId)
    .maybeSingle();

  if (quoteResult.error) {
    throw new Error(quoteResult.error.message);
  }

  const quote = quoteResult.data as QuoteCheckoutQuote | null;

  if (!quote) {
    notFound();
  }

  const bookingResult = await supabase
    .from("bookings")
    .select("id,status,held_until,confirmed_at")
    .eq("quote_id", quoteId)
    .maybeSingle();

  if (bookingResult.error) {
    throw new Error(bookingResult.error.message);
  }

  return {
    quote,
    booking: bookingResult.data as QuoteCheckoutBooking | null
  };
}

export default async function QuoteCheckoutPage({ params }: { params: Promise<{ quoteId: string }> }) {
  const { quoteId } = await params;
  const { quote, booking } = await getQuoteCheckoutData(quoteId);
  const isExpired = quote.expires_at ? new Date(quote.expires_at).getTime() <= Date.now() : false;
  const isBookable =
    !booking &&
    !isExpired &&
    ["estimated", "sent", "accepted"].includes(quote.status) &&
    Boolean(quote.job_start_at && quote.job_block_minutes);

  return (
    <PageSection>
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <Badge tone="gradient">Quote details</Badge>
          <h1 className="mt-5 font-display text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
            Review your move details and current quote status.
          </h1>
          <p className="mt-5 leading-8 text-text-secondary">
            This page shows the move details, estimate, and booking state for the quote. Booking checkout can be added later without changing the core quote data.
          </p>
        </div>

        <Card className="yh-gradient-border">
          <CardContent className="grid gap-6 p-6 sm:p-8">
            <div className="flex flex-col gap-3 border-b border-line pb-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-text-muted">Quote</p>
                <h2 className="mt-2 font-display text-3xl font-semibold">{quote.customer_name ?? "Young & Hungry customer"}</h2>
              </div>
              <span className="rounded-full border border-line bg-navy px-3 py-1 font-mono text-xs uppercase tracking-[0.18em] text-blue-soft">
                {booking?.status ?? quote.status}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Detail label="Pickup" value={quote.pickup_address ?? "To be confirmed"} />
              <Detail label="Dropoff" value={quote.dropoff_address ?? "To be confirmed"} />
              <Detail label="Service" value={quote.service_type.replaceAll("_", " ")} />
              <Detail label="Scheduled start" value={formatDateTime(quote.job_start_at)} />
              <Detail label="Job block" value={formatDuration(quote.job_block_minutes)} />
              <Detail label="Quote total" value={formatMoney(quote.price_cents, quote.currency)} />
              <Detail label="Deposit" value={formatMoney(quote.deposit_cents, quote.currency)} />
              <Detail label="Pricing version" value={quote.pricing_version} />
            </div>

            {booking ? (
              <div className="rounded-xl border border-blue/30 bg-blue/10 p-4 text-sm text-blue-soft">
                <p className="font-medium text-white">A booking already exists for this quote.</p>
                <p className="mt-2 font-mono text-xs">Booking ID: {booking.id}</p>
                {booking.held_until ? <p className="mt-1 font-mono text-xs">Held until: {formatDateTime(booking.held_until)}</p> : null}
              </div>
            ) : isBookable ? (
              <QuoteCheckoutForm quoteId={quote.id} depositCents={quote.deposit_cents} currency={quote.currency} />
            ) : (
              <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
                {isExpired
                  ? "This quote has expired and needs to be refreshed before booking."
                  : "This quote is not bookable yet. A scheduled start time and move duration still need to be set before checkout."}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageSection>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-navy p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-text-muted">{label}</p>
      <p className="mt-2 break-words text-white">{value}</p>
    </div>
  );
}
