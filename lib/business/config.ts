export const YH_DEFAULT_BUSINESS_ID =
  process.env.YH_DEFAULT_BUSINESS_ID ?? "00000000-0000-4000-8000-000000000001";

const operationsBaseAddress = process.env.YH_OPERATIONS_BASE_ADDRESS?.trim();

if (!operationsBaseAddress) {
  throw new Error("YH_OPERATIONS_BASE_ADDRESS is required for Young & Hungry quote pricing.");
}

export const YH_DEFAULT_BUSINESS = {
  id: YH_DEFAULT_BUSINESS_ID,
  slug: "young-and-hungry",
  name: "Young & Hungry",
  domain: "youngandh.co",
  timezone: "Australia/Melbourne",
  operationsBaseAddress,
  defaultCurrency: "AUD",
  defaultDepositCents: 10000,
  defaultJobBlockMinutes: 120
} as const;
