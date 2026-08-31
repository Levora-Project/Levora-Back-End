import { z } from 'zod';

export const oauthConfigSchema = z.object({
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().optional(),
  LINKEDIN_CLIENT_ID: z.string().optional(),
  LINKEDIN_CLIENT_SECRET: z.string().optional(),
  LINKEDIN_CALLBACK_URL: z.string().optional(),
  OAUTH_ENCRYPTION_KEY: z
    .string()
    .min(
      64,
      'OAUTH_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)',
    )
    .max(
      64,
      'OAUTH_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)',
    )
    .regex(
      /^[0-9a-fA-F]{64}$/,
      'OAUTH_ENCRYPTION_KEY must be a valid hex string',
    )
    .default(
      process.env.NODE_ENV === 'production'
        ? (undefined as unknown as string)
        : '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    ),
});

export type OAuthConfig = z.infer<typeof oauthConfigSchema>;

export const oauthConfig = () => ({
  oauth: oauthConfigSchema.parse({
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
    LINKEDIN_CLIENT_ID: process.env.LINKEDIN_CLIENT_ID,
    LINKEDIN_CLIENT_SECRET: process.env.LINKEDIN_CLIENT_SECRET,
    LINKEDIN_CALLBACK_URL: process.env.LINKEDIN_CALLBACK_URL,
    OAUTH_ENCRYPTION_KEY: process.env.OAUTH_ENCRYPTION_KEY,
  }),
});
