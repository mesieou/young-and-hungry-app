import {
  getRecommendedTruckClassForServiceType,
  getQuoteRequestFieldErrors,
  isUnavailableServiceType,
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
        phone: "0412 345 678",
        pickupAddress: "South Yarra VIC",
        dropoffAddress: "Richmond VIC",
        truckClass: "four_tonne",
        serviceType: "small_move",
        preferredDate: "2026-05-01",
        preferredTimeWindow: "morning_0700_1000",
        notes: "Two flights of stairs."
      })
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("juan@example.com");
      expect(result.data.phone).toBe("+61412345678");
      expect(result.data.truckClass).toBe("four_tonne");
      expect(result.data.serviceType).toBe("small_move");
      expect(result.data.preferredTimeWindow).toBe("morning_0700_1000");
    }
  });

  it("requires a phone number even when email is provided", () => {
    const result = quoteRequestSchema.safeParse({
      idempotencyKey: "quote-request-key-2",
      name: "Juan Customer",
      email: "juan@example.com",
      phone: "",
      pickupAddress: "South Yarra VIC",
      dropoffAddress: "Richmond VIC",
      truckClass: "six_tonne",
      serviceType: "removal",
      preferredDate: "2026-05-01",
      preferredTimeWindow: "midday_1000_1300",
      notes: "Boxes and small furniture."
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(getQuoteRequestFieldErrors(result.error).phone).toBe("Enter your phone number.");
    }
  });

  it("requires a preferred date", () => {
    const result = parseQuoteRequestFormData(
      makeFormData({
        idempotencyKey: "quote-request-key-missing-date",
        name: "Juan Customer",
        email: "juan@example.com",
        phone: "0412 345 678",
        pickupAddress: "South Yarra VIC",
        dropoffAddress: "Richmond VIC",
        truckClass: "four_tonne",
        serviceType: "small_move",
        preferredDate: "",
        preferredTimeWindow: "morning_0700_1000",
        notes: "Boxes and small furniture."
      })
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(getQuoteRequestFieldErrors(result.error).preferredDate).toBe("Choose the move date.");
    }
  });

  it("requires a preferred time window", () => {
    const result = parseQuoteRequestFormData(
      makeFormData({
        idempotencyKey: "quote-request-key-missing-time",
        name: "Juan Customer",
        email: "juan@example.com",
        phone: "0412 345 678",
        pickupAddress: "South Yarra VIC",
        dropoffAddress: "Richmond VIC",
        truckClass: "four_tonne",
        serviceType: "small_move",
        preferredDate: "2026-05-01",
        preferredTimeWindow: "",
        notes: "Boxes and small furniture."
      })
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(getQuoteRequestFieldErrors(result.error).preferredTimeWindow).toBe("Choose a preferred time window.");
    }
  });

  it("requires move details", () => {
    const result = parseQuoteRequestFormData(
      makeFormData({
        idempotencyKey: "quote-request-key-missing-notes",
        name: "Juan Customer",
        email: "juan@example.com",
        phone: "0412 345 678",
        pickupAddress: "South Yarra VIC",
        dropoffAddress: "Richmond VIC",
        truckClass: "four_tonne",
        serviceType: "small_move",
        preferredDate: "2026-05-01",
        preferredTimeWindow: "morning_0700_1000",
        notes: ""
      })
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(getQuoteRequestFieldErrors(result.error).notes).toBe("Enter move details.");
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
        serviceType: "apartment_move",
        preferredDate: "2026-05-01",
        preferredTimeWindow: "morning_0700_1000",
        notes: "Two flights of stairs."
      })
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBe("+61412345678");
    }
  });

  it("rejects invalid truck classes", () => {
    const result = parseQuoteRequestFormData(
      makeFormData({
        idempotencyKey: "quote-request-key-truck",
        name: "Juan Customer",
        email: "juan@example.com",
        phone: "0412 345 678",
        pickupAddress: "South Yarra VIC",
        dropoffAddress: "Richmond VIC",
        truckClass: "ten_tonne",
        serviceType: "apartment_two_bed",
        preferredDate: "2026-05-01",
        preferredTimeWindow: "morning_0700_1000",
        notes: "Two flights of stairs."
      })
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(getQuoteRequestFieldErrors(result.error).truckClass).toBe("Choose what you are moving.");
    }
  });

  it("recommends truck class from move type and size", () => {
    expect(getRecommendedTruckClassForServiceType("delivery_run")).toBe("four_tonne");
    expect(getRecommendedTruckClassForServiceType("small_move")).toBe("four_tonne");
    expect(getRecommendedTruckClassForServiceType("apartment_studio")).toBe("four_tonne");
    expect(getRecommendedTruckClassForServiceType("apartment_one_bed")).toBe("four_tonne");
    expect(getRecommendedTruckClassForServiceType("house_one_bed")).toBe("four_tonne");
    expect(getRecommendedTruckClassForServiceType("apartment_two_bed")).toBe("six_tonne");
    expect(getRecommendedTruckClassForServiceType("apartment_three_bed")).toBe("six_tonne");
    expect(getRecommendedTruckClassForServiceType("house_two_bed")).toBe("six_tonne");
    expect(getRecommendedTruckClassForServiceType("house_three_bed")).toBe("six_tonne");
    expect(getRecommendedTruckClassForServiceType("house_four_plus")).toBeUndefined();
    expect(isUnavailableServiceType("house_four_plus")).toBe(true);
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
        truckClass: "six_tonne",
        serviceType: "apartment_move",
        preferredDate: "2026-05-01",
        preferredTimeWindow: "midday_1000_1300",
        notes: "Two flights of stairs."
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
        phone: "",
        pickupAddress: "",
        dropoffAddress: "R",
        truckClass: "",
        serviceType: "removal",
        preferredDate: "",
        preferredTimeWindow: "",
        notes: ""
      })
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = getQuoteRequestFieldErrors(result.error);
      expect(errors.idempotencyKey).toBe("Missing request key.");
      expect(errors.name).toBe("Enter your name.");
      expect(errors.email).toBe("Enter a valid email.");
      expect(errors.phone).toBe("Enter your phone number.");
      expect(errors.pickupAddress).toBe("Enter the pickup address.");
      expect(errors.dropoffAddress).toBe("Enter the dropoff address.");
      expect(errors.truckClass).toBe("Choose what you are moving.");
      expect(errors.preferredDate).toBe("Choose the move date.");
      expect(errors.preferredTimeWindow).toBe("Choose a preferred time window.");
      expect(errors.notes).toBe("Enter move details.");
    }
  });
});
