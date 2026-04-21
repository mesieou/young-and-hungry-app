import type {
  AcceptQuoteCommand,
  BeginBookingCheckoutCommand,
  BeginBookingCheckoutResult,
  CancelBookingCommand,
  CommandResult,
  ConfirmPaidBookingCommand,
  ConfirmPaidBookingResult,
  CreateQuoteCommand,
  ExpireBookingHoldCommand,
  QuoteCommandResult,
  RescheduleBookingCommand
} from "@/lib/core/booking/commands";

type RpcError = {
  message: string;
  code?: string;
  details?: string;
};

export type RpcClient = {
  rpc: (fn: string, args?: Record<string, unknown>) => Promise<{ data: unknown; error: RpcError | null }>;
};

async function callCommand<TResult>(
  client: RpcClient,
  functionName: string,
  command: Record<string, unknown>
): Promise<CommandResult<TResult>> {
  const { data, error } = await client.rpc(functionName, { p_command: command });

  if (error) {
    return {
      ok: false,
      code: "INTERNAL_TRANSITION_FAILED",
      message: error.message,
      diagnostics: {
        functionName,
        providerCode: error.code,
        details: error.details
      }
    };
  }

  return data as CommandResult<TResult>;
}

export function createQuote(client: RpcClient, command: CreateQuoteCommand) {
  return callCommand<QuoteCommandResult>(client, "create_quote", command);
}

export function acceptQuote(client: RpcClient, command: AcceptQuoteCommand) {
  return callCommand<QuoteCommandResult>(client, "accept_quote", command);
}

export function beginBookingCheckout(client: RpcClient, command: BeginBookingCheckoutCommand) {
  return callCommand<BeginBookingCheckoutResult>(client, "begin_booking_checkout", command);
}

export function confirmPaidBooking(client: RpcClient, command: ConfirmPaidBookingCommand) {
  return callCommand<ConfirmPaidBookingResult>(client, "confirm_paid_booking", command);
}

export function expireBookingHold(client: RpcClient, command: ExpireBookingHoldCommand) {
  return callCommand<{ bookingId: string; status: string }>(client, "expire_booking_hold", command);
}

export function cancelBooking(client: RpcClient, command: CancelBookingCommand) {
  return callCommand<{ bookingId: string; status: string }>(client, "cancel_booking", command);
}

export function rescheduleBooking(client: RpcClient, command: RescheduleBookingCommand) {
  return callCommand<{ bookingId: string; status: string }>(client, "reschedule_booking", command);
}
