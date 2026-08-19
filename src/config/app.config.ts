import { z } from 'zod';

/**
 * Application configuration schema with validation.
 * Uses Zod for runtime type checking of environment variables.
 */
export const appConfigSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3000),
  APP_NAME: z.string().default('ai-hub'),
  API_PREFIX: z.string().default('api'),
});

export type AppConfig = z.infer<typeof appConfigSchema>;

export const appConfig = () => ({
  app: appConfigSchema.parse({
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    APP_NAME: process.env.APP_NAME,
    API_PREFIX: process.env.API_PREFIX,
  }),
});
