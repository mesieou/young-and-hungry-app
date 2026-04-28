"use server";

import { createQuote } from "@/lib/core/booking/rpc-client";
import { quoteFlowCopy } from "@/lib/content/site-copy";
import {
  getRecommendedTruckClassForServiceType,
  getQuoteRequestFieldErrors,
  parseQuoteRequestFormData,
  type QuoteFormState
} from "@/lib/core/booking/quote-request";
import { createSupabaseRpcClient } from "@/lib/core/booking/supabase-rpc-client";
import { notifyOpsQuoteReview } from "@/lib/core/notifications/ops-quote-review";
import { getMoveRouteDistanceEstimate } from "@/lib/core/pricing/google-distance";
import { calculateYoungHungryQuoteEstimate } from "@/lib/core/pricing/young-hungry-pricebook";
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
    const truckClass = getRecommendedTruckClassForServiceType(parsed.data.serviceType);

    if (!truckClass) {
      return {
        status: "error",
        message: "This move size is not available for instant quotes yet.",
        fieldErrors: {
          truckClass: "Choose an available move size."
        }
      };
    }

    const request = {
      ...parsed.data,
      truckClass
    };
    const supabase = createSupabaseAdminClient();
    const rpcClient = createSupabaseRpcClient(supabase);
    const routeDistance = await getMoveRouteDistanceEstimate({
      baseAddress: YH_DEFAULT_BUSINESS.operationsBaseAddress,
      pickupAddress: request.pickupAddress,
      dropoffAddress: request.dropoffAddress
    });
    const quoteEstimate = calculateYoungHungryQuoteEstimate({
      ...request,
      baseToPickup: routeDistance.ok ? routeDistance.baseToPickup : null,
      pickupToDropoff: routeDistance.ok ? routeDistance.pickupToDropoff : null,
      dropoffToBase: routeDistance.ok ? routeDistance.dropoffToBase : null
    });

    const result = await createQuote(rpcClient, {
      idempotencyKey: parsed.data.idempotencyKey,
      correlationId: parsed.data.idempotencyKey,
      actor: {
        type: "customer"
      },
      businessId: YH_DEFAULT_BUSINESS.id,
      customerName: request.name,
      customerEmail: request.email,
      customerPhone: request.phone,
      pickupAddress: request.pickupAddress,
      dropoffAddress: request.dropoffAddress,
      serviceType: request.serviceType,
      jobBlockMinutes: quoteEstimate?.billableMinutes ?? YH_DEFAULT_BUSINESS.defaultJobBlockMinutes,
      depositCents: YH_DEFAULT_BUSINESS.defaultDepositCents,
      priceCents: quoteEstimate?.priceCents,
      pricingVersion: quoteEstimate?.pricingVersion ?? "lead-capture-v1",
      breakdown: {
        source: "youngandh.co/quote",
        quoteFlowVersion: "lugg_style_5_step_v1",
        routeDistance,
        quoteEstimate,
        preferredDate: request.preferredDate,
        preferredTimeWindow: request.preferredTimeWindow,
        pricingInputs: {
          truckClass: request.truckClass,
          preferredTimeWindow: request.preferredTimeWindow,
          serviceType: request.serviceType
        },
        notes: request.notes,
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

    await notifyOpsQuoteReview(supabase, {
      quoteId: result.data.quoteId,
      request,
      quoteEstimate
    });

    return {
      status: "success",
      message: quoteFlowCopy.actions.successMessage,
      quoteId: result.data.quoteId
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error && error.message.includes("Supabase")
          ? "Supabase is not configured yet. Add the Y&H Supabase env vars before accepting live quote requests."
          : quoteFlowCopy.actions.genericError
    };
  }
}
