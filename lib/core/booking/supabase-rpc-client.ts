import type { RpcClient } from "@/lib/core/booking/rpc-client";

type SupabaseRpcError = {
  message: string;
  code?: string;
  details?: string;
} | null;

type SupabaseRpcSource = {
  rpc: (fn: string, args?: Record<string, unknown>) => PromiseLike<{ data: unknown; error: SupabaseRpcError }>;
};

export function createSupabaseRpcClient(supabase: SupabaseRpcSource): RpcClient {
  return {
    rpc: async (fn, args) => {
      const { data, error } = await supabase.rpc(fn, args);

      return { data, error };
    }
  };
}
