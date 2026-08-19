import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * RedisService wraps ioredis with NestJS lifecycle hooks.
 *
 * - Connects on module init
 * - Disconnects gracefully on module destroy
 * - Exposes the underlying Redis client via `client`
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  public readonly client: Redis;

  constructor(configService: ConfigService) {
    this.client = new Redis({
      host: configService.get<string>('redis.REDIS_HOST', 'localhost'),
      port: configService.get<number>('redis.REDIS_PORT', 6379),
      password: configService.get<string>('redis.REDIS_PASSWORD') || undefined,
      db: configService.get<number>('redis.REDIS_DB', 0),
      lazyConnect: true,
    });
  }

  async onModuleInit(): Promise<void> {
    if (process.env.VERCEL) {
      this.logger.log(
        'Running on Vercel: skipping persistent TCP Redis connection.',
      );
      return;
    }
    try {
      this.logger.log('Connecting to Redis...');
      await this.client.connect();
      this.logger.log('Redis connected');
    } catch (err) {
      this.logger.warn(
        `Failed to connect to Redis: ${(err as Error).message}. Continuing without persistent TCP Redis connection.`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      if (
        this.client.status === 'ready' ||
        this.client.status === 'connecting'
      ) {
        this.logger.log('Disconnecting from Redis...');
        await this.client.quit();
        this.logger.log('Redis disconnected');
      }
    } catch {
      // Ignore disconnect errors during teardown
    }
  }

  // ── Health Check ─────────────────────────────
  async isHealthy(): Promise<boolean> {
    try {
      if (this.client.status !== 'ready') {
        return false;
      }
      const result = await this.client.ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }
}
