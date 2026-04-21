export const quoteStatuses = ["draft", "estimated", "sent", "accepted", "expired", "cancelled"] as const;
export type QuoteStatus = (typeof quoteStatuses)[number];

export const bookingStatuses = [
  "pending_deposit",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
  "expired_hold",
  "failed_recovery"
] as const;
export type BookingStatus = (typeof bookingStatuses)[number];

export const paymentStatuses = ["pending", "authorized", "paid", "failed", "refunded", "disputed"] as const;
export type PaymentStatus = (typeof paymentStatuses)[number];

export const outboxJobStates = ["queued", "processing", "succeeded", "failed", "dead_letter"] as const;
export type OutboxJobState = (typeof outboxJobStates)[number];
