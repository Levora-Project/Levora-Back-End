import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { CsrfOriginGuard } from './csrf-origin.guard';

describe('CsrfOriginGuard', () => {
  let guard: CsrfOriginGuard;
  let mockConfigService: any;

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CsrfOriginGuard,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    guard = module.get<CsrfOriginGuard>(CsrfOriginGuard);
  });

  const createMockContext = (
    headers: Record<string, string | string[]>,
  ): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ headers }),
      }),
    } as any;
  };

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow request when origin matches allowed origins exactly', () => {
    mockConfigService.get.mockReturnValue(
      'http://localhost:3000, https://example.com',
    );
    const context = createMockContext({ origin: 'https://example.com' });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow request when origin matches wildcard', () => {
    mockConfigService.get.mockReturnValue('https://*.example.com');
    const context = createMockContext({ origin: 'https://sub.example.com' });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny request when origin is not in allowed origins', () => {
    mockConfigService.get.mockReturnValue(
      'http://localhost:3000, https://example.com',
    );
    const context = createMockContext({ origin: 'https://hacker.com' });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(context)).toThrow(
      'CSRF protection: Origin https://hacker.com is not allowed',
    );
  });

  it('should deny request when origin is a partial match of an allowed domain', () => {
    mockConfigService.get.mockReturnValue('https://allowed-site.com');
    const context = createMockContext({
      origin: 'https://attacker.com/allowed-site.com',
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(context)).toThrow(
      'CSRF protection: Origin https://attacker.com/allowed-site.com is not allowed',
    );
  });

  it('should handle request with extremely long Origin gracefully (403)', () => {
    mockConfigService.get.mockReturnValue('https://example.com');
    const longOrigin = 'https://example.com/'.padEnd(2500, 'a');
    const context = createMockContext({ origin: longOrigin });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(context)).toThrow(
      'CSRF protection: Origin header too long',
    );
  });

  it('should allow origin with trailing slash when allowed list lacks trailing slash', () => {
    mockConfigService.get.mockReturnValue('https://example.com');
    const context = createMockContext({ origin: 'https://example.com/' });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow origin when allowed list has trailing slash but request lacks it', () => {
    mockConfigService.get.mockReturnValue('https://example.com/');
    const context = createMockContext({ origin: 'https://example.com' });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny all requests if ALLOWED_ORIGINS is an empty string in prod', () => {
    mockConfigService.get.mockImplementation((key: string) => {
      if (key === 'app.NODE_ENV') {
        return 'production';
      }
      return '   ';
    });
    const context = createMockContext({ origin: 'https://example.com' });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(context)).toThrow(
      'CSRF protection: ALLOWED_ORIGINS not configured',
    );
  });

  it('should handle ALLOWED_ORIGINS with irregular spaces', () => {
    mockConfigService.get.mockReturnValue(
      '  https://a.com  ,   https://b.com   ',
    );
    const context1 = createMockContext({ origin: 'https://a.com' });
    const context2 = createMockContext({ origin: 'https://b.com' });

    expect(guard.canActivate(context1)).toBe(true);
    expect(guard.canActivate(context2)).toBe(true);
  });

  it('should fallback to referer if origin is missing', () => {
    mockConfigService.get.mockReturnValue('https://example.com');
    const context = createMockContext({
      referer: 'https://example.com/some/path',
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny request if no origin and no referer in production', () => {
    mockConfigService.get.mockImplementation((key: string) => {
      if (key === 'app.NODE_ENV') {
        return 'production';
      }
      return 'https://example.com';
    });
    const context = createMockContext({});

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(context)).toThrow(
      'CSRF protection: Origin header is missing',
    );
  });
});
