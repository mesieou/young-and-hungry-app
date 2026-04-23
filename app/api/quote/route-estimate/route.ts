import { NextResponse } from "next/server";
import { YH_DEFAULT_BUSINESS } from "@/lib/business/config";
import { getMoveRouteDistanceEstimate } from "@/lib/core/pricing/google-distance";
import { YH_BILLING_RULES } from "@/lib/core/pricing/young-hungry-pricebook";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    pickupAddress?: unknown;
    dropoffAddress?: unknown;
  } | null;
  const pickupAddress = typeof body?.pickupAddress === "string" ? body.pickupAddress.trim() : "";
  const dropoffAddress = typeof body?.dropoffAddress === "string" ? body.dropoffAddress.trim() : "";

  if (pickupAddress.length < 3 || dropoffAddress.length < 3) {
    return NextResponse.json(
      {
        ok: false,
        code: "INVALID_ROUTE_INPUT",
        message: "Pickup and dropoff addresses are required."
      },
      {
        status: 400
      }
    );
  }

  const result = await getMoveRouteDistanceEstimate({
    baseAddress: YH_DEFAULT_BUSINESS.operationsBaseAddress,
    pickupAddress,
    dropoffAddress,
    freeBaseToPickupMinutes: YH_BILLING_RULES.freeBaseToPickupMinutes
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 200
  });
}
