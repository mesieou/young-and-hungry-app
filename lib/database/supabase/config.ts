export function getSupabasePublishableConfig() {
  return {
    url: process.env.SUPABASE_URL || "",
    key: process.env.SUPABASE_PUBLISHABLE_KEY || ""
  };
}

export function requireSupabasePublishableConfig() {
  const config = getSupabasePublishableConfig();

  if (!config.url) {
    throw new Error("SUPABASE_URL is not set");
  }

  if (!config.key) {
    throw new Error("SUPABASE_PUBLISHABLE_KEY is not set");
  }

  return config;
}

export function getSupabaseAdminConfig() {
  return {
    url: process.env.SUPABASE_URL || "",
    serviceKey: process.env.SUPABASE_SECRET_KEY || ""
  };
}

export function hasSupabasePublishableConfig() {
  const { url, key } = getSupabasePublishableConfig();
  return Boolean(url && key);
}
