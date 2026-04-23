import { buildOpsQuoteReviewEmail, notifyOpsQuoteReview } from "@/lib/core/notifications/ops-quote-review";

describe("ops quote review email", () => {
  const envBackup = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...envBackup
    };
  });

  afterAll(() => {
    process.env = envBackup;
  });

  const request = {
    idempotencyKey: "quote-request-key-1",
    name: "Juan Customer",
    email: "juan@example.com",
    phone: "+61400000000",
    pickupAddress: "South Yarra VIC",
    dropoffAddress: "Richmond VIC",
    truckClass: "six_tonne",
    serviceType: "apartment_move",
    preferredDate: "2026-05-01",
    preferredTimeWindow: "afternoon_1300_1600",
    notes: "Two flights of stairs."
  } as const;

  it("builds a structured email with all quote review details", () => {
    const email = buildOpsQuoteReviewEmail({
      quoteId: "11111111-1111-4111-8111-111111111111",
      request,
      submittedAt: new Date("2026-04-22T00:00:00.000Z")
    });

    expect(email.subject).toContain("South Yarra VIC -> Richmond VIC");
    expect(email.text).toContain("Quote ID: 11111111-1111-4111-8111-111111111111");
    expect(email.text).toContain("Name: Juan Customer");
    expect(email.text).toContain("Email: juan@example.com");
    expect(email.text).toContain("Phone: +61400000000");
    expect(email.text).toContain("Truck class: 6 tonne truck");
    expect(email.text).toContain("Estimated quote: $448 - $617");
    expect(email.text).toContain("Pricing version: yh-pricebook-2026-04-23-v1");
    expect(email.text).toContain("Preferred date: 2026-05-01");
    expect(email.text).toContain("Preferred time: Afternoon");
    expect(email.text).toContain("Two flights of stairs.");
    expect(email.html).toContain("New quote request");
  });

  it("records a failed notification and ops issue when email is not configured", async () => {
    delete process.env.OPS_QUOTE_EMAIL;
    delete process.env.RESEND_API_KEY;
    delete process.env.EMAIL_FROM;

    const insert = jest.fn(async () => ({ error: null }));
    const upsert = jest.fn(async () => ({ error: null }));
    const from = jest.fn(() => ({ insert, upsert }));

    const result = await notifyOpsQuoteReview(
      { from },
      {
        quoteId: "11111111-1111-4111-8111-111111111111",
        request
      }
    );

    expect(result.ok).toBe(false);
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: "email",
        recipient: "unconfigured",
        template: "ops_quote_review_v1",
        state: "failed",
        attempts: 0
      })
    );
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        category: "notification",
        title: "Quote review email was not sent",
        dedupe_key: "ops-quote-email:11111111-1111-4111-8111-111111111111"
      }),
      {
        onConflict: "dedupe_key"
      }
    );
  });
});
