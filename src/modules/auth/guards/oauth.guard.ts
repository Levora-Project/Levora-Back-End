import {
  BadRequestException,
  UnauthorizedException,
  Injectable,
  ExecutionContext,
  CanActivate,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import {
  isProviderSupported,
  isProviderConfigured,
} from '../config/providers.config';

@Injectable()
export class OAuthGuard implements CanActivate {
  private guardCache = new Map<string, CanActivate>();

  constructor(private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      params?: { provider?: string };
    }>();
    const provider = request.params?.provider?.toLowerCase();

    if (!provider) {
      throw new BadRequestException('Provider not specified');
    }

    if (!isProviderSupported(provider)) {
      throw new BadRequestException(`Provider ${provider} is not supported`);
    }

    if (!isProviderConfigured(provider, this.configService)) {
      throw new BadRequestException(
        `Provider ${provider} is not configured. Please check environment variables.`,
      );
    }

    let guard = this.guardCache.get(provider);
    if (!guard) {
      const GuardClass = this.createGuardClass(provider);
      guard = new GuardClass();
      this.guardCache.set(provider, guard);
    }

    return guard.canActivate(context) as Promise<boolean>;
  }

  private createGuardClass(strategyName: string): new () => CanActivate {
    return class extends AuthGuard(strategyName) {
      handleRequest<TUser = unknown>(err: unknown, user: unknown): TUser {
        if (err || !user) {
          throw new UnauthorizedException(
            err instanceof Error ? err.message : 'Authentication failed',
          );
        }
        return user as TUser;
      }
    };
  }
}
