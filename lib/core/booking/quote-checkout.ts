import { z } from "zod";
import type { BeginBookingCheckoutResult } from "@/lib/core/booking/commands";
import type { CriticalFailureCode } from "@/lib/core/failure-codes";

export const quoteCheckoutSchema = z.object({
  idempotencyKey: z.string().trim().min(12, "Missing checkout request key."),
  quoteId: z.string().trim().uuid("Invalid quote ID."),
  holdMinutes: z.coerce.number().int().min(1).max(60).default(15)
});

export type QuoteCheckoutInput = z.infer<typeof quoteCheckoutSchema>;

export type QuoteCheckoutFormState = {
  status: "idle" | "success" | "error";
  message: string;
  code?: string;
  bookingId?: string;
  heldUntil?: string;
  paymentIntentInput?: BeginBookingCheckoutResult["paymentIntentInput"];
  fieldErrors?: Partial<Record<keyof QuoteCheckoutInput, string>>;
};

export const initialQuoteCheckoutFormState: QuoteCheckoutFormState = {
  status: "idle",
  message: ""
};

export function parseQuoteCheckoutFormData(formData: FormData) {
  return quoteCheckoutSchema.safeParse({
    idempotencyKey: formData.get("idempotencyKey"),
    quoteId: formData.get("quoteId"),
    holdMinutes: formData.get("holdMinutes") ?? 15
  });
}

export function getQuoteCheckoutFieldErrors(error: z.ZodError<QuoteCheckoutInput>) {
  const flattened = error.flatten().fieldErrors;

  return Object.fromEntries(
    Object.entries(flattened).map(([key, value]) => [key, value?.[0]])
  ) as Partial<Record<keyof QuoteCheckoutInput, string>>;
}

export function getQuoteCheckoutFailureMessage(code: CriticalFailureCode | string) {
  switch (code) {
    case "QUOTE_NOT_FOUND":
      return "This quote could not be found.";
    case "QUOTE_EXPIRED":
      return "This quote has expired. Request a refreshed quote before booking.";
    case "QUOTE_NOT_BOOKABLE":
      return "This quote still needs a scheduled job window before checkout can start.";
    case "BUCKET_CONFLICT":
      return "That slot is no longer available. Please request an updated time.";
    case "BOOKING_ALREADY_EXISTS_FOR_QUOTE":
      return "A booking already exists for this quote.";
    case "IDEMPOTENCY_CONFLICT":
      return "This checkout request was already used with different details. Refresh and try again.";
    default:
      return "We could not reserve the booking hold. Please try again.";
  }
}
