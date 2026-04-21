import { BaseRepository, type BaseEntity } from "@/lib/database/repositories/base-repository";
import { DatabaseClientFactory } from "@/lib/database/supabase/factory";

jest.mock("crypto", () => ({
  randomUUID: jest.fn(() => "generated-id")
}));

jest.mock("@/lib/database/supabase/factory", () => ({
  ClientType: {
    ADMIN: "admin",
    SERVER: "server",
    CLIENT: "client"
  },
  DatabaseClientFactory: {
    getClient: jest.fn(),
    reset: jest.fn()
  }
}));

type TestRow = BaseEntity & {
  name: string;
};

function makeClientForCreate(response: { data: unknown; error: Error | null }) {
  const maybeSingle = jest.fn(async () => response);
  const selectAfterUpsert = jest.fn(() => ({ maybeSingle }));
  const upsert = jest.fn(() => ({ select: selectAfterUpsert }));
  const from = jest.fn(() => ({ upsert }));

  return {
    client: { from },
    from,
    upsert
  };
}

describe("BaseRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("pre-generates ids so retried creates are idempotent", async () => {
    const row = {
      id: "generated-id",
      name: "Quote",
      created_at: "2026-04-21T00:00:00.000Z",
      updated_at: "2026-04-21T00:00:00.000Z"
    };
    const { client, upsert } = makeClientForCreate({ data: row, error: null });

    jest.mocked(DatabaseClientFactory.getClient).mockResolvedValue(client as never);

    const repo = new BaseRepository<TestRow>("quotes");
    const result = await repo.create({ name: "Quote" });

    expect(result).toEqual(row);
    expect(upsert).toHaveBeenCalledWith(
      {
        id: "generated-id",
        name: "Quote"
      },
      { onConflict: "id", ignoreDuplicates: true }
    );
  });

  it("returns the existing row when a duplicate retry was already written", async () => {
    const row = {
      id: "generated-id",
      name: "Existing Quote",
      created_at: "2026-04-21T00:00:00.000Z",
      updated_at: "2026-04-21T00:00:00.000Z"
    };
    const maybeSingle = jest.fn(async () => ({ data: null, error: null }));
    const selectAfterUpsert = jest.fn(() => ({ maybeSingle }));
    const upsert = jest.fn(() => ({ select: selectAfterUpsert }));
    const single = jest.fn(async () => ({ data: row, error: null }));
    const eq = jest.fn(() => ({ single }));
    const select = jest.fn(() => ({ eq }));
    const from = jest.fn(() => ({ upsert, select }));

    jest.mocked(DatabaseClientFactory.getClient).mockResolvedValue({ from } as never);

    const repo = new BaseRepository<TestRow>("quotes");
    const result = await repo.create({ name: "Existing Quote" });

    expect(result).toEqual(row);
    expect(select).toHaveBeenCalledWith("*");
    expect(eq).toHaveBeenCalledWith("id", "generated-id");
  });
});
