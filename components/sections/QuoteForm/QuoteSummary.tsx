import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowUp, CalendarDays, DollarSign, PackageOpen, Truck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { quoteFlowCopy } from "@/lib/content/site-copy";
import { getPreferredTimeWindowLabel, getTruckClassLabel } from "@/lib/core/booking/quote-request";
import { displayValue, getQuoteEstimate, getServiceTypeLabel } from "./utils";
import type { FormSnapshot, RouteEstimateState } from "./types";

type QuoteSummaryProps = {
  snapshot: FormSnapshot;
  routeEstimate: RouteEstimateState;
  currentStep: number;
  mode?: "desktop" | "mobile";
};

export function QuoteSummary({ snapshot, routeEstimate, currentStep, mode = "desktop" }: QuoteSummaryProps) {
  const truckLabel = getTruckClassLabel(snapshot.truckClass);
  const moveTypeLabel = getServiceTypeLabel(snapshot.serviceType);
  const moveTypeDetail = truckLabel ? `Truck: ${truckLabel}` : quoteFlowCopy.summary.vehicleDetail;
  const timeWindowLabel = getPreferredTimeWindowLabel(snapshot.preferredTimeWindow);
  const timingValue = `${displayValue(snapshot.preferredDate, "Select a date")} / ${timeWindowLabel}`;
  const quoteEstimate = getQuoteEstimate(snapshot, routeEstimate);
  const quoteDetail =
    routeEstimate.status === "ready"
      ? `${Math.round(routeEstimate.chargeableDistanceKm)} km travel, return included`
      : routeEstimate.status === "loading"
        ? "Calculating route..."
        : routeEstimate.status === "unavailable"
          ? quoteFlowCopy.summary.routePending
          : quoteEstimate
            ? quoteFlowCopy.summary.quotePending
            : quoteFlowCopy.summary.mobileFallback;

  const content = (
    <div className={mode === "desktop" ? "mx-auto max-w-sm lg:mx-0" : "grid gap-6"}>
      <p className="font-display text-3xl font-semibold tracking-tight-2 text-white">Your move</p>
      <div className="mt-8 grid gap-6">
        <SummaryTimelineItem icon={ArrowUp} label="Pickup" value={displayValue(snapshot.pickupAddress)} accent="blue" />
        <SummaryTimelineItem icon={ArrowDown} label="Drop-off" value={displayValue(snapshot.dropoffAddress)} accent="violet" />
        <SummaryTimelineItem icon={PackageOpen} label="Move type" value={moveTypeLabel} detail={moveTypeDetail} />
        <SummaryTimelineItem
          icon={DollarSign}
          label="Estimate"
          value={quoteEstimate?.rangeLabel ?? "Choose move type"}
          detail={quoteDetail}
        />
        <SummaryTimelineItem icon={CalendarDays} label="Schedule" value={timingValue} />
        <SummaryTimelineItem icon={Truck} label="Move details" value={displayValue(snapshot.notes, "Add move details")} />
      </div>
    </div>
  );

  if (mode === "mobile") {
    return <div>{content}</div>;
  }

  return (
    <aside
      className={`border-r border-line bg-ink/70 p-6 transition duration-300 lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:overflow-y-auto lg:p-8 ${
        currentStep === 2 ? "opacity-60 saturate-50" : "opacity-100"
      }`}
    >
      {content}
    </aside>
  );
}

export function MobileSummaryBar({
  snapshot,
  routeEstimate,
  onOpen
}: {
  snapshot: FormSnapshot;
  routeEstimate: RouteEstimateState;
  onOpen: () => void;
}) {
  const quoteEstimate = getQuoteEstimate(snapshot, routeEstimate);
  const routeLabel = `${displayValue(snapshot.pickupAddress, "Add pickup")} -> ${displayValue(snapshot.dropoffAddress, "Add drop-off")}`;

  return (
    <div className="flex items-center gap-4">
      <div className="min-w-0 flex-1">
        <Eyebrow size="sm">{quoteFlowCopy.summary.mobileLabel}</Eyebrow>
        <p className="mt-1 text-sm font-semibold text-white">{quoteEstimate?.rangeLabel ?? quoteFlowCopy.summary.mobileFallback}</p>
        <p className="mt-1 truncate text-xs text-text-muted">{routeLabel}</p>
      </div>
      <Button type="button" variant="secondary" size="sm" className="shrink-0" onClick={onOpen}>
        View
      </Button>
    </div>
  );
}

function SummaryTimelineItem({
  icon: Icon,
  label,
  value,
  detail,
  lineItems,
  accent
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail?: string;
  lineItems?: Array<{
    label: string;
    value: string;
  }>;
  accent?: "blue" | "violet";
}) {
  return (
    <div className="relative flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-full border border-line ${
            accent === "blue"
              ? "bg-blue/20 text-blue-soft"
              : accent === "violet"
                ? "bg-violet/20 text-violet-soft"
                : "bg-panel text-text-secondary"
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="mt-2 h-full min-h-5 w-px bg-line" aria-hidden="true" />
      </div>
      <div className="min-w-0 pb-1">
        <p className="text-xs font-medium text-text-muted">{label}</p>
        <p className={`${lineItems ? "text-xl" : "text-sm"} mt-1 break-words font-semibold leading-5 text-white`}>{value}</p>
        {detail ? <p className="mt-1 text-xs leading-5 text-text-muted">{detail}</p> : null}
        {lineItems?.length ? (
          <div className="mt-3 grid gap-1.5 rounded-2xl border border-line bg-panel/60 p-3">
            {lineItems.map((item) => (
              <div key={item.label} className="flex items-start justify-between gap-3 text-xs">
                <span className="leading-5 text-text-muted">{item.label}</span>
                <span className="font-semibold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
