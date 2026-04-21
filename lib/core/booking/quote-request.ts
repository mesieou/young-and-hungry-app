import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? undefined : value))
  .optional();

export const quoteRequestSchema = z
  .object({
    idempotencyKey: z.string().trim().min(12, "Missing request key."),
    name: z.string().trim().min(2, "Enter your name.").max(120, "Name is too long."),
    email: optionalText.pipe(z.string().email("Enter a valid email.").optional()),
    phone: optionalText,
    pickupAddress: z.string().trim().min(3, "Enter the pickup address.").max(300, "Pickup address is too long."),
    dropoffAddress: z.string().trim().min(3, "Enter the dropoff address.").max(300, "Dropoff address is too long."),
    serviceType: z.string().trim().min(2).max(80).default("removal"),
    preferredDate: optionalText,
    notes: optionalText.pipe(z.string().max(2000, "Notes are too long.").optional())
  })
  .superRefine((value, context) => {
    if (!value.email && !value.phone) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["email"],
        message: "Enter an email or phone number."
      });
    }
  });

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;

export type QuoteFormState = {
  status: "idle" | "success" | "error";
  message: string;
  quoteId?: string;
  fieldErrors?: Partial<Record<keyof QuoteRequestInput, string>>;
};

export const initialQuoteFormState: QuoteFormState = {
  status: "idle",
  message: ""
};

export function parseQuoteRequestFormData(formData: FormData) {
  return quoteRequestSchema.safeParse({
    idempotencyKey: formData.get("idempotencyKey"),
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    pickupAddress: formData.get("pickupAddress"),
    dropoffAddress: formData.get("dropoffAddress"),
    serviceType: formData.get("serviceType") ?? "removal",
    preferredDate: formData.get("preferredDate"),
    notes: formData.get("notes")
  });
}

export function getQuoteRequestFieldErrors(error: z.ZodError<QuoteRequestInput>) {
  const flattened = error.flatten().fieldErrors;

  return Object.fromEntries(
    Object.entries(flattened).map(([key, value]) => [key, value?.[0]])
  ) as Partial<Record<keyof QuoteRequestInput, string>>;
}
