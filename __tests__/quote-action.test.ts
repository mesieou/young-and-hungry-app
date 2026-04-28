import { submitQuoteRequest } from "@/app/quote/actions";
import { YH_DEFAULT_BUSINESS } from "@/lib/business/config";
import { createSupabaseAdminClient } from "@/lib/database/supabase/admin";
import { notifyOpsQuoteReview } from "@/lib/core/notifications/ops-quote-review";
import { YH_PRICEBOOK_VERSION } from "@/lib/core/pricing/young-hungry-pricebook";
import { getMoveRouteDistanceEstimate } from "@/lib/core/pricing/google-distance";

jest.mock("@/lib/database/supabase/admin", () => ({
  createSupabaseAdminClient: jest.fn()
}));

jest.mock("@/lib/core/notifications/ops-quote-review", () => ({
  notifyOpsQuoteReview: jest.fn(async () => ({
    ok: true,
    email: {
      ok: true,
      provider: "resend",
      providerMessageId: "email_123"
    }
  }))
}));

jest.mock("@/lib/core/pricing/google-distance", () => ({
  getMoveRouteDistanceEstimate: jest.fn(async () => ({
    ok: true,
    provider: "google_directions",
    baseAddress: "Sims St, West Melbourne VIC 3003",
    distanceKm: 28.4,
    durationMinutes: 63,
    chargeableDistanceKm: 28.4,
    chargeableTravelMinutes: 63,
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
  }))
}));

const mockCreateSupabaseAdminClient = jest.mocked(createSupabaseAdminClient);
const mockNotifyOpsQuoteReview = jest.mocked(notifyOpsQuoteReview);
const mockGetMoveRouteDistanceEstimate = jest.mocked(getMoveRouteDistanceEstimate);

function makeFormData(values: Record<string, string>) {
  const formData = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    formData.set(key, value);
  });

  return formData;
}

function validFormData(overrides: Record<string, string> = {}) {
  return makeFormData({
    idempotencyKey: "quote-action-request-key",
    name: "Juan Customer",
    email: "juan@example.com",
    phone: "",
    pickupAddress: "South Yarra VIC",
    dropoffAddress: "Richmond VIC",
    truckClass: "four_tonne",
    serviceType: "apartment_two_bed",
    preferredDate: "2026-05-01",
    preferredTimeWindow: "morning_0700_1000",
    notes: "Two flights of stairs.",
    ...overrides
  });
}

describe("submitQuoteRequest", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not call Supabase when validation fails", async () => {
    const result = await submitQuoteRequest(
      { status: "idle", message: "" },
      makeFormData({
        idempotencyKey: "short",
        name: "",
        pickupAddress: "",
        dropoffAddress: ""
      })
    );

    expect(result.status).toBe("error");
    expect(result.fieldErrors?.name).toBe("Enter your name.");
    expect(mockCreateSupabaseAdminClient).not.toHaveBeenCalled();
    expect(mockNotifyOpsQuoteReview).not.toHaveBeenCalled();
  });

  it("submits valid requests through the create_quote RPC and emails ops", async () => {
    const rpc = jest.fn(async () => ({
      data: {
        ok: true,
        code: "QUOTE_CREATED",
        data: {
          quoteId: "11111111-1111-4111-8111-111111111111",
          status: "estimated"
        }
      },
      error: null
    }));

    mockCreateSupabaseAdminClient.mockReturnValue({ rpc } as never);

    const result = await submitQuoteRequest(
      { status: "idle", message: "" },
      validFormData({
        phone: "0412 345 678"
      })
    );

    expect(result).toMatchObject({
      status: "success",
      quoteId: "11111111-1111-4111-8111-111111111111"
    });

    expect(mockGetMoveRouteDistanceEstimate).toHaveBeenCalledWith({
      baseAddress: YH_DEFAULT_BUSINESS.operationsBaseAddress,
      pickupAddress: "South Yarra VIC",
      dropoffAddress: "Richmond VIC"
    });
    expect(rpc).toHaveBeenCalledWith("create_quote", {
      p_command: expect.objectContaining({
        idempotencyKey: "quote-action-request-key",
        correlationId: "quote-action-request-key",
        businessId: YH_DEFAULT_BUSINESS.id,
        customerName: "Juan Customer",
        customerEmail: "juan@example.com",
        customerPhone: "+61412345678",
        pickupAddress: "South Yarra VIC",
        dropoffAddress: "Richmond VIC",
        serviceType: "apartment_two_bed",
        jobBlockMinutes: 210,
        priceCents: 67898,
        depositCents: YH_DEFAULT_BUSINESS.defaultDepositCents,
        pricingVersion: YH_PRICEBOOK_VERSION,
        actor: {
          type: "customer"
        },
        breakdown: expect.objectContaining({
          source: "youngandh.co/quote",
          quoteFlowVersion: "lugg_style_5_step_v1",
          routeDistance: expect.objectContaining({
            ok: true,
            distanceKm: 28.4,
            durationMinutes: 63
          }),
          quoteEstimate: expect.objectContaining({
            priceCents: 67898,
            rangeLowCents: 67898,
            rangeHighCents: 76348,
            billableMinutes: 210,
            routeDistanceKm: 28.4,
            routeDurationMinutes: 63,
            routePricingIncluded: true,
            pricingVersion: YH_PRICEBOOK_VERSION
          }),
          preferredDate: "2026-05-01",
          preferredTimeWindow: "morning_0700_1000",
          pricingInputs: {
            truckClass: "six_tonne",
            preferredTimeWindow: "morning_0700_1000",
            serviceType: "apartment_two_bed"
          },
          notes: "Two flights of stairs.",
          mode: "lead_capture"
        })
      })
    });
    expect(mockNotifyOpsQuoteReview).toHaveBeenCalledWith(
      { rpc },
      {
        quoteId: "11111111-1111-4111-8111-111111111111",
        request: expect.objectContaining({
          name: "Juan Customer",
          email: "juan@example.com",
          phone: "+61412345678",
          pickupAddress: "South Yarra VIC",
          dropoffAddress: "Richmond VIC",
          truckClass: "six_tonne",
          preferredTimeWindow: "morning_0700_1000",
          notes: "Two flights of stairs."
        }),
        quoteEstimate: expect.objectContaining({
          priceCents: 67898,
          rangeLabel: "$679 - $764"
        })
      }
    );
  });

  it("returns a safe error when the RPC rejects the quote request", async () => {
    const rpc = jest.fn(async () => ({
      data: {
        ok: false,
        code: "INTERNAL_TRANSITION_FAILED",
        message: "internal failure"
      },
      error: null
    }));

    mockCreateSupabaseAdminClient.mockReturnValue({ rpc } as never);

    const result = await submitQuoteRequest({ status: "idle", message: "" }, validFormData());

    expect(result.status).toBe("error");
    expect(result.message).toContain("could not submit");
    expect(mockNotifyOpsQuoteReview).not.toHaveBeenCalled();
  });
});
