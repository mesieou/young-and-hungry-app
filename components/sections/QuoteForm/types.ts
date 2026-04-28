export type RouteEstimateState =
  | {
      status: "idle" | "loading";
    }
  | {
      status: "ready";
      distanceKm: number;
      durationMinutes: number;
      chargeableDistanceKm: number;
      chargeableTravelMinutes: number;
      baseAddress: string;
      baseToPickup: {
        distanceKm: number;
        durationMinutes: number;
      };
      pickupToDropoff: {
        distanceKm: number;
        durationMinutes: number;
      };
      dropoffToBase: {
        distanceKm: number;
        durationMinutes: number;
      };
    }
  | {
      status: "unavailable";
      message: string;
    };

export type QuoteStep = {
  title: string;
  shortTitle: string;
};

export type FormSnapshot = Record<string, string | undefined>;

export type QuoteFormProps = {
  initialPickupAddress?: string;
  initialDropoffAddress?: string;
};
