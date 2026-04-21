import { createClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";
import { createSupabaseAdminClient } from "@/lib/database/supabase/admin";
import { createSupabaseBrowserClient, initSupabaseBrowserClient } from "@/lib/database/supabase/browser";
import {
  getSupabaseAdminConfig,
  getSupabasePublishableConfig,
  requireSupabasePublishableConfig
} from "@/lib/database/supabase/config";

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({ type: "admin-client" }))
}));

jest.mock("@supabase/ssr", () => ({
  createBrowserClient: jest.fn(() => ({ type: "browser-client" }))
}));

const mockCreateClient = jest.mocked(createClient);
const mockCreateBrowserClient = jest.mocked(createBrowserClient);

describe("Skedy-style Supabase conventions", () => {
  const envBackup = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...envBackup,
      SUPABASE_URL: "https://young-and-hungry.supabase.co",
      SUPABASE_PUBLISHABLE_KEY: "publishable-key",
      SUPABASE_SECRET_KEY: "secret-key"
    };
  });

  afterAll(() => {
    process.env = envBackup;
  });

  it("reads publishable config from SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY", () => {
    expect(getSupabasePublishableConfig()).toEqual({
      url: "https://young-and-hungry.supabase.co",
      key: "publishable-key"
    });
  });

  it("reads admin config from SUPABASE_URL and SUPABASE_SECRET_KEY", () => {
    expect(getSupabaseAdminConfig()).toEqual({
      url: "https://young-and-hungry.supabase.co",
      serviceKey: "secret-key"
    });
  });

  it("does not accept legacy NEXT_PUBLIC Supabase names", () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_PUBLISHABLE_KEY;
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://legacy.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "legacy-key";

    expect(() => requireSupabasePublishableConfig()).toThrow("SUPABASE_URL is not set");
  });

  it("creates admin clients with the secret key only", () => {
    createSupabaseAdminClient();

    expect(mockCreateClient).toHaveBeenCalledWith(
      "https://young-and-hungry.supabase.co",
      "secret-key",
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );
  });

  it("requires browser clients to be initialized by the app provider", () => {
    expect(() => createSupabaseBrowserClient()).toThrow("Client not initialised");

    const client = initSupabaseBrowserClient("https://young-and-hungry.supabase.co", "publishable-key");

    expect(client).toEqual({ type: "browser-client" });
    expect(mockCreateBrowserClient).toHaveBeenCalledWith(
      "https://young-and-hungry.supabase.co",
      "publishable-key"
    );
    expect(createSupabaseBrowserClient()).toEqual({ type: "browser-client" });
  });
});
