import { Redis } from '@upstash/redis';

export interface KeyvUpstashOptions {
  url: string;
  token: string;
}

export class KeyvUpstashStore {
  opts: Record<string, unknown> = {};
  namespace?: string;
  private readonly redis: Redis;

  constructor(options: KeyvUpstashOptions) {
    this.redis = new Redis({
      url: options.url,
      token: options.token,
    });
  }

  async get<T>(key: string): Promise<T | undefined> {
    const val = await this.redis.get<T>(key);
    if (val === null || val === undefined) {
      return undefined;
    }
    return val;
  }

  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    if (ttl && ttl > 0) {
      await this.redis.set(key, value, { px: ttl });
    } else {
      await this.redis.set(key, value);
    }
  }

  async delete(key: string): Promise<boolean> {
    const count = await this.redis.del(key);
    return count > 0;
  }

  async clear(): Promise<void> {
    // Upstash clear store no-op for safety
  }
}
