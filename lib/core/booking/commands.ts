import type { BookingStatus, PaymentStatus, QuoteStatus } from "@/lib/core/status";
import type { CriticalFailureCode } from "@/lib/core/failure-codes";

export type CommandActor = {
  type: "customer" | "ops" | "system" | "voice";
  id?: string;
};

export type BaseCommand = {
  idempotencyKey: string;
  correlationId?: string;
  actor: CommandActor;
};

export type CommandResult<TData> =
  | {
      ok: true;
      code: string;
      data: TData;
    }
  | {
      ok: false;
      code: CriticalFailureCode;
      message: string;
      diagnostics?: Record<string, unknown>;
    };

export type CreateQuoteCommand = BaseCommand & {
  businessId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  pickupAddress?: string;
  dropoffAddress?: string;
  serviceType: string;
  jobStartAt?: string;
  jobBlockMinutes?: number;
  pricingVersion?: string;
  priceCents?: number;
  depositCents?: number;
  breakdown?: Record<string, unknown>;
};

export type QuoteCommandResult = {
  quoteId: string;
  status: QuoteStatus;
};

export type AcceptQuoteCommand = BaseCommand & {
  quoteId: string;
};

export type BeginBookingCheckoutCommand = BaseCommand & {
  quoteId: string;
  holdMinutes?: number;
};

export type BeginBookingCheckoutResult = {
  bookingId: string;
  quoteId: string;
  status: BookingStatus;
  heldUntil: string;
  paymentIntentInput: {
    amountCents: number;
    currency: "AUD";
    depositCents: number;
  };
};

export type ConfirmPaidBookingCommand = BaseCommand & {
  bookingId: string;
  provider: "stripe";
  providerEventId: string;
  providerPaymentIntentId: string;
  amountCents: number;
};

export type ConfirmPaidBookingResult = {
  bookingId: string;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
};

export type ExpireBookingHoldCommand = BaseCommand & {
  bookingId: string;
};

export type CancelBookingCommand = BaseCommand & {
  bookingId: string;
  reason?: string;
};

export type RescheduleBookingCommand = BaseCommand & {
  bookingId: string;
  jobStartAt: string;
  jobBlockMinutes: number;
};
