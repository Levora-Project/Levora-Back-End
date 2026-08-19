import { z } from 'zod';

/**
 * Database configuration schema.
 */
export const databaseConfigSchema = z.object({
  DATABASE_URL: z.string().url(),
});

export type DatabaseConfig = z.infer<typeof databaseConfigSchema>;

function formatDatabaseUrl(url?: string): string | undefined {
  if (!url) {
    return url;
  }
  if (
    (url.includes(':6543') || url.includes('pooler.supabase.com')) &&
    !url.includes('pgbouncer=true')
  ) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}pgbouncer=true`;
  }
  return url;
}

export const databaseConfig = () => ({
  database: databaseConfigSchema.parse({
    DATABASE_URL: formatDatabaseUrl(process.env.DATABASE_URL),
  }),
});
