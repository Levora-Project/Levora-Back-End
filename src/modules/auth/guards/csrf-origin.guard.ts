import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class CsrfOriginGuard implements CanActivate {
  private readonly logger = new Logger(CsrfOriginGuard.name);

  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    // Read from security config or root env
    const allowedOriginsStr =
      this.configService.get<string>('security.ALLOWED_ORIGINS') ||
      this.configService.get<string>('ALLOWED_ORIGINS');

    const isDev =
      this.configService.get<string>('app.NODE_ENV') !== 'production';

    // 1. Extract origin
    let origin = request.headers.origin;

    if (!origin && request.headers.referer) {
      try {
        const url = new URL(request.headers.referer);
        origin = url.origin;
      } catch {
        // invalid referer, ignore
      }
    }

    if (Array.isArray(origin)) {
      origin = origin[0];
    }

    if (typeof origin === 'string' && origin.length > 2000) {
      throw new ForbiddenException('CSRF protection: Origin header too long');
    }

    // 2. Check if origin is present
    if (!origin) {
      if (isDev) {
        this.logger.warn(
          'No Origin or Referer header present in development. Allowing request.',
        );
        return true;
      }
      throw new ForbiddenException('CSRF protection: Origin header is missing');
    }

    // 3. Check if ALLOWED_ORIGINS is configured
    if (!allowedOriginsStr || !allowedOriginsStr.trim()) {
      if (isDev) {
        this.logger.warn(
          'ALLOWED_ORIGINS is not configured in development. Allowing request.',
        );
        return true;
      }
      throw new ForbiddenException(
        'CSRF protection: ALLOWED_ORIGINS not configured',
      );
    }

    // Normalize helper
    const normalizeOrigin = (o: string): string => {
      let str = o.trim();
      if (str.endsWith('/')) {
        str = str.slice(0, -1);
      }
      return str.toLowerCase();
    };

    const normalizedReqOrigin = normalizeOrigin(origin);

    // 4. Validate origin against allowed list
    const allowedOrigins = allowedOriginsStr
      .split(',')
      .map((o) => normalizeOrigin(o))
      .filter(Boolean);

    const isAllowed = allowedOrigins.some((allowedOrigin) => {
      if (allowedOrigin.includes('*')) {
        const escapeRegExp = (str: string) =>
          str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = allowedOrigin.split('*').map(escapeRegExp).join('.*');
        const regex = new RegExp(`^${pattern}$`, 'i');
        return regex.test(normalizedReqOrigin);
      }
      return allowedOrigin === normalizedReqOrigin;
    });

    if (!isAllowed) {
      throw new ForbiddenException(
        `CSRF protection: Origin ${origin} is not allowed`,
      );
    }

    return true;
  }
}
