export const YH_PRICEBOOK_VERSION = "yh-pricebook-2026-04-28-v3";

const pricebook = {
  currency: "AUD",
  minimumBillableMinutes: 120,
  averageLoadUnloadMinutes: 90,
  fallbackChargeableTravelMinutes: 30,
  freeBaseToPickupMinutes: 60,
  billingIncrementMinutes: 30,
  distanceRateCentsPerKm: 220,
  bookingFeeCents: 2500,
  truckRates: {
    four_tonne: {
      weekdayHourlyCents: 15900,
      weekendHourlyCents: 16900
    },
    six_tonne: {
      weekdayHourlyCents: 16900,
      weekendHourlyCents: 17900
    }
  },
  serviceAdjustments: {
    removal: 0,
    small_move: -15,
    apartment_move: 30,
    house_move: 60,
    delivery_run: -30,
    apartment_studio: 0,
    apartment_one_bed: 15,
    apartment_two_bed: 45,
    apartment_three_bed: 75,
    apartment_four_plus: 105,
    house_one_bed: 30,
    house_two_bed: 60,
    house_three_bed: 90,
    house_four_plus: 150
  }
} as const;

export const YH_BILLING_RULES = {
  freeBaseToPickupMinutes: pricebook.freeBaseToPickupMinutes,
  billingIncrementMinutes: pricebook.billingIncrementMinutes,
  minimumBillableMinutes: pricebook.minimumBillableMinutes
} as const;

export type RouteLegEstimate = {
  distanceKm: number;
  durationMinutes: number;
};

export type YoungHungryQuoteEstimateInput = {
  truckClass?: string;
  serviceType?: string;
  preferredDate?: string;
  routeDistanceKm?: number | null;
  routeDurationMinutes?: number | null;
  baseToPickup?: RouteLegEstimate | null;
  pickupToDropoff?: RouteLegEstimate | null;
  dropoffToBase?: RouteLegEstimate | null;
};

export type YoungHungryQuoteEstimate = {
  pricingVersion: typeof YH_PRICEBOOK_VERSION;
  currency: "AUD";
  priceCents: number;
  rangeLowCents: number;
  rangeHighCents: number;
  laborCents: number;
  routeCents: number;
  bookingFeeCents: number;
  hourlyRateCents: number;
  rawEstimatedMinutes: number;
  billableMinutes: number;
  billingIncrementMinutes: number;
  minimumBillableMinutes: number;
  estimatedLaborMinutes: number;
  serviceAdjustmentMinutes: number;
  routeDistanceKm: number | null;
  routeDurationMinutes: number | null;
  pickupToDropoffDistanceKm: number | null;
  pickupToDropoffDurationMinutes: number | null;
  dropoffToBaseDistanceKm: number | null;
  dropoffToBaseDurationMinutes: number | null;
  baseToPickupDistanceKm: number | null;
  baseToPickupDurationMinutes: number | null;
  chargeableBaseToPickupMinutes: number;
  freeBaseToPickupAppliedMinutes: number;
  routePricingIncluded: boolean;
  returnBaseIncluded: boolean;
  isWeekendRate: boolean;
  label: string;
  rangeLabel: string;
  detail: string;
  lineItems: Array<{
    label: string;
    amountCents: number;
    value?: string;
  }>;
};

function isTruckClass(value: string | undefined): value is keyof typeof pricebook.truckRates {
  return value === "four_tonne" || value === "six_tonne";
}

function getServiceAdjustmentMinutes(value: string | undefined) {
  if (!value || !(value in pricebook.serviceAdjustments)) return 0;

  return pricebook.serviceAdjustments[value as keyof typeof pricebook.serviceAdjustments];
}

function isWeekendDate(value: string | undefined) {
  if (!value) return false;

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return false;

  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return weekday === 0 || weekday === 6;
}

function roundUpToIncrement(value: number, increment: number) {
  return Math.ceil(value / increment) * increment;
}

function normalizeNumber(value: number | null | undefined, decimals = 0) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;

  const multiplier = 10 ** decimals;
  return Math.max(0, Math.round(value * multiplier) / multiplier);
}

function normalizeLeg(value: RouteLegEstimate | null | undefined): RouteLegEstimate | null {
  const distanceKm = normalizeNumber(value?.distanceKm, 1);
  const durationMinutes = normalizeNumber(value?.durationMinutes);

  if (distanceKm === null || durationMinutes === null) return null;

  return {
    distanceKm,
    durationMinutes: Math.max(1, durationMinutes)
  };
}

function getChargeableBaseToPickupDistanceKm(baseToPickup: RouteLegEstimate | null, chargeableMinutes: number) {
  if (!baseToPickup || chargeableMinutes <= 0) return 0;

  return Math.round((baseToPickup.distanceKm * (chargeableMinutes / baseToPickup.durationMinutes)) * 10) / 10;
}

function getRoutePricing(input: YoungHungryQuoteEstimateInput) {
  const pickupToDropoff = normalizeLeg(input.pickupToDropoff);
  const dropoffToBase = normalizeLeg(input.dropoffToBase);
  const baseToPickup = normalizeLeg(input.baseToPickup);

  if (pickupToDropoff) {
    const chargeableBaseToPickupMinutes = baseToPickup
      ? Math.max(0, baseToPickup.durationMinutes - pricebook.freeBaseToPickupMinutes)
      : 0;
    const freeBaseToPickupAppliedMinutes = baseToPickup
      ? Math.min(baseToPickup.durationMinutes, pricebook.freeBaseToPickupMinutes)
      : 0;
    const chargeableBaseToPickupDistanceKm = getChargeableBaseToPickupDistanceKm(
      baseToPickup,
      chargeableBaseToPickupMinutes
    );
    const chargeableDistanceKm = Math.round(
      (pickupToDropoff.distanceKm + (dropoffToBase?.distanceKm ?? 0) + chargeableBaseToPickupDistanceKm) * 10
    ) / 10;
    const chargeableDurationMinutes =
      pickupToDropoff.durationMinutes +
      (dropoffToBase?.durationMinutes ?? 0) +
      chargeableBaseToPickupMinutes;

    return {
      routePricingIncluded: true,
      returnBaseIncluded: Boolean(dropoffToBase),
      routeDistanceKm: chargeableDistanceKm,
      routeDurationMinutes: chargeableDurationMinutes,
      pickupToDropoff,
      dropoffToBase,
      baseToPickup,
      chargeableBaseToPickupMinutes,
      freeBaseToPickupAppliedMinutes
    };
  }

  const routeDistanceKm = normalizeNumber(input.routeDistanceKm, 1);
  const routeDurationMinutes = normalizeNumber(input.routeDurationMinutes);

  return {
    routePricingIncluded: routeDistanceKm !== null && routeDurationMinutes !== null,
    returnBaseIncluded: false,
    routeDistanceKm,
    routeDurationMinutes,
    pickupToDropoff: routeDistanceKm !== null && routeDurationMinutes !== null
      ? {
          distanceKm: routeDistanceKm,
          durationMinutes: Math.max(1, routeDurationMinutes)
        }
      : null,
    dropoffToBase: null,
    baseToPickup: null,
    chargeableBaseToPickupMinutes: 0,
    freeBaseToPickupAppliedMinutes: 0
  };
}

export function formatAud(cents: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2
  }).format(cents / 100);
}

export function formatAudRounded(cents: number, mode: "round" | "ceil" = "round") {
  const dollars = mode === "ceil" ? Math.ceil(cents / 100) : Math.round(cents / 100);

  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0
  }).format(dollars);
}

function formatHoursForCopy(minutes: number) {
  const hours = Math.round((minutes / 60) * 10) / 10;
  const label = Number.isInteger(hours) ? String(hours) : hours.toFixed(1);

  return `${label} ${hours === 1 ? "hour" : "hours"}`;
}

function formatDistanceForCopy(distanceKm: number | null) {
  if (distanceKm === null) return "route pending";

  return `${Math.round(distanceKm)} km travel`;
}

export function calculateYoungHungryQuoteEstimate(
  input: YoungHungryQuoteEstimateInput
): YoungHungryQuoteEstimate | null {
  if (!isTruckClass(input.truckClass)) return null;

  const serviceAdjustmentMinutes = getServiceAdjustmentMinutes(input.serviceType);
  const route = getRoutePricing(input);
  const estimatedLaborMinutes =
    pricebook.averageLoadUnloadMinutes +
    serviceAdjustmentMinutes +
    (route.routeDurationMinutes ?? pricebook.fallbackChargeableTravelMinutes);
  const rawEstimatedMinutes = Math.max(
    pricebook.minimumBillableMinutes,
    estimatedLaborMinutes
  );
  const billableMinutes = roundUpToIncrement(rawEstimatedMinutes, pricebook.billingIncrementMinutes);
  const isWeekendRate = isWeekendDate(input.preferredDate);
  const truckRate = pricebook.truckRates[input.truckClass];
  const hourlyRateCents = isWeekendRate ? truckRate.weekendHourlyCents : truckRate.weekdayHourlyCents;
  const laborCents = Math.round((hourlyRateCents * billableMinutes) / 60);
  const routeCents = route.routeDistanceKm === null ? 0 : Math.round(route.routeDistanceKm * pricebook.distanceRateCentsPerKm);
  const bookingFeeCents = pricebook.bookingFeeCents;
  const priceCents = laborCents + routeCents + bookingFeeCents;
  const extraRangeMinutes = route.routePricingIncluded ? pricebook.billingIncrementMinutes : pricebook.billingIncrementMinutes * 2;
  const rangeLowCents = priceCents;
  const rangeHighCents = priceCents + Math.round((hourlyRateCents * extraRangeMinutes) / 60);
  const rangeLabel = `${formatAudRounded(rangeLowCents)} - ${formatAudRounded(rangeHighCents, "ceil")}`;

  return {
    pricingVersion: YH_PRICEBOOK_VERSION,
    currency: pricebook.currency,
    priceCents,
    rangeLowCents,
    rangeHighCents,
    laborCents,
    routeCents,
    bookingFeeCents,
    hourlyRateCents,
    rawEstimatedMinutes,
    billableMinutes,
    billingIncrementMinutes: pricebook.billingIncrementMinutes,
    minimumBillableMinutes: pricebook.minimumBillableMinutes,
    estimatedLaborMinutes,
    serviceAdjustmentMinutes,
    routeDistanceKm: route.routeDistanceKm,
    routeDurationMinutes: route.routeDurationMinutes,
    pickupToDropoffDistanceKm: route.pickupToDropoff?.distanceKm ?? null,
    pickupToDropoffDurationMinutes: route.pickupToDropoff?.durationMinutes ?? null,
    dropoffToBaseDistanceKm: route.dropoffToBase?.distanceKm ?? null,
    dropoffToBaseDurationMinutes: route.dropoffToBase?.durationMinutes ?? null,
    baseToPickupDistanceKm: route.baseToPickup?.distanceKm ?? null,
    baseToPickupDurationMinutes: route.baseToPickup?.durationMinutes ?? null,
    chargeableBaseToPickupMinutes: route.chargeableBaseToPickupMinutes,
    freeBaseToPickupAppliedMinutes: route.freeBaseToPickupAppliedMinutes,
    routePricingIncluded: route.routePricingIncluded,
    returnBaseIncluded: route.returnBaseIncluded,
    isWeekendRate,
    label: formatAudRounded(priceCents),
    rangeLabel,
    detail: `${formatHoursForCopy(billableMinutes)} estimate, ${formatDistanceForCopy(route.routeDistanceKm)}${isWeekendRate ? ", weekend rate" : ""}`,
    lineItems: [
      {
        label: "First hour from base to pickup",
        amountCents: 0,
        value: "Included"
      },
      {
        label: `Truck + crew (${formatHoursForCopy(billableMinutes)} estimate)`,
        amountCents: laborCents
      },
      {
        label: route.routePricingIncluded
          ? `Travel distance (${Math.round(route.routeDistanceKm ?? 0)} km)`
          : "Travel distance",
        amountCents: routeCents,
        value: route.routePricingIncluded ? undefined : "Pending"
      },
      {
        label: "Booking/admin fee",
        amountCents: bookingFeeCents
      }
    ]
  };
}
