import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { IconBadge } from "@/components/ui/IconBadge";
import { quoteFlowCopy } from "@/lib/content/site-copy";
import { getTruckClassLabel } from "@/lib/core/booking/quote-request";
import type { YoungHungryQuoteEstimate } from "@/lib/core/pricing/young-hungry-pricebook";
import {
  formatDistanceForDetail,
  formatHourlyRate,
  formatLineItemAmount,
  formatMinutesForDetail,
  getLabourDetail,
  getQuoteEstimate,
  getServiceTypeLabel
} from "./utils";
import type { FormSnapshot, RouteEstimateState } from "./types";

export function EstimateReveal({
  snapshot,
  routeEstimate
}: {
  snapshot: FormSnapshot;
  routeEstimate: RouteEstimateState;
}) {
  const quoteEstimate = getQuoteEstimate(snapshot, routeEstimate);

  if (!quoteEstimate) {
    return (
      <div className="rounded-3xl border border-line bg-ink/65 p-6 sm:p-8">
        <p className="font-display text-2xl font-semibold tracking-tight-2 text-white sm:text-3xl">
          {quoteFlowCopy.estimate.pendingTitle}
        </p>
        <p className="mt-3 max-w-2xl leading-7 text-text-secondary">
          {quoteFlowCopy.estimate.pendingBody}
        </p>
      </div>
    );
  }

  return (
    <div className="yh-gradient-border rounded-3xl bg-panel p-[1px] shadow-glow">
      <div className="relative overflow-hidden rounded-3xl bg-ink/92 p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.18),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(168,85,247,0.16),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_50%)]" />
        <div className="relative">
          <div className="max-w-3xl">
            <Eyebrow>{quoteFlowCopy.estimate.totalLabel}</Eyebrow>
            <p className="mt-3 font-display text-4xl font-semibold tracking-tight-4 text-white sm:text-7xl">
              {quoteEstimate.rangeLabel}
            </p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg sm:leading-8">
              {quoteFlowCopy.estimate.intro}
            </p>
          </div>

          <div className="mt-8 pt-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <p className="text-xs font-semibold uppercase tracking-eyebrow-sm text-text-muted">
                {quoteFlowCopy.estimate.breakdownLabel}
              </p>
              <p className="text-sm text-text-muted">{quoteFlowCopy.estimate.roundedLabel}</p>
            </div>

            <div className="mt-5 grid gap-4">
              <BreakdownRow
                label="Move type"
                detail={`${getServiceTypeLabel(snapshot.serviceType)}. ${getTruckClassLabel(snapshot.truckClass) ?? "Truck"} · ${formatHourlyRate(quoteEstimate.hourlyRateCents)} recommended for this size.`}
                value=""
              />
              <BreakdownRow
                label="Labour"
                detail={getLabourDetail(quoteEstimate)}
                value={formatLineItemAmount(quoteEstimate.laborCents)}
              />
              <BreakdownRow
                label="Travel"
                detail={<TravelBreakdownDetail quoteEstimate={quoteEstimate} routeEstimate={routeEstimate} />}
                value={quoteEstimate.routePricingIncluded ? formatLineItemAmount(quoteEstimate.routeCents) : "Pending"}
              />
              <BreakdownRow
                label="Booking fee"
                detail={quoteFlowCopy.summary.bookingFeeDetail}
                value={formatLineItemAmount(quoteEstimate.bookingFeeCents)}
              />
              <div className="grid gap-1 border-t border-dashed border-line pt-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-white">Estimated total</span>
                  <span className="font-display text-2xl font-semibold tracking-tight-1 text-white">
                    {quoteEstimate.rangeLabel}
                  </span>
                </div>
                <p className="text-xs leading-5 text-text-muted">
                  Range covers up to {formatMinutesForDetail(quoteEstimate.routePricingIncluded ? quoteEstimate.billingIncrementMinutes : quoteEstimate.billingIncrementMinutes * 2)} over at {formatHourlyRate(quoteEstimate.hourlyRateCents)} if the move tips into the next billing block.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-white/10 pt-5">
            <div className="flex items-start gap-3">
              <IconBadge icon={ShieldCheck} variant="violet" size="sm" className="mt-0.5" />
              <p className="text-sm leading-7 text-text-secondary">
                {quoteFlowCopy.estimate.dayOfJobDisclaimer}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BreakdownRow({
  label,
  detail,
  value
}: {
  label: string;
  detail?: ReactNode;
  value: string;
}) {
  return (
    <div className="grid gap-1">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-sm font-semibold text-white">{label}</p>
        {value ? <span className="shrink-0 text-base font-semibold text-white">{value}</span> : null}
      </div>
      {detail ? <div className="max-w-xl text-sm leading-6 text-text-secondary">{detail}</div> : null}
    </div>
  );
}

function TravelBreakdownDetail({
  quoteEstimate,
  routeEstimate
}: {
  quoteEstimate: YoungHungryQuoteEstimate;
  routeEstimate: RouteEstimateState;
}) {
  if (routeEstimate.status !== "ready" || !quoteEstimate.routePricingIncluded) {
    return <span>{quoteFlowCopy.estimate.travelPending}</span>;
  }

  const baseToPickupDetail =
    quoteEstimate.chargeableBaseToPickupMinutes > 0
      ? `Base -> pickup: ${formatMinutesForDetail(routeEstimate.baseToPickup.durationMinutes)} (${formatMinutesForDetail(quoteEstimate.freeBaseToPickupAppliedMinutes)} included, ${formatMinutesForDetail(quoteEstimate.chargeableBaseToPickupMinutes)} charged)`
      : `Base -> pickup: ${formatMinutesForDetail(routeEstimate.baseToPickup.durationMinutes)}, included`;

  return (
    <div className="grid gap-1">
      <span>{baseToPickupDetail}</span>
      <span>{`Pickup -> drop-off: ${formatMinutesForDetail(routeEstimate.pickupToDropoff.durationMinutes)}`}</span>
      <span>{`Drop-off -> base: ${formatMinutesForDetail(routeEstimate.dropoffToBase.durationMinutes)}`}</span>
      <span>
        Charged travel: {formatMinutesForDetail(quoteEstimate.routeDurationMinutes)} / {formatDistanceForDetail(quoteEstimate.routeDistanceKm)}
      </span>
    </div>
  );
}
