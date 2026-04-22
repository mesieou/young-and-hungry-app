"use server";

import { createQuote } from "@/lib/core/booking/rpc-client";
import {
  getQuoteRequestFieldErrors,
  parseQuoteRequestFormData,
  type QuoteFormState
} from "@/lib/core/booking/quote-request";
import { createSupabaseRpcClient } from "@/lib/core/booking/supabase-rpc-client";
import { YH_DEFAULT_BUSINESS } from "@/lib/business/config";
import { createSupabaseAdminClient } from "@/lib/database/supabase/admin";

export async function submitQuoteRequest(
  _previousState: QuoteFormState,
  formData: FormData
): Promise<QuoteFormState> {
  const parsed = parseQuoteRequestFormData(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors: getQuoteRequestFieldErrors(parsed.error)
    };
  }

  try {
    const supabase = createSupabaseAdminClient();
    const rpcClient = createSupabaseRpcClient(supabase);

    const result = await createQuote(rpcClient, {
      idempotencyKey: parsed.data.idempotencyKey,
      correlationId: parsed.data.idempotencyKey,
      actor: {
        type: "customer"
      },
      businessId: YH_DEFAULT_BUSINESS.id,
      customerName: parsed.data.name,
      customerEmail: parsed.data.email,
      customerPhone: parsed.data.phone,
      pickupAddress: parsed.data.pickupAddress,
      dropoffAddress: parsed.data.dropoffAddress,
      serviceType: parsed.data.serviceType,
      jobBlockMinutes: YH_DEFAULT_BUSINESS.defaultJobBlockMinutes,
      depositCents: YH_DEFAULT_BUSINESS.defaultDepositCents,
      pricingVersion: "lead-capture-v1",
      breakdown: {
        source: "youngandh.co/quote",
        preferredDate: parsed.data.preferredDate,
        notes: parsed.data.notes,
        mode: "lead_capture"
      }
    });

    if (!result.ok) {
      return {
        status: "error",
        message: "We could not submit this quote request. The issue has enough detail for ops to diagnose.",
        fieldErrors: undefined
      };
    }

    return {
      status: "success",
      message: "Quote request received. Young & Hungry will review the job details and come back with the next step.",
      quoteId: result.data.quoteId
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error && error.message.includes("Supabase")
          ? "Supabase is not configured yet. Add the Y&H Supabase env vars before accepting live quote requests."
          : "Something went wrong submitting this quote request."
    };
  }
}
