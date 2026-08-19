import { z } from 'zod';

/**
 * Security configuration schema.
 */
export const securityConfigSchema = z.object({
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:3000')
    .transform((val) => val.split(',')),
  THROTTLE_TTL: z.coerce.number().default(60000),
  THROTTLE_LIMIT: z.coerce.number().default(100),
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters')
    .default(
      process.env.NODE_ENV === 'production'
        ? (undefined as unknown as string) // force validation failure in production
        : 'dev-only-secret-do-not-use-in-production!!',
    ),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES: z.string().default('7d'),
  COOKIE_DOMAIN: z.string().optional(),
  COOKIE_SECURE: z
    .string()
    .default('false')
    .transform((val) => val === 'true'),
});

export type SecurityConfig = z.infer<typeof securityConfigSchema>;

export const securityConfig = () => ({
  security: securityConfigSchema.parse({
    CORS_ORIGINS: process.env.CORS_ORIGINS,
    THROTTLE_TTL: process.env.THROTTLE_TTL,
    THROTTLE_LIMIT: process.env.THROTTLE_LIMIT,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES,
    JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES,
    COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
    COOKIE_SECURE: process.env.COOKIE_SECURE,
  }),
});
