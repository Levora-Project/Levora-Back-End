import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';

export function encryptFile(
  buffer: Buffer,
  key: string,
): { encrypted: Buffer; iv: string } {
  if (key.length !== 64) {
    throw new Error('Encryption key must be 64 hex characters (32 bytes)');
  }
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key, 'hex'), iv);

  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);

  return {
    encrypted,
    iv: iv.toString('hex'),
  };
}

export function decryptFile(
  encrypted: Buffer,
  key: string,
  ivHex: string,
): Buffer {
  if (key.length !== 64) {
    throw new Error('Encryption key must be 64 hex characters (32 bytes)');
  }
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(key, 'hex'),
    iv,
  );

  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}
