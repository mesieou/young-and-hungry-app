import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdminConfig } from "@/lib/database/supabase/config";

export function createSupabaseAdminClient() {
  const { url, serviceKey } = getSupabaseAdminConfig();

  if (!url) {
    throw new Error("SUPABASE_URL is not set");
  }

  if (!serviceKey) {
    throw new Error("SUPABASE_SECRET_KEY is not set");
  }

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
