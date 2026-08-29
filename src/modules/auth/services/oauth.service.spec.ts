import { Test, TestingModule } from '@nestjs/testing';
import { OAuthService } from './oauth.service';
import * as providersConfig from '../config/providers.config';

// Mock the providers config module
jest.mock('../config/providers.config', () => ({
  getSupportedProviders: jest.fn(),
  getAllSupportedProviders: jest.fn(),
  getConfiguredProviders: jest.fn(),
  isProviderSupported: jest.fn(),
  isProviderConfigured: jest.fn(),
  getProviderConfig: jest.fn(),
}));

describe('OAuthService', () => {
  let service: OAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OAuthService],
    }).compile();

    service = module.get<OAuthService>(OAuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSupportedProviders', () => {
    it('should return all providers with strategies', () => {
      const mockProviders = ['google', 'facebook', 'linkedin', 'apple'];
      (providersConfig.getAllSupportedProviders as jest.Mock).mockReturnValue(
        mockProviders,
      );

      const result = service.getSupportedProviders();
      expect(result).toEqual(mockProviders);
      expect(providersConfig.getAllSupportedProviders).toHaveBeenCalled();
    });
  });

  describe('getConfiguredProviders', () => {
    it('should return configured providers from env', () => {
      const mockProviders = ['google', 'facebook'];
      (providersConfig.getConfiguredProviders as jest.Mock).mockReturnValue(
        mockProviders,
      );

      const result = service.getConfiguredProviders();
      expect(result).toEqual(mockProviders);
      expect(providersConfig.getConfiguredProviders).toHaveBeenCalled();
    });
  });

  describe('isProviderSupported', () => {
    it('should return true for provider with strategy', () => {
      (providersConfig.isProviderSupported as jest.Mock).mockReturnValue(true);

      const result = service.isProviderSupported('google');
      expect(result).toBe(true);
      expect(providersConfig.isProviderSupported).toHaveBeenCalledWith(
        'google',
      );
    });

    it('should return false for provider without strategy', () => {
      (providersConfig.isProviderSupported as jest.Mock).mockReturnValue(false);

      const result = service.isProviderSupported('twitter');
      expect(result).toBe(false);
      expect(providersConfig.isProviderSupported).toHaveBeenCalledWith(
        'twitter',
      );
    });
  });

  describe('isProviderConfigured', () => {
    it('should return true for configured provider', () => {
      (providersConfig.isProviderConfigured as jest.Mock).mockReturnValue(true);

      const result = service.isProviderConfigured('google');
      expect(result).toBe(true);
      expect(providersConfig.isProviderConfigured).toHaveBeenCalledWith(
        'google',
      );
    });

    it('should return false for unconfigured provider', () => {
      (providersConfig.isProviderConfigured as jest.Mock).mockReturnValue(
        false,
      );

      const result = service.isProviderConfigured('google');
      expect(result).toBe(false);
      expect(providersConfig.isProviderConfigured).toHaveBeenCalledWith(
        'google',
      );
    });
  });

  describe('getProviderConfig', () => {
    it('should return provider config', () => {
      const mockConfig = {
        clientId: 'test-id',
        clientSecret: 'test-secret',
        redirect: 'http://localhost:3000/api/v1/auth/google/callback',
      };
      (providersConfig.getProviderConfig as jest.Mock).mockReturnValue(
        mockConfig,
      );

      const result = service.getProviderConfig('google');
      expect(result).toEqual(mockConfig);
      expect(providersConfig.getProviderConfig).toHaveBeenCalledWith('google');
    });

    it('should return undefined for invalid provider', () => {
      (providersConfig.getProviderConfig as jest.Mock).mockReturnValue(
        undefined,
      );

      const result = service.getProviderConfig('linkedin');
      expect(result).toBeUndefined();
      expect(providersConfig.getProviderConfig).toHaveBeenCalledWith(
        'linkedin',
      );
    });
  });
});
