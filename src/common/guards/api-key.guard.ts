import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@common/decorators';

/**
 * API key guard example.
 * Checks for x-api-key header on non-public routes.
 *
 * NOTE: Replace with JWT / OAuth guard for production auth.
 * This is a placeholder to demonstrate the guard pattern.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Placeholder – replace with real auth logic
    return true;
  }
}
