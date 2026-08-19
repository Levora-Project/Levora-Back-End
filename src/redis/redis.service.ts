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
    this.logger.log('Connecting to Redis...');
    await this.client.connect();
    this.logger.log('Redis connected');
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Disconnecting from Redis...');
    await this.client.quit();
    this.logger.log('Redis disconnected');
  }

  // ── Health Check ─────────────────────────────
  async isHealthy(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }
}
