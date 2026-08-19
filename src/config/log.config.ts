import { z } from 'zod';

export const logConfigSchema = z.object({
  LOG_DIR: z.string().default('./logs'),
  LOG_MAX_SIZE: z.string().default('10m'), // rotate when file hits this size
  LOG_FREQUENCY: z.string().default('daily'), // 'daily' | 'hourly' | number (ms)
  LOG_MAX_FILES: z.coerce.number().default(30), // keep last N rotated files
  LOG_FILE_ENABLED: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'), // set true to enable file logs alongside stdout
});

export type LogConfig = z.infer<typeof logConfigSchema>;

export const logConfig = () => ({
  log: logConfigSchema.parse({
    LOG_DIR: process.env.LOG_DIR,
    LOG_MAX_SIZE: process.env.LOG_MAX_SIZE,
    LOG_FREQUENCY: process.env.LOG_FREQUENCY,
    LOG_MAX_FILES: process.env.LOG_MAX_FILES,
    LOG_FILE_ENABLED: process.env.LOG_FILE_ENABLED,
  }),
});
