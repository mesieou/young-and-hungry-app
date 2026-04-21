import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/database/supabase/admin";
import { createSupabaseBrowserClient } from "@/lib/database/supabase/browser";
import { createSupabaseServerClient } from "@/lib/database/supabase/server";

export enum ClientType {
  ADMIN = "admin",
  SERVER = "server",
  CLIENT = "client"
}

export type ClientContext = {
  type: ClientType;
};

export class DatabaseClientFactory {
  private static adminClient: SupabaseClient | null = null;
  private static serverClient: SupabaseClient | null = null;
  private static browserClient: SupabaseClient | null = null;

  static async getClient(context?: ClientContext): Promise<SupabaseClient> {
    const clientType = context?.type || this.detectClientType();

    switch (clientType) {
      case ClientType.ADMIN:
        return this.getAdminClient();
      case ClientType.SERVER:
        return this.getServerClient();
      case ClientType.CLIENT:
        return this.getBrowserClient();
      default:
        throw new Error(`Unknown Supabase client type: ${clientType satisfies never}`);
    }
  }

  static getAdminClient(): SupabaseClient {
    if (!this.adminClient) {
      this.adminClient = createSupabaseAdminClient();
    }

    return this.adminClient;
  }

  static async getServerClient(): Promise<SupabaseClient> {
    if (!this.serverClient) {
      this.serverClient = (await createSupabaseServerClient()) as unknown as SupabaseClient;
    }

    return this.serverClient;
  }

  static getBrowserClient(): SupabaseClient {
    if (!this.browserClient) {
      this.browserClient = createSupabaseBrowserClient() as unknown as SupabaseClient;
    }

    return this.browserClient;
  }

  static reset(): void {
    this.adminClient = null;
    this.serverClient = null;
    this.browserClient = null;
  }

  private static detectClientType(): ClientType {
    if (typeof window !== "undefined") {
      return ClientType.CLIENT;
    }

    if (this.isScriptExecution() || process.env.NEXT_RUNTIME === "nodejs") {
      return ClientType.ADMIN;
    }

    return ClientType.SERVER;
  }

  private static isScriptExecution(): boolean {
    const execPath = process.argv?.[1] || "";

    return (
      process.env.IS_SCRIPT === "true" ||
      execPath.includes("scripts/") ||
      execPath.includes("seed") ||
      process.argv?.some((arg) => arg.includes("jest") || arg.includes("tsx")) === true
    );
  }
}
