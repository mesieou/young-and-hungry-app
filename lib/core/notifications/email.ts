export type EmailDeliveryInput = {
  to: string;
  from: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

export type EmailDeliveryResult =
  | {
      ok: true;
      provider: "resend";
      providerMessageId?: string;
    }
  | {
      ok: false;
      code: "EMAIL_NOT_CONFIGURED" | "EMAIL_SEND_FAILED";
      message: string;
      diagnostics?: Record<string, unknown>;
    };

export async function sendEmailWithResend(input: EmailDeliveryInput): Promise<EmailDeliveryResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    return {
      ok: false,
      code: "EMAIL_NOT_CONFIGURED",
      message: "RESEND_API_KEY is not set."
    };
  }

  if (!input.from.trim()) {
    return {
      ok: false,
      code: "EMAIL_NOT_CONFIGURED",
      message: "EMAIL_FROM is not set."
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: input.from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
      reply_to: input.replyTo ? [input.replyTo] : undefined
    })
  });

  if (!response.ok) {
    const body = await response.text();

    return {
      ok: false,
      code: "EMAIL_SEND_FAILED",
      message: "Resend rejected the email request.",
      diagnostics: {
        status: response.status,
        body
      }
    };
  }

  const body = (await response.json().catch(() => ({}))) as { id?: unknown };

  return {
    ok: true,
    provider: "resend",
    providerMessageId: typeof body.id === "string" ? body.id : undefined
  };
}
