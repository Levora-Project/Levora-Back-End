import { ExecutionContext, BadRequestException } from '@nestjs/common';
import { OAuthGuard } from './oauth.guard';
import * as providersConfig from '../config/providers.config';

// Mock the providers config module
jest.mock('../config/providers.config', () => ({
  isProviderSupported: jest.fn(),
}));

// Mock AuthGuard
jest.mock('@nestjs/passport', () => {
  return {
    AuthGuard: jest.fn((_strategy: string) => {
      return class MockAuthGuard {
        canActivate(_context: ExecutionContext): Promise<boolean> {
          return Promise.resolve(true);
        }
      };
    }),
  };
});

describe('OAuthGuard', () => {
  let guard: OAuthGuard;
  let mockExecutionContext: ExecutionContext;

  beforeEach(() => {
    guard = new OAuthGuard();
    jest.clearAllMocks();

    // Create mock execution context
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          params: {} as { provider?: string },
        }),
      }),
    } as unknown as ExecutionContext;
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should throw BadRequestException when provider is not specified', async () => {
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        BadRequestException,
      );
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Provider not specified',
      );
    });

    it('should throw BadRequestException for unsupported provider', async () => {
      const request = mockExecutionContext.switchToHttp().getRequest<{
        params?: { provider?: string };
      }>();
      if (request.params) {
        request.params.provider = 'unsupported-provider';
      }
      (providersConfig.isProviderSupported as jest.Mock).mockReturnValue(false);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        BadRequestException,
      );
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Provider unsupported-provider is not supported',
      );
    });

    it('should return true for supported provider', async () => {
      const request = mockExecutionContext.switchToHttp().getRequest<{
        params?: { provider?: string };
      }>();
      if (request.params) {
        request.params.provider = 'google';
      }
      (providersConfig.isProviderSupported as jest.Mock).mockReturnValue(true);

      const result = await guard.canActivate(mockExecutionContext);
      expect(result).toBe(true);
      expect(providersConfig.isProviderSupported).toHaveBeenCalledWith(
        'google',
      );
    });

    it('should handle lowercase provider names', async () => {
      const request = mockExecutionContext.switchToHttp().getRequest<{
        params?: { provider?: string };
      }>();
      if (request.params) {
        request.params.provider = 'GOOGLE';
      }
      (providersConfig.isProviderSupported as jest.Mock).mockReturnValue(true);

      const result = await guard.canActivate(mockExecutionContext);
      expect(result).toBe(true);
      expect(providersConfig.isProviderSupported).toHaveBeenCalledWith(
        'google',
      );
    });
  });
});
