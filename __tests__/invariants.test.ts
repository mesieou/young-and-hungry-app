import { criticalFailureCodes } from "@/lib/core/failure-codes";
import { bookingStatuses, outboxJobStates, paymentStatuses, quoteStatuses } from "@/lib/core/status";

describe("critical-core contracts", () => {
  it("defines the required quote lifecycle states", () => {
    expect(quoteStatuses).toEqual(["draft", "estimated", "sent", "accepted", "expired", "cancelled"]);
  });

  it("defines the required booking lifecycle states", () => {
    expect(bookingStatuses).toEqual([
      "pending_deposit",
      "confirmed",
      "in_progress",
      "completed",
      "cancelled",
      "expired_hold",
      "failed_recovery"
    ]);
  });

  it("defines the required payment lifecycle states", () => {
    expect(paymentStatuses).toEqual(["pending", "authorized", "paid", "failed", "refunded", "disputed"]);
  });

  it("defines required critical failure codes", () => {
    expect(criticalFailureCodes).toContain("BUCKET_CONFLICT");
    expect(criticalFailureCodes).toContain("IDEMPOTENCY_CONFLICT");
    expect(criticalFailureCodes).toContain("PAYMENT_TARGET_INVALID");
  });

  it("defines outbox job terminal and retry states", () => {
    expect(outboxJobStates).toEqual(["queued", "processing", "succeeded", "failed", "dead_letter"]);
  });
});
