import {
  getMoveRouteDistanceEstimate,
  getRouteDistanceEstimate
} from "@/lib/core/pricing/google-distance";

describe("Google route distance estimate", () => {
  const envBackup = process.env;
  const fetchBackup = global.fetch;

  function distanceMatrixResponse(distanceMeters = 12340, durationSeconds = 1680) {
    return {
      ok: true,
      json: async () => ({
        status: "OK",
        rows: [
          {
            elements: [
              {
                status: "OK",
                distance: {
                  value: distanceMeters
                },
                duration: {
                  value: durationSeconds
                }
              }
            ]
          }
        ]
      })
    } as Response;
  }

  function directionsResponse(legs: Array<{ distanceMeters: number; durationSeconds: number }>) {
    return {
      ok: true,
      json: async () => ({
        status: "OK",
        routes: [
          {
            legs: legs.map((leg) => ({
              distance: {
                value: leg.distanceMeters
              },
              duration: {
                value: leg.durationSeconds
              }
            }))
          }
        ]
      })
    } as Response;
  }

  beforeEach(() => {
    process.env = {
      ...envBackup,
      GOOGLE_MAPS_API_KEY: "test-key"
    };
    global.fetch = jest.fn(async () => distanceMatrixResponse()) as jest.Mock;
  });

  afterEach(() => {
    global.fetch = fetchBackup;
    process.env = envBackup;
  });

  it("normalizes Google Distance Matrix data", async () => {
    const result = await getRouteDistanceEstimate({
      origin: "South Yarra VIC",
      destination: "Richmond VIC"
    });

    expect(result).toMatchObject({
      ok: true,
      distanceKm: 12.3,
      durationMinutes: 28,
      provider: "google_distance_matrix"
    });
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("distancematrix"));
  });

  it("returns a typed failure when no API key is configured", async () => {
    delete process.env.GOOGLE_MAPS_API_KEY;
    delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    await expect(
      getRouteDistanceEstimate({
        origin: "South Yarra VIC",
        destination: "Richmond VIC"
      })
    ).resolves.toMatchObject({
      ok: false,
      code: "DISTANCE_API_NOT_CONFIGURED"
    });
  });

  it("builds a full move route from one directions call with base, pickup, dropoff, and return base legs", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      directionsResponse([
        { distanceMeters: 12340, durationSeconds: 1680 },
        { distanceMeters: 12340, durationSeconds: 1680 },
        { distanceMeters: 12340, durationSeconds: 1680 }
      ])
    );

    const result = await getMoveRouteDistanceEstimate({
      baseAddress: "Melbourne VIC",
      pickupAddress: "South Yarra VIC",
      dropoffAddress: "Richmond VIC"
    });

    expect(result).toMatchObject({
      ok: true,
      provider: "google_directions",
      baseAddress: "Melbourne VIC",
      baseToPickup: {
        distanceKm: 12.3,
        durationMinutes: 28
      },
      pickupToDropoff: {
        distanceKm: 12.3,
        durationMinutes: 28
      },
      dropoffToBase: {
        distanceKm: 12.3,
        durationMinutes: 28
      },
      chargeableDistanceKm: 24.6,
      chargeableTravelMinutes: 56
    });
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("/directions/json?"));
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("origin=Melbourne+VIC"));
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("destination=Melbourne+VIC"));
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("waypoints=South+Yarra+VIC%7CRichmond+VIC"));
  });
});
