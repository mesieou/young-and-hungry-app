import { randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ClientType, DatabaseClientFactory } from "@/lib/database/supabase/factory";

export type BaseEntity = {
  id: string;
  created_at: string;
  updated_at: string;
};

export type QueryValue = string | number | boolean | null;
export type QueryConditions = Record<string, QueryValue>;

export type QueryOptions = {
  select?: string;
  limit?: number;
  offset?: number;
  orderBy?: string;
  ascending?: boolean;
};

class ConcurrencyLimiter {
  private activeConnections = 0;
  private waitingQueue: Array<() => void> = [];

  constructor(private readonly maxConnections = 250) {}

  async acquire(): Promise<void> {
    while (this.activeConnections >= this.maxConnections) {
      await new Promise<void>((resolve) => {
        this.waitingQueue.push(resolve);
      });
    }

    this.activeConnections += 1;
  }

  release(): void {
    this.activeConnections -= 1;
    const waiter = this.waitingQueue.shift();

    if (waiter) {
      waiter();
    }
  }
}

const globalLimiter = new ConcurrencyLimiter();

export class BaseRepository<T extends BaseEntity> {
  protected readonly clientType: ClientType;

  constructor(protected readonly tableName: string, clientType: ClientType = ClientType.ADMIN) {
    this.clientType = clientType;
  }

  protected async getClient(): Promise<SupabaseClient> {
    return DatabaseClientFactory.getClient({ type: this.clientType });
  }

  async findOne(conditions: QueryConditions, options: QueryOptions = {}): Promise<T | null> {
    return this.withConcurrencyLimit(() =>
      this.retryWithBackoff(async () => {
        const client = await this.getClient();
        let query = client.from(this.tableName).select(options.select || "*");

        Object.entries(conditions).forEach(([key, value]) => {
          query = query.eq(key, value);
        });

        const { data, error } = await query.maybeSingle();

        if (error) {
          throw error;
        }

        return data as T | null;
      })
    );
  }

  async findMany(conditions: QueryConditions = {}, options: QueryOptions = {}): Promise<T[]> {
    return this.withConcurrencyLimit(() =>
      this.retryWithBackoff(async () => {
        const client = await this.getClient();
        let query = client.from(this.tableName).select(options.select || "*");

        Object.entries(conditions).forEach(([key, value]) => {
          query = query.eq(key, value);
        });

        if (options.limit) {
          query = query.limit(options.limit);
        }

        if (options.offset !== undefined) {
          query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
        }

        if (options.orderBy) {
          query = query.order(options.orderBy, { ascending: options.ascending ?? true });
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        return (data || []) as unknown as T[];
      })
    );
  }

  async create(data: Omit<T, "id" | "created_at" | "updated_at">): Promise<T> {
    const dataWithId = { id: randomUUID(), ...data } as Omit<T, "created_at" | "updated_at">;

    return this.withConcurrencyLimit(() => this.createWithRetry(dataWithId));
  }

  async updateOne(conditions: QueryConditions, data: Partial<Omit<T, "id" | "created_at">>): Promise<T> {
    return this.withConcurrencyLimit(() =>
      this.retryWithBackoff(async () => {
        const client = await this.getClient();
        let query = client.from(this.tableName).update(data as never);

        Object.entries(conditions).forEach(([key, value]) => {
          query = query.eq(key, value);
        });

        const { data: result, error } = await query.select().single();

        if (error) {
          throw error;
        }

        return result as T;
      })
    );
  }

  async deleteOne(conditions: QueryConditions): Promise<void> {
    return this.withConcurrencyLimit(() =>
      this.retryWithBackoff(async () => {
        const client = await this.getClient();
        let query = client.from(this.tableName).delete();

        Object.entries(conditions).forEach(([key, value]) => {
          query = query.eq(key, value);
        });

        const { error } = await query;

        if (error) {
          throw error;
        }
      })
    );
  }

  async count(conditions: QueryConditions = {}): Promise<number> {
    return this.withConcurrencyLimit(() =>
      this.retryWithBackoff(async () => {
        const client = await this.getClient();
        let query = client.from(this.tableName).select("*", { count: "exact", head: true });

        Object.entries(conditions).forEach(([key, value]) => {
          query = query.eq(key, value);
        });

        const { count, error } = await query;

        if (error) {
          throw error;
        }

        return count || 0;
      })
    );
  }

  private async createWithRetry(
    data: Omit<T, "created_at" | "updated_at">,
    retryAttempt = 0
  ): Promise<T> {
    const maxRetries = 3;
    const retryDelaysMs = [1000, 2000, 4000];
    const id = (data as Record<string, unknown>).id as string;
    const client = await this.getClient();
    const { data: result, error } = await client
      .from(this.tableName)
      .upsert(data as never, { onConflict: "id", ignoreDuplicates: true })
      .select()
      .maybeSingle();

    if (!error) {
      if (result) {
        return result as T;
      }

      const { data: existing, error: fetchError } = await client
        .from(this.tableName)
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      return existing as T;
    }

    if (this.isTransientError(error) && retryAttempt < maxRetries) {
      DatabaseClientFactory.reset();
      await this.delay(retryDelaysMs[retryAttempt]);
      return this.createWithRetry(data, retryAttempt + 1);
    }

    throw error;
  }

  private async withConcurrencyLimit<R>(operation: () => Promise<R>): Promise<R> {
    await globalLimiter.acquire();

    try {
      return await operation();
    } finally {
      globalLimiter.release();
    }
  }

  private async retryWithBackoff<R>(operation: () => Promise<R>, maxRetries = 3): Promise<R> {
    const retryDelaysMs = [500, 1000, 2000];

    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      try {
        return await operation();
      } catch (error) {
        if (!this.isTransientError(error) || attempt === maxRetries) {
          throw error;
        }

        DatabaseClientFactory.reset();
        await this.delay(retryDelaysMs[attempt]);
      }
    }

    throw new Error(`Database operation failed after ${maxRetries} retries`);
  }

  private isTransientError(error: unknown): boolean {
    const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

    return (
      message.includes("fetch failed") ||
      message.includes("network") ||
      message.includes("timeout") ||
      message.includes("econnrefused") ||
      message.includes("etimedout") ||
      message.includes("enotfound") ||
      message.includes("connection") ||
      message.includes("econnreset")
    );
  }

  private async delay(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}
