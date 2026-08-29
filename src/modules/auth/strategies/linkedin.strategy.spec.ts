import { LinkedInStrategy } from './linkedin.strategy';
import * as providersConfig from '../config/providers.config';

// Mock the providers config module
jest.mock('../config/providers.config', () => ({
  getProviderConfig: jest.fn(),
}));

// Mock PassportStrategy
jest.mock('@nestjs/passport', () => {
  return {
    PassportStrategy: jest.fn((_Strategy, _name) => {
      return class MockPassportStrategy {
        constructor(_options: unknown) {}
        validate(..._args: unknown[]) {}
      };
    }),
  };
});

describe('LinkedInStrategy', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('constructor', () => {
    it('should throw error when config is missing', () => {
      (providersConfig.getProviderConfig as jest.Mock).mockReturnValue(
        undefined,
      );

      expect(() => new LinkedInStrategy()).toThrow(
        'LinkedIn OAuth configuration is missing',
      );
    });

    it('should initialize successfully with valid config', () => {
      const mockConfig = {
        clientId: 'test-linkedin-id',
        clientSecret: 'test-linkedin-secret',
        redirect: 'http://localhost:3000/api/v1/auth/linkedin/callback',
      };
      (providersConfig.getProviderConfig as jest.Mock).mockReturnValue(
        mockConfig,
      );

      expect(() => new LinkedInStrategy()).not.toThrow();
    });
  });

  describe('validate', () => {
    let strategy: LinkedInStrategy;
    let mockDone: jest.Mock;

    beforeEach(() => {
      const mockConfig = {
        clientId: 'test-linkedin-id',
        clientSecret: 'test-linkedin-secret',
        redirect: 'http://localhost:3000/api/v1/auth/linkedin/callback',
      };
      (providersConfig.getProviderConfig as jest.Mock).mockReturnValue(
        mockConfig,
      );

      strategy = new LinkedInStrategy();
      mockDone = jest.fn();
    });

    it('should format user data correctly', () => {
      const mockProfile = {
        id: '123456789',
        name: {
          givenName: 'Alice',
          familyName: 'Johnson',
        },
        emails: [{ value: 'alice.johnson@example.com' }],
        photos: [{ value: 'https://example.com/photo.jpg' }],
      };

      strategy.validate('access-token', 'refresh-token', mockProfile, mockDone);

      expect(mockDone).toHaveBeenCalledWith(null, {
        profile: {
          id: '123456789',
          email: 'alice.johnson@example.com',
          firstName: 'Alice',
          lastName: 'Johnson',
          picture: 'https://example.com/photo.jpg',
          provider: 'linkedin',
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('should handle missing refresh token', () => {
      const mockProfile = {
        id: '123456789',
        name: {
          givenName: 'Alice',
          familyName: 'Johnson',
        },
        emails: [{ value: 'alice.johnson@example.com' }],
        photos: [{ value: 'https://example.com/photo.jpg' }],
      };

      strategy.validate('access-token', null, mockProfile, mockDone);

      expect(mockDone).toHaveBeenCalledWith(
        null,
        expect.objectContaining({
          refreshToken: null,
        }),
      );
    });

    it('should handle missing optional fields', () => {
      const mockProfile = {
        id: '123456789',
        name: {
          givenName: 'Alice',
          familyName: 'Johnson',
        },
        emails: undefined,
        photos: undefined,
      };

      strategy.validate('access-token', null, mockProfile, mockDone);

      expect(mockDone).toHaveBeenCalledWith(
        null,
        expect.objectContaining({
          profile: expect.objectContaining({
            email: undefined,
            picture: undefined,
          }),
          refreshToken: null,
        }) as unknown,
      );
    });
  });
});
