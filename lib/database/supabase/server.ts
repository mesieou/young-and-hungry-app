import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requireSupabasePublishableConfig } from "@/lib/database/supabase/config";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { url, key } = requireSupabasePublishableConfig();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot set cookies. Middleware/API routes can.
        }
      }
    }
  });
}
