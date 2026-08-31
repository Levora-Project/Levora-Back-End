import { Test, TestingModule } from '@nestjs/testing';
import { OAuthService } from './oauth.service';
import { ConfigService } from '@nestjs/config';
import * as providersConfig from '../config/providers.config';

// Mock the providers config module
jest.mock('../config/providers.config', () => ({
  getAllSupportedProviders: jest.fn(),
  isProviderSupported: jest.fn(),
  isProviderConfigured: jest.fn(),
}));

describe('OAuthService', () => {
  let service: OAuthService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuthService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OAuthService>(OAuthService);
    configService = module.get<ConfigService>(ConfigService);
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
      (providersConfig.getAllSupportedProviders as jest.Mock).mockReturnValue(
        mockProviders,
      );
      (providersConfig.isProviderConfigured as jest.Mock).mockImplementation(
        (provider: string) => provider === 'google',
      );

      const result = service.getConfiguredProviders();
      expect(result).toEqual(['google']);
      expect(providersConfig.isProviderConfigured).toHaveBeenCalledTimes(2);
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
        configService,
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
        configService,
      );
    });
  });

  describe('getProviderConfig', () => {
    it('should return provider config', () => {
      (providersConfig.isProviderConfigured as jest.Mock).mockReturnValue(true);
      (configService.get as jest.Mock).mockImplementation((key: string) => {
        if (key === 'oauth.GOOGLE_CLIENT_ID') {
          return 'test-id';
        }
        if (key === 'oauth.GOOGLE_CLIENT_SECRET') {
          return 'test-secret';
        }
        if (key === 'oauth.GOOGLE_CALLBACK_URL') {
          return 'http://localhost:3000/api/v1/auth/google/callback';
        }
        return undefined;
      });

      const result = service.getProviderConfig('google');
      expect(result).toEqual({
        clientId: 'test-id',
        clientSecret: 'test-secret',
        redirect: 'http://localhost:3000/api/v1/auth/google/callback',
      });
    });

    it('should return undefined for invalid provider', () => {
      (providersConfig.isProviderConfigured as jest.Mock).mockReturnValue(
        false,
      );

      const result = service.getProviderConfig('linkedin');
      expect(result).toBeUndefined();
    });
  });
});
