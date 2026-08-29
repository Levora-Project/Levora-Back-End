import { GoogleStrategy } from './google.strategy';
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

describe('GoogleStrategy', () => {
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

      expect(() => new GoogleStrategy()).toThrow(
        'Google OAuth configuration is missing',
      );
    });

    it('should initialize successfully with valid config', () => {
      const mockConfig = {
        clientId: 'test-google-id',
        clientSecret: 'test-google-secret',
        redirect: 'http://localhost:3000/api/v1/auth/google/callback',
      };
      (providersConfig.getProviderConfig as jest.Mock).mockReturnValue(
        mockConfig,
      );

      expect(() => new GoogleStrategy()).not.toThrow();
    });
  });

  describe('validate', () => {
    let strategy: GoogleStrategy;
    let mockDone: jest.Mock;

    beforeEach(() => {
      const mockConfig = {
        clientId: 'test-google-id',
        clientSecret: 'test-google-secret',
        redirect: 'http://localhost:3000/api/v1/auth/google/callback',
      };
      (providersConfig.getProviderConfig as jest.Mock).mockReturnValue(
        mockConfig,
      );

      strategy = new GoogleStrategy();
      mockDone = jest.fn();
    });

    it('should format user data correctly', () => {
      const mockProfile = {
        id: '123456789',
        name: {
          givenName: 'John',
          familyName: 'Doe',
        },
        emails: [{ value: 'john.doe@example.com' }],
        photos: [{ value: 'https://example.com/photo.jpg' }],
      };

      strategy.validate('access-token', 'refresh-token', mockProfile, mockDone);

      expect(mockDone).toHaveBeenCalledWith(null, {
        profile: {
          id: '123456789',
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
          picture: 'https://example.com/photo.jpg',
          provider: 'google',
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('should handle missing refresh token', () => {
      const mockProfile = {
        id: '123456789',
        name: {
          givenName: 'John',
          familyName: 'Doe',
        },
        emails: [{ value: 'john.doe@example.com' }],
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
  });
});
