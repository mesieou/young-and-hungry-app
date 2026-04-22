import { beginQuoteCheckout } from "@/app/quote/[quoteId]/actions";
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
    idempotencyKey: "quote-checkout-request-key",
    quoteId: "11111111-1111-4111-8111-111111111111",
    holdMinutes: "15",
    ...overrides
  });
}

describe("beginQuoteCheckout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not call Supabase when validation fails", async () => {
    const result = await beginQuoteCheckout(
      { status: "idle", message: "" },
      makeFormData({
        idempotencyKey: "short",
        quoteId: "not-a-uuid"
      })
    );

    expect(result.status).toBe("error");
    expect(result.fieldErrors?.idempotencyKey).toBe("Missing checkout request key.");
    expect(result.fieldErrors?.quoteId).toBe("Invalid quote ID.");
    expect(mockCreateSupabaseAdminClient).not.toHaveBeenCalled();
  });

  it("accepts the quote and creates a booking hold through RPCs", async () => {
    const rpc = jest.fn(async (fn: string) => {
      if (fn === "accept_quote") {
        return {
          data: {
            ok: true,
            code: "QUOTE_ACCEPTED",
            data: {
              quoteId: "11111111-1111-4111-8111-111111111111",
              status: "accepted"
            }
          },
          error: null
        };
      }

      return {
        data: {
          ok: true,
          code: "BOOKING_HOLD_CREATED",
          data: {
            bookingId: "22222222-2222-4222-8222-222222222222",
            quoteId: "11111111-1111-4111-8111-111111111111",
            status: "pending_deposit",
            heldUntil: "2026-05-01T00:15:00.000Z",
            paymentIntentInput: {
              amountCents: 10000,
              currency: "AUD",
              depositCents: 10000
            }
          }
        },
        error: null
      };
    });

    mockCreateSupabaseAdminClient.mockReturnValue({ rpc } as never);

    const result = await beginQuoteCheckout({ status: "idle", message: "" }, validFormData());

    expect(result).toMatchObject({
      status: "success",
      code: "BOOKING_HOLD_CREATED",
      bookingId: "22222222-2222-4222-8222-222222222222"
    });

    expect(rpc).toHaveBeenNthCalledWith(1, "accept_quote", {
      p_command: expect.objectContaining({
        idempotencyKey: "quote-checkout-request-key:accept",
        correlationId: "quote-checkout-request-key",
        actor: {
          type: "customer"
        },
        quoteId: "11111111-1111-4111-8111-111111111111"
      })
    });
    expect(rpc).toHaveBeenNthCalledWith(2, "begin_booking_checkout", {
      p_command: expect.objectContaining({
        idempotencyKey: "quote-checkout-request-key:checkout",
        correlationId: "quote-checkout-request-key",
        actor: {
          type: "customer"
        },
        quoteId: "11111111-1111-4111-8111-111111111111",
        holdMinutes: 15
      })
    });
  });

  it("stops before checkout when accepting the quote fails", async () => {
    const rpc = jest.fn(async () => ({
      data: {
        ok: false,
        code: "QUOTE_EXPIRED",
        message: "expired"
      },
      error: null
    }));

    mockCreateSupabaseAdminClient.mockReturnValue({ rpc } as never);

    const result = await beginQuoteCheckout({ status: "idle", message: "" }, validFormData());

    expect(result.status).toBe("error");
    expect(result.code).toBe("QUOTE_EXPIRED");
    expect(result.message).toContain("expired");
    expect(rpc).toHaveBeenCalledTimes(1);
  });

  it("returns a user-safe message when the quote is not bookable", async () => {
    const rpc = jest.fn(async (fn: string) => {
      if (fn === "accept_quote") {
        return {
          data: {
            ok: true,
            code: "QUOTE_ACCEPTED",
            data: {
              quoteId: "11111111-1111-4111-8111-111111111111",
              status: "accepted"
            }
          },
          error: null
        };
      }

      return {
        data: {
          ok: false,
          code: "QUOTE_NOT_BOOKABLE",
          message: "missing schedule"
        },
        error: null
      };
    });

    mockCreateSupabaseAdminClient.mockReturnValue({ rpc } as never);

    const result = await beginQuoteCheckout({ status: "idle", message: "" }, validFormData());

    expect(result.status).toBe("error");
    expect(result.code).toBe("QUOTE_NOT_BOOKABLE");
    expect(result.message).toContain("scheduled job window");
  });
});
