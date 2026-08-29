import {
  getProvidersConfig,
  getConfiguredProviders,
  getAllSupportedProviders,
  getProviderConfig,
  isProviderSupported,
  isProviderConfigured,
} from './providers.config';

describe('ProvidersConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getProvidersConfig', () => {
    it('should return empty config when no env vars are set', () => {
      delete process.env.GOOGLE_CLIENT_ID;
      delete process.env.GOOGLE_CLIENT_SECRET;
      delete process.env.GOOGLE_CALLBACK_URL;
      delete process.env.LINKEDIN_CLIENT_ID;
      delete process.env.LINKEDIN_CLIENT_SECRET;
      delete process.env.LINKEDIN_CALLBACK_URL;

      const config = getProvidersConfig();
      expect(config).toEqual({});
    });

    it('should return Google config when Google env vars are set', () => {
      process.env.GOOGLE_CLIENT_ID = 'test-google-id';
      process.env.GOOGLE_CLIENT_SECRET = 'test-google-secret';
      process.env.GOOGLE_CALLBACK_URL =
        'http://localhost:3000/api/v1/auth/google/callback';

      const config = getProvidersConfig();
      expect(config.google).toEqual({
        clientId: 'test-google-id',
        clientSecret: 'test-google-secret',
        redirect: 'http://localhost:3000/api/v1/auth/google/callback',
      });
    });

    it('should return LinkedIn config when LinkedIn env vars are set', () => {
      process.env.LINKEDIN_CLIENT_ID = 'test-linkedin-id';
      process.env.LINKEDIN_CLIENT_SECRET = 'test-linkedin-secret';
      process.env.LINKEDIN_CALLBACK_URL =
        'http://localhost:3000/api/v1/auth/linkedin/callback';

      const config = getProvidersConfig();
      expect(config.linkedin).toEqual({
        clientId: 'test-linkedin-id',
        clientSecret: 'test-linkedin-secret',
        redirect: 'http://localhost:3000/api/v1/auth/linkedin/callback',
      });
    });

    it('should return all configs when all providers are configured', () => {
      process.env.GOOGLE_CLIENT_ID = 'test-google-id';
      process.env.GOOGLE_CLIENT_SECRET = 'test-google-secret';
      process.env.GOOGLE_CALLBACK_URL =
        'http://localhost:3000/api/v1/auth/google/callback';
      process.env.LINKEDIN_CLIENT_ID = 'test-linkedin-id';
      process.env.LINKEDIN_CLIENT_SECRET = 'test-linkedin-secret';
      process.env.LINKEDIN_CALLBACK_URL =
        'http://localhost:3000/api/v1/auth/linkedin/callback';

      const config = getProvidersConfig();
      expect(config.google).toBeDefined();
      expect(config.linkedin).toBeDefined();
      expect(Object.keys(config).length).toBe(2);
    });

    it('should not include Google if any env var is missing', () => {
      process.env.GOOGLE_CLIENT_ID = 'test-google-id';
      process.env.GOOGLE_CLIENT_SECRET = 'test-google-secret';
      delete process.env.GOOGLE_CALLBACK_URL;

      const config = getProvidersConfig();
      expect(config.google).toBeUndefined();
    });

    it('should not include LinkedIn if any env var is missing', () => {
      process.env.LINKEDIN_CLIENT_ID = 'test-linkedin-id';
      delete process.env.LINKEDIN_CLIENT_SECRET;
      process.env.LINKEDIN_CALLBACK_URL =
        'http://localhost:3000/api/v1/auth/linkedin/callback';

      const config = getProvidersConfig();
      expect(config.linkedin).toBeUndefined();
    });
  });

  describe('getAllSupportedProviders', () => {
    it('should return all providers with strategies regardless of config', () => {
      delete process.env.GOOGLE_CLIENT_ID;
      delete process.env.LINKEDIN_CLIENT_ID;

      const providers = getAllSupportedProviders();
      expect(providers).toContain('google');
      expect(providers).toContain('linkedin');
      expect(providers.length).toBe(2);
    });
  });

  describe('getConfiguredProviders', () => {
    it('should return empty array when no providers are configured', () => {
      delete process.env.GOOGLE_CLIENT_ID;
      delete process.env.LINKEDIN_CLIENT_ID;

      const providers = getConfiguredProviders();
      expect(providers).toEqual([]);
    });

    it('should return Google when only Google is configured', () => {
      process.env.GOOGLE_CLIENT_ID = 'test-id';
      process.env.GOOGLE_CLIENT_SECRET = 'test-secret';
      process.env.GOOGLE_CALLBACK_URL =
        'http://localhost:3000/api/v1/auth/google/callback';
      delete process.env.LINKEDIN_CLIENT_ID;

      const providers = getConfiguredProviders();
      expect(providers).toEqual(['google']);
    });

    it('should return LinkedIn when only LinkedIn is configured', () => {
      delete process.env.GOOGLE_CLIENT_ID;
      process.env.LINKEDIN_CLIENT_ID = 'test-id';
      process.env.LINKEDIN_CLIENT_SECRET = 'test-secret';
      process.env.LINKEDIN_CALLBACK_URL =
        'http://localhost:3000/api/v1/auth/linkedin/callback';

      const providers = getConfiguredProviders();
      expect(providers).toEqual(['linkedin']);
    });

    it('should return all providers when all are configured', () => {
      process.env.GOOGLE_CLIENT_ID = 'test-google-id';
      process.env.GOOGLE_CLIENT_SECRET = 'test-google-secret';
      process.env.GOOGLE_CALLBACK_URL =
        'http://localhost:3000/api/v1/auth/google/callback';
      process.env.LINKEDIN_CLIENT_ID = 'test-linkedin-id';
      process.env.LINKEDIN_CLIENT_SECRET = 'test-linkedin-secret';
      process.env.LINKEDIN_CALLBACK_URL =
        'http://localhost:3000/api/v1/auth/linkedin/callback';

      const providers = getConfiguredProviders();
      expect(providers).toContain('google');
      expect(providers).toContain('linkedin');
      expect(providers.length).toBe(2);
    });
  });

  describe('getProviderConfig', () => {
    beforeEach(() => {
      process.env.GOOGLE_CLIENT_ID = 'test-google-id';
      process.env.GOOGLE_CLIENT_SECRET = 'test-google-secret';
      process.env.GOOGLE_CALLBACK_URL =
        'http://localhost:3000/api/v1/auth/google/callback';
    });

    it('should return config for valid provider', () => {
      const config = getProviderConfig('google');
      expect(config).toEqual({
        clientId: 'test-google-id',
        clientSecret: 'test-google-secret',
        redirect: 'http://localhost:3000/api/v1/auth/google/callback',
      });
    });

    it('should return config for LinkedIn provider', () => {
      process.env.LINKEDIN_CLIENT_ID = 'test-linkedin-id';
      process.env.LINKEDIN_CLIENT_SECRET = 'test-linkedin-secret';
      process.env.LINKEDIN_CALLBACK_URL =
        'http://localhost:3000/api/v1/auth/linkedin/callback';

      const config = getProviderConfig('linkedin');
      expect(config).toEqual({
        clientId: 'test-linkedin-id',
        clientSecret: 'test-linkedin-secret',
        redirect: 'http://localhost:3000/api/v1/auth/linkedin/callback',
      });
    });

    it('should return undefined for invalid provider', () => {
      const config = getProviderConfig('twitter');
      expect(config).toBeUndefined();
    });

    it('should be case-insensitive', () => {
      process.env.LINKEDIN_CLIENT_ID = 'test-linkedin-id';
      process.env.LINKEDIN_CLIENT_SECRET = 'test-linkedin-secret';
      process.env.LINKEDIN_CALLBACK_URL =
        'http://localhost:3000/api/v1/auth/linkedin/callback';

      const config1 = getProviderConfig('GOOGLE');
      const config2 = getProviderConfig('Google');
      const config3 = getProviderConfig('google');
      const linkedin1 = getProviderConfig('LINKEDIN');
      const linkedin2 = getProviderConfig('LinkedIn');
      const linkedin3 = getProviderConfig('linkedin');

      expect(config1).toBeDefined();
      expect(config2).toBeDefined();
      expect(config3).toBeDefined();
      expect(config1).toEqual(config2);
      expect(config2).toEqual(config3);
      expect(linkedin1).toBeDefined();
      expect(linkedin2).toBeDefined();
      expect(linkedin3).toBeDefined();
      expect(linkedin1).toEqual(linkedin2);
      expect(linkedin2).toEqual(linkedin3);
    });
  });

  describe('isProviderSupported', () => {
    it('should return true for providers with strategies (google)', () => {
      delete process.env.GOOGLE_CLIENT_ID;
      expect(isProviderSupported('google')).toBe(true);
    });

    it('should return true for providers with strategies (linkedin)', () => {
      delete process.env.LINKEDIN_CLIENT_ID;
      expect(isProviderSupported('linkedin')).toBe(true);
    });

    it('should return false for unsupported provider (no strategy)', () => {
      expect(isProviderSupported('twitter')).toBe(false);
      expect(isProviderSupported('facebook')).toBe(false);
      expect(isProviderSupported('apple')).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(isProviderSupported('GOOGLE')).toBe(true);
      expect(isProviderSupported('Google')).toBe(true);
      expect(isProviderSupported('google')).toBe(true);
      expect(isProviderSupported('LINKEDIN')).toBe(true);
      expect(isProviderSupported('LinkedIn')).toBe(true);
      expect(isProviderSupported('linkedin')).toBe(true);
    });
  });

  describe('isProviderConfigured', () => {
    beforeEach(() => {
      delete process.env.GOOGLE_CLIENT_ID;
      delete process.env.LINKEDIN_CLIENT_ID;
    });

    it('should return true for configured provider', () => {
      process.env.GOOGLE_CLIENT_ID = 'test-google-id';
      process.env.GOOGLE_CLIENT_SECRET = 'test-google-secret';
      process.env.GOOGLE_CALLBACK_URL =
        'http://localhost:3000/api/v1/auth/google/callback';

      expect(isProviderConfigured('google')).toBe(true);
    });

    it('should return true for LinkedIn when configured', () => {
      process.env.LINKEDIN_CLIENT_ID = 'test-linkedin-id';
      process.env.LINKEDIN_CLIENT_SECRET = 'test-linkedin-secret';
      process.env.LINKEDIN_CALLBACK_URL =
        'http://localhost:3000/api/v1/auth/linkedin/callback';

      expect(isProviderConfigured('linkedin')).toBe(true);
    });

    it('should return false for unsupported provider', () => {
      expect(isProviderConfigured('twitter')).toBe(false);
    });

    it('should return false when provider is not configured', () => {
      expect(isProviderConfigured('google')).toBe(false);
    });

    it('should return false when only some env vars are set', () => {
      process.env.GOOGLE_CLIENT_ID = 'test-id';
      expect(isProviderConfigured('google')).toBe(false);
    });

    it('should be case-insensitive', () => {
      process.env.GOOGLE_CLIENT_ID = 'test-google-id';
      process.env.GOOGLE_CLIENT_SECRET = 'test-google-secret';
      process.env.GOOGLE_CALLBACK_URL =
        'http://localhost:3000/api/v1/auth/google/callback';

      expect(isProviderConfigured('GOOGLE')).toBe(true);
      expect(isProviderConfigured('Google')).toBe(true);
      expect(isProviderConfigured('google')).toBe(true);
    });
  });
});
