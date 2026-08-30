import { GoogleStrategy } from './google.strategy';
import { ConfigService } from '@nestjs/config';

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
  let mockConfigService: Partial<ConfigService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockConfigService = {
      get: jest.fn(),
    };
  });

  describe('constructor', () => {
    it('should initialize with DISABLED when config is missing', () => {
      (mockConfigService.get as jest.Mock).mockReturnValue(undefined);

      const strategy = new GoogleStrategy(mockConfigService as ConfigService);
      expect(strategy).toBeDefined();
    });

    it('should initialize successfully with valid config', () => {
      (mockConfigService.get as jest.Mock).mockImplementation((key: string) => {
        if (key === 'GOOGLE_CLIENT_ID') {
          return 'test-google-id';
        }
        if (key === 'GOOGLE_CLIENT_SECRET') {
          return 'test-google-secret';
        }
        if (key === 'GOOGLE_CALLBACK_URL') {
          return 'http://localhost:3000/api/v1/auth/google/callback';
        }
        return undefined;
      });

      expect(
        () => new GoogleStrategy(mockConfigService as ConfigService),
      ).not.toThrow();
    });
  });

  describe('validate', () => {
    let strategy: GoogleStrategy;
    let mockDone: jest.Mock;

    beforeEach(() => {
      (mockConfigService.get as jest.Mock).mockImplementation((key: string) => {
        if (key === 'GOOGLE_CLIENT_ID') {
          return 'test-google-id';
        }
        if (key === 'GOOGLE_CLIENT_SECRET') {
          return 'test-google-secret';
        }
        if (key === 'GOOGLE_CALLBACK_URL') {
          return 'http://localhost:3000/api/v1/auth/google/callback';
        }
        return undefined;
      });

      strategy = new GoogleStrategy(mockConfigService as ConfigService);
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
