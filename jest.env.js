const dotenv = require("dotenv");
const path = require("path");

dotenv.config({
  path: path.resolve(process.cwd(), ".env.local")
});

dotenv.config({
  path: path.resolve(process.cwd(), ".env.test"),
  override: true
});

process.env.APP_ENV = process.env.APP_ENV || "test";
process.env.NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://youngandh.co";
process.env.YH_DEFAULT_BUSINESS_ID =
  process.env.YH_DEFAULT_BUSINESS_ID || "00000000-0000-4000-8000-000000000001";
process.env.YH_OPERATIONS_BASE_ADDRESS = process.env.YH_OPERATIONS_BASE_ADDRESS || "Sims St, West Melbourne VIC 3003";
