import {
  getMoveRouteDistanceEstimate,
  getRouteDistanceEstimate
} from "@/lib/core/pricing/google-distance";

describe("Google route distance estimate", () => {
  const envBackup = process.env;
  const fetchBackup = global.fetch;

  beforeEach(() => {
    process.env = {
      ...envBackup,
      GOOGLE_MAPS_API_KEY: "test-key"
    };
    global.fetch = jest.fn(async () =>
      ({
        ok: true,
        json: async () => ({
          status: "OK",
          rows: [
            {
              elements: [
                {
                  status: "OK",
                  distance: {
                    value: 12340
                  },
                  duration: {
                    value: 1680
                  }
                }
              ]
            }
          ]
        })
      } as Response)
    ) as jest.Mock;
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

  it("builds a full move route from base, pickup, dropoff, and return base", async () => {
    const result = await getMoveRouteDistanceEstimate({
      baseAddress: "Melbourne VIC",
      pickupAddress: "South Yarra VIC",
      dropoffAddress: "Richmond VIC"
    });

    expect(result).toMatchObject({
      ok: true,
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
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });
});
