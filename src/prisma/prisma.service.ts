import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * PrismaService wraps PrismaClient with NestJS lifecycle hooks.
 *
 * - Connects on module init
 * - Disconnects gracefully on module destroy
 * - Logs slow queries in development
 *
 * App code should NOT use PrismaService directly in services.
 * Use repositories instead — they encapsulate all DB access
 * and are the single place to update when schema changes.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    let url = process.env.DATABASE_URL;
    if (
      url &&
      (url.includes(':6543') || url.includes('pooler.supabase.com')) &&
      !url.includes('pgbouncer=true')
    ) {
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}pgbouncer=true`;
    }

    super({
      datasources: url ? { db: { url } } : undefined,
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
    });
  }

  async onModuleInit(): Promise<void> {
    this.logger.log('Connecting to database...');
    await this.$connect();
    this.logger.log('Database connected');
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Disconnecting from database...');
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }

  /**
   * Health check – used by TerminusModule
   */
  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
