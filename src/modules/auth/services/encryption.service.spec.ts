import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EncryptionService } from './encryption.service';

describe('EncryptionService', () => {
  const validHexKey =
    '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

  let service: EncryptionService;

  const createServiceWithKey = async (key?: string) => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EncryptionService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((prop: string) => {
              if (
                prop === 'oauth.OAUTH_ENCRYPTION_KEY' ||
                prop === 'OAUTH_ENCRYPTION_KEY'
              ) {
                return key;
              }
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    return module.get<EncryptionService>(EncryptionService);
  };

  beforeEach(async () => {
    service = await createServiceWithKey(validHexKey);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Key Validation', () => {
    it('should throw if key is missing', async () => {
      const origEnv = process.env.OAUTH_ENCRYPTION_KEY;
      delete process.env.OAUTH_ENCRYPTION_KEY;
      await expect(createServiceWithKey(undefined)).rejects.toThrow(
        'Invalid or missing OAUTH_ENCRYPTION_KEY',
      );
      process.env.OAUTH_ENCRYPTION_KEY = origEnv;
    });

    it('should throw if key is shorter than 64 hex characters', async () => {
      await expect(createServiceWithKey('short-key')).rejects.toThrow(
        'Invalid or missing OAUTH_ENCRYPTION_KEY',
      );
    });

    it('should throw if key is not valid hex', async () => {
      const invalidHex = 'g'.repeat(64);
      await expect(createServiceWithKey(invalidHex)).rejects.toThrow(
        'Invalid or missing OAUTH_ENCRYPTION_KEY',
      );
    });
  });

  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt a plain string reversibly', () => {
      const plain = 'super-secret-oauth-token-12345';
      const encrypted = service.encrypt(plain);

      expect(encrypted).toBeDefined();
      expect(encrypted).toContain(':');
      expect(encrypted).not.toEqual(plain);

      const decrypted = service.decrypt(encrypted);
      expect(decrypted).toEqual(plain);
    });

    it('should return empty string for empty inputs', () => {
      expect(service.encrypt('')).toEqual('');
      expect(service.decrypt('')).toEqual('');
    });

    it('should produce different ciphertext for same input (different IVs)', () => {
      const plain = 'constant-token';
      const enc1 = service.encrypt(plain);
      const enc2 = service.encrypt(plain);

      expect(enc1).not.toEqual(enc2);
      expect(service.decrypt(enc1)).toEqual(plain);
      expect(service.decrypt(enc2)).toEqual(plain);
    });

    it('should throw for invalid encrypted format (missing colon)', () => {
      expect(() => service.decrypt('invalidciphertextwithoutcolon')).toThrow(
        'Invalid encrypted text format',
      );
    });

    it('should throw for invalid IV length', () => {
      expect(() => service.decrypt('1234:5678')).toThrow(
        'Invalid IV length for AES-256-CBC',
      );
    });

    it('should throw for corrupted ciphertext', () => {
      const plain = 'secret-token';
      const encrypted = service.encrypt(plain);
      const [ivHex] = encrypted.split(':');
      const corrupted = `${ivHex}:deadbeef99`;

      expect(() => service.decrypt(corrupted)).toThrow();
    });
  });
});
