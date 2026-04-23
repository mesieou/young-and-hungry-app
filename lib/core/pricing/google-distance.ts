export type RouteDistanceResult =
  | {
      ok: true;
      distanceKm: number;
      durationMinutes: number;
      provider: "google_distance_matrix";
    }
  | {
      ok: false;
      code: "DISTANCE_API_NOT_CONFIGURED" | "DISTANCE_API_FAILED" | "DISTANCE_ROUTE_NOT_FOUND";
      message: string;
    };

type RouteDistanceFailureCode = Extract<RouteDistanceResult, { ok: false }>["code"];

export type MoveRouteDistanceResult =
  | {
      ok: true;
      provider: "google_distance_matrix";
      baseAddress: string;
      distanceKm: number;
      durationMinutes: number;
      chargeableDistanceKm: number;
      chargeableTravelMinutes: number;
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
      ok: false;
      code: RouteDistanceFailureCode;
      message: string;
    };

type GoogleDistanceMatrixResponse = {
  status?: string;
  error_message?: string;
  rows?: Array<{
    elements?: Array<{
      status?: string;
      distance?: {
        value?: number;
      };
      duration?: {
        value?: number;
      };
    }>;
  }>;
};

export async function getRouteDistanceEstimate(input: {
  origin: string;
  destination: string;
  apiKey?: string;
}): Promise<RouteDistanceResult> {
  const apiKey = input.apiKey?.trim() || process.env.GOOGLE_MAPS_API_KEY?.trim() || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();

  if (!apiKey) {
    return {
      ok: false,
      code: "DISTANCE_API_NOT_CONFIGURED",
      message: "Google Maps API key is not configured."
    };
  }

  const params = new URLSearchParams({
    origins: input.origin,
    destinations: input.destination,
    mode: "driving",
    units: "metric",
    key: apiKey
  });

  try {
    const response = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?${params.toString()}`);

    if (!response.ok) {
      return {
        ok: false,
        code: "DISTANCE_API_FAILED",
        message: `Google Distance Matrix HTTP ${response.status}.`
      };
    }

    const data = (await response.json()) as GoogleDistanceMatrixResponse;

    if (data.status !== "OK") {
      return {
        ok: false,
        code: "DISTANCE_API_FAILED",
        message: data.error_message ?? `Google Distance Matrix returned ${data.status ?? "UNKNOWN"}.`
      };
    }

    const element = data.rows?.[0]?.elements?.[0];
    const distanceMeters = element?.distance?.value;
    const durationSeconds = element?.duration?.value;

    if (element?.status !== "OK" || !distanceMeters || !durationSeconds) {
      return {
        ok: false,
        code: "DISTANCE_ROUTE_NOT_FOUND",
        message: "Google Distance Matrix did not return a route."
      };
    }

    return {
      ok: true,
      distanceKm: Math.round((distanceMeters / 1000) * 10) / 10,
      durationMinutes: Math.max(1, Math.round(durationSeconds / 60)),
      provider: "google_distance_matrix"
    };
  } catch (error) {
    return {
      ok: false,
      code: "DISTANCE_API_FAILED",
      message: error instanceof Error ? error.message : "Google Distance Matrix request failed."
    };
  }
}

function isRouteOk(result: RouteDistanceResult): result is Extract<RouteDistanceResult, { ok: true }> {
  return result.ok;
}

export async function getMoveRouteDistanceEstimate(input: {
  baseAddress: string;
  pickupAddress: string;
  dropoffAddress: string;
  freeBaseToPickupMinutes?: number;
  apiKey?: string;
}): Promise<MoveRouteDistanceResult> {
  const [baseToPickup, pickupToDropoff, dropoffToBase] = await Promise.all([
    getRouteDistanceEstimate({
      origin: input.baseAddress,
      destination: input.pickupAddress,
      apiKey: input.apiKey
    }),
    getRouteDistanceEstimate({
      origin: input.pickupAddress,
      destination: input.dropoffAddress,
      apiKey: input.apiKey
    }),
    getRouteDistanceEstimate({
      origin: input.dropoffAddress,
      destination: input.baseAddress,
      apiKey: input.apiKey
    })
  ]);

  const failedLeg = [baseToPickup, pickupToDropoff, dropoffToBase].find((result) => !result.ok);

  if (failedLeg && !failedLeg.ok) {
    return failedLeg;
  }

  if (!isRouteOk(baseToPickup) || !isRouteOk(pickupToDropoff) || !isRouteOk(dropoffToBase)) {
    return {
      ok: false,
      code: "DISTANCE_ROUTE_NOT_FOUND",
      message: "Google Distance Matrix did not return every route leg."
    };
  }

  const freeBaseToPickupMinutes = input.freeBaseToPickupMinutes ?? 60;
  const chargeableBaseToPickupMinutes = Math.max(0, baseToPickup.durationMinutes - freeBaseToPickupMinutes);
  const chargeableBaseToPickupDistanceKm =
    chargeableBaseToPickupMinutes > 0
      ? Math.round((baseToPickup.distanceKm * (chargeableBaseToPickupMinutes / baseToPickup.durationMinutes)) * 10) / 10
      : 0;
  const chargeableDistanceKm = Math.round(
    (pickupToDropoff.distanceKm + dropoffToBase.distanceKm + chargeableBaseToPickupDistanceKm) * 10
  ) / 10;
  const chargeableTravelMinutes =
    pickupToDropoff.durationMinutes + dropoffToBase.durationMinutes + chargeableBaseToPickupMinutes;

  return {
    ok: true,
    provider: "google_distance_matrix",
    baseAddress: input.baseAddress,
    distanceKm: chargeableDistanceKm,
    durationMinutes: chargeableTravelMinutes,
    chargeableDistanceKm,
    chargeableTravelMinutes,
    baseToPickup: {
      distanceKm: baseToPickup.distanceKm,
      durationMinutes: baseToPickup.durationMinutes
    },
    pickupToDropoff: {
      distanceKm: pickupToDropoff.distanceKm,
      durationMinutes: pickupToDropoff.durationMinutes
    },
    dropoffToBase: {
      distanceKm: dropoffToBase.distanceKm,
      durationMinutes: dropoffToBase.durationMinutes
    }
  };
}
