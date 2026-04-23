import {
  getQuoteRequestFieldErrors,
  normalizeAustralianPhone,
  parseQuoteRequestFormData,
  quoteRequestSchema
} from "@/lib/core/booking/quote-request";

function makeFormData(values: Record<string, string>) {
  const formData = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    formData.set(key, value);
  });

  return formData;
}

describe("quote request validation", () => {
  it("accepts a valid stage-one quote request", () => {
    const result = parseQuoteRequestFormData(
      makeFormData({
        idempotencyKey: "quote-request-key-1",
        name: "Juan Customer",
        email: "juan@example.com",
        phone: "",
        pickupAddress: "South Yarra VIC",
        dropoffAddress: "Richmond VIC",
        truckClass: "four_tonne",
        serviceType: "apartment_move",
        preferredDate: "2026-05-01",
        preferredTimeWindow: "morning_0700_1000",
        notes: "Two flights of stairs."
      })
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("juan@example.com");
      expect(result.data.phone).toBeUndefined();
      expect(result.data.truckClass).toBe("four_tonne");
      expect(result.data.serviceType).toBe("apartment_move");
      expect(result.data.preferredTimeWindow).toBe("morning_0700_1000");
    }
  });

  it("requires either email or phone", () => {
    const result = quoteRequestSchema.safeParse({
      idempotencyKey: "quote-request-key-2",
      name: "Juan Customer",
      pickupAddress: "South Yarra VIC",
      dropoffAddress: "Richmond VIC",
      truckClass: "four_tonne",
      serviceType: "removal"
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(getQuoteRequestFieldErrors(result.error).email).toBe("Enter an email or phone number.");
    }
  });

  it("normalizes Australian phone numbers to E.164 like Skedy validation", () => {
    expect(normalizeAustralianPhone("0412 345 678")).toBe("+61412345678");
    expect(normalizeAustralianPhone("412345678")).toBe("+61412345678");
    expect(normalizeAustralianPhone("+61 412 345 678")).toBe("+61412345678");

    const result = parseQuoteRequestFormData(
      makeFormData({
        idempotencyKey: "quote-request-key-phone",
        name: "Juan Customer",
        email: "",
        phone: "0412 345 678",
        pickupAddress: "South Yarra VIC",
        dropoffAddress: "Richmond VIC",
        truckClass: "four_tonne",
        serviceType: "apartment_move"
      })
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBe("+61412345678");
    }
  });

  it("rejects invalid phone numbers instead of silently dropping them", () => {
    const result = parseQuoteRequestFormData(
      makeFormData({
        idempotencyKey: "quote-request-key-invalid-phone",
        name: "Juan Customer",
        email: "juan@example.com",
        phone: "1234",
        pickupAddress: "South Yarra VIC",
        dropoffAddress: "Richmond VIC",
        truckClass: "four_tonne",
        serviceType: "apartment_move"
      })
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(getQuoteRequestFieldErrors(result.error).phone).toBe("Enter a valid Australian phone number.");
    }
  });

  it("maps field validation errors into form state keys", () => {
    const result = parseQuoteRequestFormData(
      makeFormData({
        idempotencyKey: "short",
        name: "",
        email: "not-an-email",
        pickupAddress: "",
        dropoffAddress: "R",
        truckClass: "",
        serviceType: "removal"
      })
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = getQuoteRequestFieldErrors(result.error);
      expect(errors.idempotencyKey).toBe("Missing request key.");
      expect(errors.name).toBe("Enter your name.");
      expect(errors.email).toBe("Enter a valid email.");
      expect(errors.pickupAddress).toBe("Enter the pickup address.");
      expect(errors.dropoffAddress).toBe("Enter the dropoff address.");
      expect(errors.truckClass).toBe("Choose a truck class.");
    }
  });
});
