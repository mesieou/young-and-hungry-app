export type MockRpcResponse = {
  data: unknown;
  error: {
    message: string;
    code?: string;
    details?: string;
  } | null;
};

export function createMockSupabaseClient(response: MockRpcResponse) {
  return {
    rpc: jest.fn(async () => response)
  };
}
