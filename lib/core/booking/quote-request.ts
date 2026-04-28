import { z } from "zod";

const optionalText = z.preprocess(
  (value) => (typeof value === "string" ? value : undefined),
  z
    .string()
    .trim()
    .transform((value) => (value.length === 0 ? undefined : value))
    .optional()
);

const invalidPhoneMessage = "Enter a valid Australian phone number.";

export const truckClassOptions = [
  {
    value: "four_tonne",
    label: "4 tonne truck",
    description: "Recommended for item deliveries, small moves, studios, and 1 bedroom moves.",
    rateSummary: "$159/hr weekday, $169/hr weekend"
  },
  {
    value: "six_tonne",
    label: "6 tonne truck",
    description: "Recommended for 2 and 3 bedroom apartment or house moves.",
    rateSummary: "$169/hr weekday, $179/hr weekend"
  }
] as const;

export const preferredTimeWindowOptions = [
  {
    value: "morning_0700_1000",
    label: "Morning",
    description: "7:00am - 10:00am"
  },
  {
    value: "midday_1000_1300",
    label: "Midday",
    description: "10:00am - 1:00pm"
  },
  {
    value: "afternoon_1300_1600",
    label: "Afternoon",
    description: "1:00pm - 4:00pm"
  },
  {
    value: "flexible",
    label: "Flexible",
    description: "Any reviewed time that works"
  }
] as const;

const truckClassLabels: Record<string, string> = {
  four_tonne: "4 tonne truck",
  six_tonne: "6 tonne truck"
};
const truckClassValues = ["four_tonne", "six_tonne"] as const;
const preferredTimeWindowValues = [
  "morning_0700_1000",
  "midday_1000_1300",
  "afternoon_1300_1600",
  "flexible"
] as const;

const truckClassSchema = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string({
    required_error: "Choose what you are moving.",
    invalid_type_error: "Choose what you are moving."
  }).refine((value): value is TruckClass => truckClassValues.includes(value as TruckClass), {
    message: "Choose what you are moving."
  })
);

const preferredTimeWindowSchema = z.preprocess(
  (value) => (value === "" || value == null ? "flexible" : value),
  z.enum(preferredTimeWindowValues)
);

const phoneSchema = z
  .preprocess((value) => {
    const text = typeof value === "string" ? value.trim() : "";

    if (!text) return undefined;

    return normalizeAustralianPhone(text) ?? text;
  }, z.string().optional())
  .superRefine((value, context) => {
    if (value && !isValidAustralianPhone(value)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: invalidPhoneMessage
      });
    }
  });

export type TruckClass = (typeof truckClassValues)[number];
export type PreferredTimeWindow = (typeof preferredTimeWindowValues)[number];

export function isUnavailableServiceType(value: string | undefined) {
  return value === "apartment_four_plus" || value === "house_four_plus";
}

export function getRecommendedTruckClassForServiceType(value: string | undefined): TruckClass | undefined {
  if (!value || isUnavailableServiceType(value)) return undefined;

  if (
    value === "delivery_run" ||
    value === "small_move" ||
    value === "apartment_studio" ||
    value === "apartment_one_bed" ||
    value === "house_one_bed" ||
    value === "apartment_move"
  ) {
    return "four_tonne";
  }

  if (
    value === "apartment_two_bed" ||
    value === "apartment_three_bed" ||
    value === "house_two_bed" ||
    value === "house_three_bed" ||
    value === "house_move" ||
    value === "removal"
  ) {
    return "six_tonne";
  }

  return undefined;
}

export function getTruckClassLabel(value: string | undefined) {
  return value ? truckClassLabels[value] : undefined;
}

export function getPreferredTimeWindowLabel(value: string | undefined) {
  return preferredTimeWindowOptions.find((option) => option.value === value)?.label ?? "Flexible";
}

export function normalizeAustralianPhone(value: string | undefined) {
  const trimmed = value?.trim();

  if (!trimmed) return undefined;

  const compact = trimmed.replace(/[\s\-().]/g, "");

  if (/^\+614\d{8}$/.test(compact)) return compact;
  if (/^04\d{8}$/.test(compact)) return `+61${compact.slice(1)}`;
  if (/^4\d{8}$/.test(compact)) return `+61${compact}`;
  if (/^614\d{8}$/.test(compact)) return `+${compact}`;
  if (/^\+61[2378]\d{8}$/.test(compact)) return compact;
  if (/^0[2378]\d{8}$/.test(compact)) return `+61${compact.slice(1)}`;
  if (/^61[2378]\d{8}$/.test(compact)) return `+${compact}`;

  return undefined;
}

export function isValidAustralianPhone(value: string | undefined) {
  return Boolean(normalizeAustralianPhone(value));
}

export const quoteRequestSchema = z
  .object({
    idempotencyKey: z.string().trim().min(12, "Missing request key."),
    name: z.string().trim().min(2, "Enter your name.").max(120, "Name is too long."),
    email: optionalText.pipe(z.string().email("Enter a valid email.").optional()),
    phone: phoneSchema,
    pickupAddress: z.string().trim().min(3, "Enter the pickup address.").max(300, "Pickup address is too long."),
    dropoffAddress: z.string().trim().min(3, "Enter the dropoff address.").max(300, "Dropoff address is too long."),
    truckClass: truckClassSchema,
    serviceType: z.string().trim().min(2).max(80).default("removal"),
    preferredDate: optionalText,
    preferredTimeWindow: preferredTimeWindowSchema,
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
    truckClass: formData.get("truckClass"),
    serviceType: formData.get("serviceType") ?? "removal",
    preferredDate: formData.get("preferredDate"),
    preferredTimeWindow: formData.get("preferredTimeWindow") ?? "flexible",
    notes: formData.get("notes")
  });
}

export function getQuoteRequestFieldErrors(error: z.ZodError<QuoteRequestInput>) {
  const flattened = error.flatten().fieldErrors;

  return Object.fromEntries(
    Object.entries(flattened).map(([key, value]) => [key, value?.[0]])
  ) as Partial<Record<keyof QuoteRequestInput, string>>;
}
