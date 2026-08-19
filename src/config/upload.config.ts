import { z } from 'zod';

/**
 * Upload configuration schema.
 */
export const uploadConfigSchema = z.object({
  UPLOAD_DIR: z.string().default('./uploads'),
  UPLOAD_MAX_FILE_SIZE: z.coerce.number().default(10 * 1024 * 1024), // 10 MB
  UPLOAD_ALLOWED_MIMES: z
    .string()
    .default(
      'image/jpeg,image/png,image/gif,image/webp,application/pdf,text/plain,text/csv,application/json',
    )
    .transform((val) => val.split(',')),
});

export type UploadConfig = z.infer<typeof uploadConfigSchema>;

export const uploadConfig = () => ({
  upload: uploadConfigSchema.parse({
    UPLOAD_DIR: process.env.UPLOAD_DIR,
    UPLOAD_MAX_FILE_SIZE: process.env.UPLOAD_MAX_FILE_SIZE,
    UPLOAD_ALLOWED_MIMES: process.env.UPLOAD_ALLOWED_MIMES,
  }),
});
