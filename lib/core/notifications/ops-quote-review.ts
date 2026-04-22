import type { QuoteRequestInput } from "@/lib/core/booking/quote-request";
import { sendEmailWithResend, type EmailDeliveryResult } from "@/lib/core/notifications/email";

type DbError = {
  message: string;
};

type DbMutationResult = {
  error: DbError | null;
};

type DbMutationBuilder = {
  insert: (values: Record<string, unknown>) => PromiseLike<DbMutationResult>;
  upsert: (values: Record<string, unknown>, options?: Record<string, unknown>) => PromiseLike<DbMutationResult>;
};

type NotificationDbClient = {
  from: (table: string) => DbMutationBuilder;
};

export type OpsQuoteReviewEmailInput = {
  quoteId: string;
  request: QuoteRequestInput;
  submittedAt?: Date;
};

export type OpsQuoteReviewNotificationResult =
  | {
      ok: true;
      email: EmailDeliveryResult;
    }
  | {
      ok: false;
      email: EmailDeliveryResult;
      message: string;
    };

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeOptional(value: string | undefined) {
  return value?.trim() ? value.trim() : "Not provided";
}

function formatLabel(label: string, value: string | undefined) {
  return `${label}: ${normalizeOptional(value)}`;
}

export function buildOpsQuoteReviewEmail(input: OpsQuoteReviewEmailInput) {
  const submittedAt = input.submittedAt ?? new Date();
  const rows = [
    ["Quote ID", input.quoteId],
    ["Submitted", submittedAt.toISOString()],
    ["Name", input.request.name],
    ["Email", normalizeOptional(input.request.email)],
    ["Phone", normalizeOptional(input.request.phone)],
    ["Service type", input.request.serviceType],
    ["Pickup", input.request.pickupAddress],
    ["Dropoff", input.request.dropoffAddress],
    ["Preferred date", normalizeOptional(input.request.preferredDate)],
    ["Notes", normalizeOptional(input.request.notes)]
  ] as const;

  const subject = `New Young & Hungry quote: ${input.request.pickupAddress} -> ${input.request.dropoffAddress}`;
  const text = [
    "New Young & Hungry quote request",
    "",
    formatLabel("Quote ID", input.quoteId),
    formatLabel("Submitted", submittedAt.toISOString()),
    formatLabel("Name", input.request.name),
    formatLabel("Email", input.request.email),
    formatLabel("Phone", input.request.phone),
    formatLabel("Service type", input.request.serviceType),
    formatLabel("Pickup", input.request.pickupAddress),
    formatLabel("Dropoff", input.request.dropoffAddress),
    formatLabel("Preferred date", input.request.preferredDate),
    "",
    "Notes:",
    normalizeOptional(input.request.notes)
  ].join("\n");
  const htmlRows = rows
    .map(
      ([label, value]) => `
        <tr>
          <th align="left" style="padding:8px 12px;border-bottom:1px solid #1E2A3D;color:#A9B4C7;">${escapeHtml(label)}</th>
          <td style="padding:8px 12px;border-bottom:1px solid #1E2A3D;color:#FFFFFF;">${escapeHtml(value)}</td>
        </tr>`
    )
    .join("");
  const html = `
    <div style="background:#0B0F1A;color:#FFFFFF;font-family:Inter,Arial,sans-serif;padding:24px;">
      <div style="max-width:720px;margin:0 auto;border:1px solid #1E2A3D;border-radius:16px;background:#121A2B;overflow:hidden;">
        <div style="padding:24px;border-bottom:1px solid #1E2A3D;">
          <p style="margin:0 0 8px;color:#60A5FA;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;">Young & Hungry</p>
          <h1 style="margin:0;font-size:28px;line-height:1.2;">New quote request</h1>
        </div>
        <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
          ${htmlRows}
        </table>
      </div>
    </div>`;

  return {
    subject,
    text,
    html
  };
}

export async function notifyOpsQuoteReview(
  db: NotificationDbClient,
  input: OpsQuoteReviewEmailInput
): Promise<OpsQuoteReviewNotificationResult> {
  const recipient = process.env.OPS_QUOTE_EMAIL?.trim();
  const from = process.env.EMAIL_FROM?.trim() ?? "";
  const email = buildOpsQuoteReviewEmail(input);
  const delivery = recipient
    ? await sendEmailWithResend({
        to: recipient,
        from,
        subject: email.subject,
        html: email.html,
        text: email.text,
        replyTo: input.request.email
      })
    : ({
        ok: false,
        code: "EMAIL_NOT_CONFIGURED",
        message: "OPS_QUOTE_EMAIL is not set."
      } satisfies EmailDeliveryResult);

  await db.from("notifications").insert({
    channel: "email",
    recipient: recipient ?? "unconfigured",
    template: "ops_quote_review_v1",
    state: delivery.ok ? "succeeded" : "failed",
    attempts: delivery.ok || delivery.code === "EMAIL_SEND_FAILED" ? 1 : 0,
    last_error: delivery.ok ? null : delivery.message,
    payload: {
      quoteId: input.quoteId,
      request: input.request,
      email,
      delivery
    }
  });

  if (!delivery.ok) {
    await db.from("ops_issues").upsert(
      {
        severity: "warning",
        category: "notification",
        status: "open",
        title: "Quote review email was not sent",
        dedupe_key: `ops-quote-email:${input.quoteId}`,
        payload: {
          quoteId: input.quoteId,
          error: delivery
        }
      },
      {
        onConflict: "dedupe_key"
      }
    );

    return {
      ok: false,
      email: delivery,
      message: delivery.message
    };
  }

  return {
    ok: true,
    email: delivery
  };
}
