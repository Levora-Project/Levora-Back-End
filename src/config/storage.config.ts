import { z } from 'zod';

export const storageConfigSchema = z.object({
  PROVIDER: z.enum(['local', 's3']).default('local'),
  ENCRYPTION_KEY: z
    .string()
    .length(64, 'STORAGE_ENCRYPTION_KEY must be exactly 64 hex characters'),
  LOCAL_UPLOAD_PATH: z.string().default('./uploads'),
  S3_REGION: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  S3_ENDPOINT: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  MAX_DOCUMENTS: z.coerce.number().default(20),
  SIGNED_URL_EXPIRES: z.coerce.number().default(300),
});

export type StorageConfig = z.infer<typeof storageConfigSchema>;

export const storageConfig = () => {
  const parsed = storageConfigSchema.parse({
    PROVIDER: process.env.STORAGE_PROVIDER || 'local',
    ENCRYPTION_KEY:
      process.env.STORAGE_ENCRYPTION_KEY ||
      '0000000000000000000000000000000000000000000000000000000000000000',
    LOCAL_UPLOAD_PATH: process.env.UPLOAD_DIR || './uploads',
    S3_REGION: process.env.FILEBASE_REGION,
    S3_ACCESS_KEY: process.env.FILEBASE_ACCESS_KEY,
    S3_SECRET_KEY: process.env.FILEBASE_SECRET_KEY,
    S3_ENDPOINT: process.env.FILEBASE_ENDPOINT,
    S3_BUCKET: process.env.FILEBASE_BUCKET,
    MAX_DOCUMENTS: process.env.MAX_DOCUMENTS,
    SIGNED_URL_EXPIRES: process.env.SIGNED_URL_EXPIRES,
  });

  return {
    storage: {
      provider: parsed.PROVIDER,
      encryption: {
        key: parsed.ENCRYPTION_KEY,
      },
      local: {
        uploadPath: parsed.LOCAL_UPLOAD_PATH,
      },
      s3: {
        region: parsed.S3_REGION,
        accessKeyId: parsed.S3_ACCESS_KEY,
        secretAccessKey: parsed.S3_SECRET_KEY,
        endpoint: parsed.S3_ENDPOINT,
        bucket: parsed.S3_BUCKET,
      },
      limits: {
        maxDocuments: parsed.MAX_DOCUMENTS,
        signedUrlExpires: parsed.SIGNED_URL_EXPIRES,
      },
    },
  };
};
