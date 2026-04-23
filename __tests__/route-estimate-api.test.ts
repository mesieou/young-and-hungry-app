import { POST } from "@/app/api/quote/route-estimate/route";
import { YH_DEFAULT_BUSINESS } from "@/lib/business/config";
import { getMoveRouteDistanceEstimate } from "@/lib/core/pricing/google-distance";

jest.mock("@/lib/core/pricing/google-distance", () => ({
  getMoveRouteDistanceEstimate: jest.fn(async () => ({
    ok: true,
    provider: "google_distance_matrix",
    baseAddress: "Melbourne VIC, Australia",
    distanceKm: 18.5,
    durationMinutes: 50,
    chargeableDistanceKm: 18.5,
    chargeableTravelMinutes: 50,
    baseToPickup: {
      distanceKm: 8,
      durationMinutes: 20
    },
    pickupToDropoff: {
      distanceKm: 8.5,
      durationMinutes: 22
    },
    dropoffToBase: {
      distanceKm: 10,
      durationMinutes: 28
    }
  }))
}));

const mockGetMoveRouteDistanceEstimate = jest.mocked(getMoveRouteDistanceEstimate);

describe("quote route estimate API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns distance and duration for valid route inputs", async () => {
    const response = await POST(
      {
        json: async () => ({
          pickupAddress: "South Yarra VIC",
          dropoffAddress: "Richmond VIC"
        })
      } as Request
    );

    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      distanceKm: 18.5,
      durationMinutes: 50,
      pickupToDropoff: {
        distanceKm: 8.5,
        durationMinutes: 22
      }
    });
    expect(mockGetMoveRouteDistanceEstimate).toHaveBeenCalledWith({
      baseAddress: YH_DEFAULT_BUSINESS.operationsBaseAddress,
      pickupAddress: "South Yarra VIC",
      dropoffAddress: "Richmond VIC",
      freeBaseToPickupMinutes: 60
    });
  });

  it("rejects missing addresses", async () => {
    const response = await POST(
      {
        json: async () => ({
          pickupAddress: "",
          dropoffAddress: "Richmond VIC"
        })
      } as Request
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      code: "INVALID_ROUTE_INPUT"
    });
    expect(mockGetMoveRouteDistanceEstimate).not.toHaveBeenCalled();
  });
});
