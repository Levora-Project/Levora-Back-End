import { LinkedInStrategy } from './linkedin.strategy';
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

describe('LinkedInStrategy', () => {
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

      const strategy = new LinkedInStrategy(mockConfigService as ConfigService);
      expect(strategy).toBeDefined();
    });

    it('should initialize successfully with valid config', () => {
      (mockConfigService.get as jest.Mock).mockImplementation((key: string) => {
        if (key === 'LINKEDIN_CLIENT_ID') {
          return 'test-linkedin-id';
        }
        if (key === 'LINKEDIN_CLIENT_SECRET') {
          return 'test-linkedin-secret';
        }
        if (key === 'LINKEDIN_CALLBACK_URL') {
          return 'http://localhost:3000/api/v1/auth/linkedin/callback';
        }
        return undefined;
      });

      expect(
        () => new LinkedInStrategy(mockConfigService as ConfigService),
      ).not.toThrow();
    });
  });

  describe('validate', () => {
    let strategy: LinkedInStrategy;
    let mockDone: jest.Mock;

    beforeEach(() => {
      (mockConfigService.get as jest.Mock).mockImplementation((key: string) => {
        if (key === 'LINKEDIN_CLIENT_ID') {
          return 'test-linkedin-id';
        }
        if (key === 'LINKEDIN_CLIENT_SECRET') {
          return 'test-linkedin-secret';
        }
        if (key === 'LINKEDIN_CALLBACK_URL') {
          return 'http://localhost:3000/api/v1/auth/linkedin/callback';
        }
        return undefined;
      });

      strategy = new LinkedInStrategy(mockConfigService as ConfigService);
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
