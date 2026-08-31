import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key: Buffer;

  constructor(private readonly config: ConfigService) {
    const rawKey = this.config.get<string>('oauth.OAUTH_ENCRYPTION_KEY');

    if (!rawKey || rawKey.length !== 64 || !/^[0-9a-fA-F]{64}$/.test(rawKey)) {
      throw new Error(
        'Invalid or missing OAUTH_ENCRYPTION_KEY. Must be a 64-character hexadecimal string (32 bytes).',
      );
    }

    this.key = Buffer.from(rawKey, 'hex');
  }

  /**
   * Encrypts plain text using AES-256-CBC with a random 16-byte IV.
   * Returns formatted string `ivHex:encryptedHex`.
   */
  encrypt(text: string): string {
    if (!text) {
      return '';
    }

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return `${iv.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypts formatted `ivHex:encryptedHex` cipher text back to plain text UTF-8.
   */
  decrypt(cipherText: string): string {
    if (!cipherText) {
      return '';
    }

    const parts = cipherText.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted text format. Expected iv:content');
    }

    const [ivHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');

    if (iv.length !== 16) {
      throw new Error('Invalid IV length for AES-256-CBC');
    }

    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
