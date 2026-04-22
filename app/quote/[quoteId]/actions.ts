"use server";

import { acceptQuote, beginBookingCheckout } from "@/lib/core/booking/rpc-client";
import {
  getQuoteCheckoutFailureMessage,
  getQuoteCheckoutFieldErrors,
  parseQuoteCheckoutFormData,
  type QuoteCheckoutFormState
} from "@/lib/core/booking/quote-checkout";
import { createSupabaseRpcClient } from "@/lib/core/booking/supabase-rpc-client";
import { createSupabaseAdminClient } from "@/lib/database/supabase/admin";

export async function beginQuoteCheckout(
  _previousState: QuoteCheckoutFormState,
  formData: FormData
): Promise<QuoteCheckoutFormState> {
  const parsed = parseQuoteCheckoutFormData(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the checkout request and try again.",
      fieldErrors: getQuoteCheckoutFieldErrors(parsed.error)
    };
  }

  try {
    const supabase = createSupabaseAdminClient();
    const rpcClient = createSupabaseRpcClient(supabase);
    const correlationId = parsed.data.idempotencyKey;

    const accepted = await acceptQuote(rpcClient, {
      idempotencyKey: `${parsed.data.idempotencyKey}:accept`,
      correlationId,
      actor: {
        type: "customer"
      },
      quoteId: parsed.data.quoteId
    });

    if (!accepted.ok) {
      return {
        status: "error",
        code: accepted.code,
        message: getQuoteCheckoutFailureMessage(accepted.code)
      };
    }

    const checkout = await beginBookingCheckout(rpcClient, {
      idempotencyKey: `${parsed.data.idempotencyKey}:checkout`,
      correlationId,
      actor: {
        type: "customer"
      },
      quoteId: parsed.data.quoteId,
      holdMinutes: parsed.data.holdMinutes
    });

    if (!checkout.ok) {
      return {
        status: "error",
        code: checkout.code,
        message: getQuoteCheckoutFailureMessage(checkout.code)
      };
    }

    return {
      status: "success",
      code: checkout.code,
      message: "Booking hold created. The deposit checkout can now use this hold safely.",
      bookingId: checkout.data.bookingId,
      heldUntil: checkout.data.heldUntil,
      paymentIntentInput: checkout.data.paymentIntentInput
    };
  } catch (error) {
    return {
      status: "error",
      code: "INTERNAL_TRANSITION_FAILED",
      message:
        error instanceof Error && error.message.includes("Supabase")
          ? "Supabase is not configured for checkout yet."
          : "Something went wrong starting checkout."
    };
  }
}
