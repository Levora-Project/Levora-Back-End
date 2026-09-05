export interface StorageService {
  upload(
    file: Buffer,
    filename: string,
    mimeType: string,
  ): Promise<{ key: string; url?: string }>;
  download(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  getSignedUrl(key: string, expiresIn: number): Promise<string>;
}
