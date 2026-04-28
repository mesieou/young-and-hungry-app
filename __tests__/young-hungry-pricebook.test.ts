import {
  calculateYoungHungryQuoteEstimate,
  formatAud,
  YH_PRICEBOOK_VERSION
} from "@/lib/core/pricing/young-hungry-pricebook";

describe("Young & Hungry pricebook", () => {
  it("calculates a deterministic estimate with a truck class", () => {
    const estimate = calculateYoungHungryQuoteEstimate({
      truckClass: "four_tonne",
      serviceType: "apartment_move",
      preferredDate: "2026-05-01",
      baseToPickup: {
        distanceKm: 18,
        durationMinutes: 52
      },
      pickupToDropoff: {
        distanceKm: 12.4,
        durationMinutes: 28
      },
      dropoffToBase: {
        distanceKm: 16,
        durationMinutes: 35
      }
    });

    expect(estimate).toMatchObject({
      pricingVersion: YH_PRICEBOOK_VERSION,
      currency: "AUD",
      hourlyRateCents: 15900,
      rawEstimatedMinutes: 183,
      billableMinutes: 210,
      billingIncrementMinutes: 30,
      laborCents: 55650,
      routeCents: 6248,
      bookingFeeCents: 2500,
      priceCents: 64398,
      rangeLowCents: 64398,
      rangeHighCents: 72348,
      routeDistanceKm: 28.4,
      routeDurationMinutes: 63,
      chargeableBaseToPickupMinutes: 0,
      freeBaseToPickupAppliedMinutes: 52,
      returnBaseIncluded: true,
      routePricingIncluded: true,
      isWeekendRate: false
    });
    expect(estimate?.label).toBe("$644");
    expect(estimate?.rangeLabel).toBe("$644 - $724");
  });

  it("uses weekend rates when the preferred date is Saturday or Sunday", () => {
    const estimate = calculateYoungHungryQuoteEstimate({
      truckClass: "six_tonne",
      serviceType: "removal",
      preferredDate: "2026-05-02"
    });

    expect(estimate).toMatchObject({
      hourlyRateCents: 17900,
      billableMinutes: 120,
      priceCents: 38300,
      isWeekendRate: true
    });
    expect(estimate?.detail).toContain("weekend rate");
  });

  it("charges pickup travel over the free first hour from base", () => {
    const estimate = calculateYoungHungryQuoteEstimate({
      truckClass: "six_tonne",
      serviceType: "removal",
      baseToPickup: {
        distanceKm: 70,
        durationMinutes: 90
      },
      pickupToDropoff: {
        distanceKm: 10,
        durationMinutes: 20
      },
      dropoffToBase: {
        distanceKm: 15,
        durationMinutes: 25
      }
    });

    expect(estimate).toMatchObject({
      chargeableBaseToPickupMinutes: 30,
      freeBaseToPickupAppliedMinutes: 60,
      routeDurationMinutes: 75,
      routeDistanceKm: 48.3,
      billableMinutes: 180
    });
  });

  it("rounds total billable time up to the next 30-minute block", () => {
    const estimate = calculateYoungHungryQuoteEstimate({
      truckClass: "six_tonne",
      serviceType: "removal",
      routeDistanceKm: 20,
      routeDurationMinutes: 106
    });

    expect(estimate).toMatchObject({
      rawEstimatedMinutes: 196,
      billableMinutes: 210
    });
  });

  it("does not calculate until a valid truck class is selected", () => {
    expect(calculateYoungHungryQuoteEstimate({ serviceType: "removal" })).toBeNull();
  });

  it("marks route pricing as pending when distance is not available", () => {
    const estimate = calculateYoungHungryQuoteEstimate({
      truckClass: "six_tonne",
      serviceType: "removal"
    });

    expect(estimate).toMatchObject({
      routeDistanceKm: null,
      routeDurationMinutes: null,
      routePricingIncluded: false,
      routeCents: 0,
      bookingFeeCents: 2500,
      priceCents: 36300
    });
    expect(estimate?.detail).toContain("route pending");
  });

  it("formats AUD without cents for whole-dollar values", () => {
    expect(formatAud(33800)).toBe("$338");
  });
});
