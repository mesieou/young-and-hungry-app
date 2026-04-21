import { createBrowserClient } from "@supabase/ssr";

let client: ReturnType<typeof createBrowserClient> | null = null;

export function initSupabaseBrowserClient(url: string, key: string) {
  if (!client && url && key) {
    client = createBrowserClient(url, key);
  }

  return client;
}

export function createSupabaseBrowserClient() {
  if (!client) {
    throw new Error(
      "[Supabase] Client not initialised. Pass SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY through the app provider before using browser Supabase."
    );
  }

  return client;
}
