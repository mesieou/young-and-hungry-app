/**
 * @jest-environment node
 */

import { createClient } from "@supabase/supabase-js";
import {
  acceptQuote,
  beginBookingCheckout,
  confirmPaidBooking,
  createQuote,
  type RpcClient
} from "@/lib/core/booking/rpc-client";
import { YH_DEFAULT_BUSINESS } from "@/lib/business/config";

const hasDbEnv = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);
const describeDb = hasDbEnv ? describe : describe.skip;

describeDb("booking/payment RPC integration", () => {
  let supabase: ReturnType<typeof createClient>;
  let rpcClient: RpcClient;
  const runId = `jest-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const quoteIds: string[] = [];
  const bookingIds: string[] = [];
  const commandKeys: string[] = [];
  const providerEventIds: string[] = [];

  beforeAll(() => {
    supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    rpcClient = supabase as unknown as RpcClient;
  });

  function key(label: string) {
    const idempotencyKey = `${runId}-${label}`;
    commandKeys.push(idempotencyKey);
    return idempotencyKey;
  }

  function requireOk<T extends { ok: boolean }>(result: T): asserts result is T & { ok: true } {
    if (!result.ok) {
      throw new Error(JSON.stringify(result, null, 2));
    }
  }

  afterAll(async () => {
    if (bookingIds.length > 0) {
      await supabase.from("booking_bucket_locks").delete().in("booking_id", bookingIds);
      await supabase.from("payments").delete().in("booking_id", bookingIds);
      await supabase.from("domain_events").delete().eq("aggregate_type", "booking").in("aggregate_id", bookingIds);
      await supabase.from("bookings").delete().in("id", bookingIds);
    }

    if (quoteIds.length > 0) {
      await supabase.from("domain_events").delete().eq("aggregate_type", "quote").in("aggregate_id", quoteIds);
      await supabase.from("quotes").delete().in("id", quoteIds);
    }

    if (providerEventIds.length > 0) {
      await supabase.from("ops_issues").delete().in(
        "dedupe_key",
        providerEventIds.map((eventId) => `late-payment:${eventId}`)
      );
    }

    if (commandKeys.length > 0) {
      await supabase.from("command_dedup").delete().in("idempotency_key", commandKeys);
    }
  });

  it("runs quote -> accept -> hold -> payment confirmation through RPC wrappers", async () => {
    const createKey = key("create");
    const quoteCommand = {
      idempotencyKey: createKey,
      correlationId: createKey,
      actor: { type: "customer" as const },
      businessId: YH_DEFAULT_BUSINESS.id,
      customerName: "Integration Customer",
      customerEmail: "integration@example.com",
      pickupAddress: "South Yarra VIC",
      dropoffAddress: "Richmond VIC",
      serviceType: "apartment_move",
      jobStartAt: "2026-07-01T09:00:00+00:00",
      jobBlockMinutes: 60,
      depositCents: 10000,
      pricingVersion: "integration-v1",
      breakdown: { source: "jest-integration" }
    };
    const quote = await createQuote(rpcClient, quoteCommand);

    requireOk(quote);
    expect(quote.ok).toBe(true);

    quoteIds.push(quote.data.quoteId);

    const replay = await createQuote(rpcClient, quoteCommand);
    expect(replay.ok).toBe(true);
    if (replay.ok) {
      expect(replay.data.quoteId).toBe(quote.data.quoteId);
    }

    const conflict = await createQuote(rpcClient, {
      ...quoteCommand,
      customerName: "Different Customer"
    });
    expect(conflict.ok).toBe(false);
    expect(conflict.code).toBe("IDEMPOTENCY_CONFLICT");

    const accepted = await acceptQuote(rpcClient, {
      idempotencyKey: key("accept"),
      actor: { type: "customer" },
      quoteId: quote.data.quoteId
    });
    expect(accepted.ok).toBe(true);

    const checkout = await beginBookingCheckout(rpcClient, {
      idempotencyKey: key("checkout"),
      actor: { type: "customer" },
      quoteId: quote.data.quoteId,
      holdMinutes: 15
    });
    requireOk(checkout);
    expect(checkout.ok).toBe(true);
    expect(checkout.code).toBe("BOOKING_HOLD_CREATED");
    bookingIds.push(checkout.data.bookingId);

    const providerEventId = `${runId}-evt-confirm`;
    providerEventIds.push(providerEventId);
    const confirmed = await confirmPaidBooking(rpcClient, {
      idempotencyKey: key("confirm"),
      actor: { type: "system" },
      bookingId: checkout.data.bookingId,
      provider: "stripe",
      providerEventId,
      providerPaymentIntentId: `${runId}-pi-confirm`,
      amountCents: 10000
    });

    expect(confirmed.ok).toBe(true);
    expect(confirmed.code).toBe("BOOKING_CONFIRMED");

    const providerReplay = await confirmPaidBooking(rpcClient, {
      idempotencyKey: key("confirm-provider-replay"),
      actor: { type: "system" },
      bookingId: checkout.data.bookingId,
      provider: "stripe",
      providerEventId,
      providerPaymentIntentId: `${runId}-pi-confirm`,
      amountCents: 10000
    });

    expect(providerReplay.ok).toBe(true);
    expect(providerReplay.code).toBe("PAYMENT_ALREADY_PROCESSED");
  });

  it("rejects overlapping checkout attempts with BUCKET_CONFLICT", async () => {
    const quoteA = await createQuote(rpcClient, {
      idempotencyKey: key("conflict-create-a"),
      actor: { type: "customer" },
      businessId: YH_DEFAULT_BUSINESS.id,
      customerName: "Conflict A",
      customerEmail: "conflict-a@example.com",
      pickupAddress: "Carlton VIC",
      dropoffAddress: "Fitzroy VIC",
      serviceType: "small_move",
      jobStartAt: "2026-07-02T09:00:00+00:00",
      jobBlockMinutes: 60,
      depositCents: 10000,
      pricingVersion: "integration-v1"
    });
    const quoteB = await createQuote(rpcClient, {
      idempotencyKey: key("conflict-create-b"),
      actor: { type: "customer" },
      businessId: YH_DEFAULT_BUSINESS.id,
      customerName: "Conflict B",
      customerEmail: "conflict-b@example.com",
      pickupAddress: "Carlton VIC",
      dropoffAddress: "Fitzroy VIC",
      serviceType: "small_move",
      jobStartAt: "2026-07-02T09:15:00+00:00",
      jobBlockMinutes: 60,
      depositCents: 10000,
      pricingVersion: "integration-v1"
    });

    requireOk(quoteA);
    requireOk(quoteB);
    expect(quoteA.ok).toBe(true);
    expect(quoteB.ok).toBe(true);

    quoteIds.push(quoteA.data.quoteId, quoteB.data.quoteId);

    await acceptQuote(rpcClient, {
      idempotencyKey: key("conflict-accept-a"),
      actor: { type: "customer" },
      quoteId: quoteA.data.quoteId
    });
    await acceptQuote(rpcClient, {
      idempotencyKey: key("conflict-accept-b"),
      actor: { type: "customer" },
      quoteId: quoteB.data.quoteId
    });

    const checkoutA = await beginBookingCheckout(rpcClient, {
      idempotencyKey: key("conflict-checkout-a"),
      actor: { type: "customer" },
      quoteId: quoteA.data.quoteId,
      holdMinutes: 15
    });
    requireOk(checkoutA);
    expect(checkoutA.ok).toBe(true);
    bookingIds.push(checkoutA.data.bookingId);

    const checkoutB = await beginBookingCheckout(rpcClient, {
      idempotencyKey: key("conflict-checkout-b"),
      actor: { type: "customer" },
      quoteId: quoteB.data.quoteId,
      holdMinutes: 15
    });

    expect(checkoutB.ok).toBe(false);
    expect(checkoutB.code).toBe("BUCKET_CONFLICT");
  });
});
