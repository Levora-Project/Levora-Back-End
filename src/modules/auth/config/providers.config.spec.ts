import { ConfigService } from '@nestjs/config';
import {
  isProviderSupported,
  isProviderConfigured,
  getAllSupportedProviders,
} from './providers.config';

describe('Providers Configuration', () => {
  let configService: ConfigService;

  beforeEach(() => {
    configService = new ConfigService();
  });

  describe('getAllSupportedProviders', () => {
    it('should return all providers', () => {
      const providers = getAllSupportedProviders();
      expect(providers).toContain('google');
      expect(providers).toContain('linkedin');
    });
  });

  describe('isProviderSupported', () => {
    it('should return true for providers with strategies', () => {
      expect(isProviderSupported('google')).toBe(true);
      expect(isProviderSupported('linkedin')).toBe(true);
    });

    it('should return false for unsupported provider', () => {
      expect(isProviderSupported('twitter')).toBe(false);
    });
  });

  describe('isProviderConfigured', () => {
    it('should return true for configured provider', () => {
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key.startsWith('oauth.GOOGLE_')) {
          return 'value';
        }
        return undefined;
      });
      expect(isProviderConfigured('google', configService)).toBe(true);
    });

    it('should return false for unconfigured provider', () => {
      jest.spyOn(configService, 'get').mockReturnValue(undefined);
      expect(isProviderConfigured('google', configService)).toBe(false);
    });
  });
});
