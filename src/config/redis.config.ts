import { z } from 'zod';

/**
 * Redis configuration schema.
 */
export const redisConfigSchema = z.object({
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().int().min(0).default(0),
  CACHE_TTL: z.coerce.number().int().min(0).default(5000),
});

export type RedisConfig = z.infer<typeof redisConfigSchema>;

export const redisConfig = () => ({
  redis: redisConfigSchema.parse({
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    REDIS_DB: process.env.REDIS_DB,
    CACHE_TTL: process.env.CACHE_TTL,
  }),
});
