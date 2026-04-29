import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { IconBadge } from "@/components/ui/IconBadge";
import { quoteFlowCopy } from "@/lib/content/site-copy";
import { getTruckClassLabel } from "@/lib/core/booking/quote-request";
import type { YoungHungryQuoteEstimate } from "@/lib/core/pricing/young-hungry-pricebook";
import {
  formatHourlyRate,
  formatLineItemAmount,
  formatTimeForCustomer,
  getQuoteEstimate,
  getServiceTypeLabel
} from "./utils";
import type { FormSnapshot, RouteEstimateState } from "./types";

type BreakdownLeg = {
  label: string;
  caption?: ReactNode;
  time: string;
  rate: string;
  amount: string;
};

type BreakdownRowData = {
  label: string;
  caption?: ReactNode;
  time: string;
  rate: string;
  amount: string;
};

type BreakdownGroupData = {
  label: string;
  caption?: ReactNode;
  legs: BreakdownLeg[];
};

type BreakdownItem =
  | { kind: "row"; row: BreakdownRowData }
  | { kind: "group"; group: BreakdownGroupData };

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

  const moveSubtitle = `${getServiceTypeLabel(snapshot.serviceType)} · 2-man crew + ${getTruckClassLabel(snapshot.truckClass) ?? "truck"}`;
  const items = buildItems(quoteEstimate);
  const totalLabel =
    quoteEstimate.rangeHighCents > quoteEstimate.rangeLowCents
      ? quoteEstimate.rangeLabel
      : quoteEstimate.label;
  const showOverrunNote = quoteEstimate.rangeHighCents > quoteEstimate.rangeLowCents;

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
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-eyebrow-sm text-text-muted">
                  {quoteFlowCopy.estimate.breakdownLabel}
                </p>
                <p className="text-sm text-text-secondary">{moveSubtitle}</p>
              </div>
              <p className="text-sm text-text-muted">{quoteFlowCopy.estimate.roundedLabel}</p>
            </div>

            <BreakdownTable items={items} />

            <div className="mt-6 grid gap-1 border-t border-dashed border-line pt-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-white">Total</span>
                <span className="font-display text-2xl font-semibold tracking-tight-1 text-white">
                  {totalLabel}
                </span>
              </div>
              {showOverrunNote ? (
                <p className="text-xs leading-5 text-text-muted">
                  Upper end rounds total time up to the next {formatTimeForCustomer(quoteEstimate.billingIncrementMinutes)} billing block ({formatTimeForCustomer(quoteEstimate.billableMinutes)} at {formatHourlyRate(quoteEstimate.hourlyRateCents)}).
                </p>
              ) : null}
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

function buildItems(estimate: YoungHungryQuoteEstimate): BreakdownItem[] {
  const rate = formatHourlyRate(estimate.hourlyRateCents);

  const labour: BreakdownItem = {
    kind: "row",
    row: {
      label: "Labour",
      caption: quoteFlowCopy.estimate.labourCaption,
      time: formatTimeForCustomer(estimate.loadUnloadMinutes),
      rate,
      amount: formatLineItemAmount(estimate.loadUnloadCents)
    }
  };

  const travel: BreakdownItem = estimate.routePricingIncluded
    ? {
        kind: "group",
        group: {
          label: quoteFlowCopy.estimate.travelGroupLabel,
          legs: buildTravelLegs(estimate, rate)
        }
      }
    : {
        kind: "row",
        row: {
          label: quoteFlowCopy.estimate.travelGroupLabel,
          caption: quoteFlowCopy.estimate.travelPendingCaption,
          time: "Pending",
          rate,
          amount: "Pending"
        }
      };

  const bookingFee: BreakdownItem = {
    kind: "row",
    row: {
      label: "Booking fee",
      caption: quoteFlowCopy.estimate.bookingFeeCaption,
      time: "—",
      rate: "Flat",
      amount: formatLineItemAmount(estimate.bookingFeeCents)
    }
  };

  return [labour, travel, bookingFee];
}

function buildTravelLegs(estimate: YoungHungryQuoteEstimate, rate: string): BreakdownLeg[] {
  const hourlyCents = estimate.hourlyRateCents;
  const legs: BreakdownLeg[] = [];

  if (estimate.baseToPickupDurationMinutes !== null) {
    const chargeable = estimate.chargeableBaseToPickupMinutes;
    const fullyFree = chargeable === 0 && estimate.freeBaseToPickupAppliedMinutes > 0;
    legs.push({
      label: quoteFlowCopy.estimate.travelLegBaseToPickup,
      caption: quoteFlowCopy.estimate.travelLegFreeNote,
      time: fullyFree ? "Included" : formatTimeForCustomer(chargeable),
      rate,
      amount: fullyFree ? "Included" : formatLineItemAmount(Math.round((hourlyCents * chargeable) / 60))
    });
  }

  if (estimate.pickupToDropoffDurationMinutes !== null) {
    legs.push({
      label: quoteFlowCopy.estimate.travelLegPickupToDropoff,
      time: formatTimeForCustomer(estimate.pickupToDropoffDurationMinutes),
      rate,
      amount: formatLineItemAmount(Math.round((hourlyCents * estimate.pickupToDropoffDurationMinutes) / 60))
    });
  }

  if (estimate.dropoffToBaseDurationMinutes !== null) {
    legs.push({
      label: quoteFlowCopy.estimate.travelLegDropoffToBase,
      time: formatTimeForCustomer(estimate.dropoffToBaseDurationMinutes),
      rate,
      amount: formatLineItemAmount(Math.round((hourlyCents * estimate.dropoffToBaseDurationMinutes) / 60))
    });
  }

  return legs;
}

function BreakdownTable({ items }: { items: BreakdownItem[] }) {
  return (
    <>
      <div className="mt-5 grid gap-3 sm:hidden">
        {items.map((item, idx) =>
          item.kind === "row" ? (
            <MobileBreakdownRow key={`row-${idx}`} row={item.row} />
          ) : (
            <MobileBreakdownGroup key={`group-${idx}`} group={item.group} />
          )
        )}
      </div>

      <table className="mt-5 hidden w-full border-collapse sm:table">
        <colgroup>
          <col className="w-[44%]" />
          <col className="w-[18%]" />
          <col className="w-[18%]" />
          <col className="w-[20%]" />
        </colgroup>
        <thead>
          <tr className="border-b border-line/60 text-xs font-semibold uppercase tracking-eyebrow-sm text-text-muted">
            <th className="pb-2 text-left font-semibold">Item</th>
            <th className="pb-2 text-left font-semibold">Time</th>
            <th className="pb-2 text-left font-semibold">Rate</th>
            <th className="pb-2 text-right font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) =>
            item.kind === "row" ? (
              <DesktopBreakdownRow key={`row-${idx}`} row={item.row} isLast={idx === items.length - 1} />
            ) : (
              <DesktopBreakdownGroup key={`group-${idx}`} group={item.group} isLast={idx === items.length - 1} />
            )
          )}
        </tbody>
      </table>
    </>
  );
}

function MobileBreakdownRow({ row }: { row: BreakdownRowData }) {
  return (
    <div className="rounded-2xl border border-line/60 bg-panel/40 p-4">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold text-white">{row.label}</span>
        <span className="text-base font-semibold text-white">{row.amount}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-2 text-sm text-text-secondary">
        <span>{row.time}</span>
        <span className="text-text-muted">×</span>
        <span>{row.rate}</span>
      </div>
      {row.caption ? <div className="mt-2 text-xs leading-5 text-text-muted">{row.caption}</div> : null}
    </div>
  );
}

function MobileBreakdownGroup({ group }: { group: BreakdownGroupData }) {
  return (
    <div className="rounded-2xl border border-line/60 bg-panel/40 p-4">
      <p className="text-sm font-semibold text-white">{group.label}</p>
      <div className="mt-3 grid gap-3">
        {group.legs.map((leg) => (
          <div key={leg.label} className="border-t border-line/40 pt-3 first:border-0 first:pt-0">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-medium text-white">{leg.label}</span>
              <span className="text-sm font-semibold text-white">{leg.amount}</span>
            </div>
            <div className="mt-1 flex items-baseline gap-2 text-xs text-text-secondary">
              <span>{leg.time}</span>
              <span className="text-text-muted">×</span>
              <span>{leg.rate}</span>
            </div>
            {leg.caption ? <p className="mt-1 text-xs leading-5 text-text-muted">{leg.caption}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function DesktopBreakdownRow({ row, isLast }: { row: BreakdownRowData; isLast: boolean }) {
  const borderClass = isLast ? "" : " border-b border-line/40";
  return (
    <tr className={`align-baseline${borderClass}`}>
      <td className="py-4 pr-4">
        <CellLabel label={row.label} caption={row.caption} />
      </td>
      <td className="py-4 pr-4 text-sm text-text-secondary">{row.time}</td>
      <td className="py-4 pr-4 text-sm text-text-secondary">{row.rate}</td>
      <td className="py-4 text-right text-base font-semibold text-white">{row.amount}</td>
    </tr>
  );
}

function DesktopBreakdownGroup({ group, isLast }: { group: BreakdownGroupData; isLast: boolean }) {
  return (
    <>
      <tr className="align-baseline">
        <td className="pb-1 pt-4 text-sm font-semibold text-white" colSpan={4}>
          {group.label}
        </td>
      </tr>
      {group.legs.map((leg, legIdx) => {
        const isLastLeg = legIdx === group.legs.length - 1;
        const borderClass = isLast && isLastLeg ? "" : " border-b border-line/40";
        return (
          <tr key={leg.label} className={`align-baseline${borderClass}`}>
            <td className="py-3 pl-4 pr-4">
              <CellLabel label={leg.label} caption={leg.caption} muted />
            </td>
            <td className="py-3 pr-4 text-sm text-text-secondary">{leg.time}</td>
            <td className="py-3 pr-4 text-sm text-text-secondary">{leg.rate}</td>
            <td className="py-3 text-right text-sm font-semibold text-white">{leg.amount}</td>
          </tr>
        );
      })}
    </>
  );
}

function CellLabel({
  label,
  caption,
  muted = false
}: {
  label: string;
  caption?: ReactNode;
  muted?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className={`text-sm ${muted ? "font-medium text-text-secondary" : "font-semibold text-white"}`}>
        {label}
      </span>
      {caption ? <div className="text-xs leading-5 text-text-muted">{caption}</div> : null}
    </div>
  );
}
