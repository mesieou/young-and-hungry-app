export const YH_DEFAULT_BUSINESS_ID =
  process.env.YH_DEFAULT_BUSINESS_ID ?? "00000000-0000-4000-8000-000000000001";

export const YH_DEFAULT_BUSINESS = {
  id: YH_DEFAULT_BUSINESS_ID,
  slug: "young-and-hungry",
  name: "Young & Hungry",
  domain: "youngandh.co",
  timezone: "Australia/Melbourne",
  defaultCurrency: "AUD",
  defaultDepositCents: 10000,
  defaultJobBlockMinutes: 120
} as const;
