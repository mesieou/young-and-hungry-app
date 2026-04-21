import { submitQuoteRequest } from "@/app/quote/actions";
import { YH_DEFAULT_BUSINESS } from "@/lib/business/config";
import { createSupabaseAdminClient } from "@/lib/database/supabase/admin";

jest.mock("@/lib/database/supabase/admin", () => ({
  createSupabaseAdminClient: jest.fn()
}));

const mockCreateSupabaseAdminClient = jest.mocked(createSupabaseAdminClient);

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
    serviceType: "apartment_move",
    preferredDate: "2026-05-01",
    notes: "Two flights of stairs.",
    ...overrides
  });
}

describe("submitQuoteRequest", () => {
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
  });

  it("submits valid requests through the create_quote RPC", async () => {
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

    const result = await submitQuoteRequest({ status: "idle", message: "" }, validFormData());

    expect(result).toMatchObject({
      status: "success",
      quoteId: "11111111-1111-4111-8111-111111111111"
    });

    expect(rpc).toHaveBeenCalledWith("create_quote", {
      p_command: expect.objectContaining({
        idempotencyKey: "quote-action-request-key",
        correlationId: "quote-action-request-key",
        businessId: YH_DEFAULT_BUSINESS.id,
        customerName: "Juan Customer",
        customerEmail: "juan@example.com",
        pickupAddress: "South Yarra VIC",
        dropoffAddress: "Richmond VIC",
        serviceType: "apartment_move",
        jobBlockMinutes: YH_DEFAULT_BUSINESS.defaultJobBlockMinutes,
        depositCents: YH_DEFAULT_BUSINESS.defaultDepositCents,
        pricingVersion: "lead-capture-v1",
        actor: {
          type: "customer"
        },
        breakdown: expect.objectContaining({
          source: "youngandh.co/quote",
          preferredDate: "2026-05-01",
          notes: "Two flights of stairs.",
          mode: "lead_capture"
        })
      })
    });
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
  });
});
