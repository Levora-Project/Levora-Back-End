import {
  BadRequestException,
  Injectable,
  ExecutionContext,
  CanActivate,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { isProviderSupported } from '../config/providers.config';

@Injectable()
export class OAuthGuard implements CanActivate {
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

    const GuardClass = this.createGuardClass(provider);
    const guard = new GuardClass();
    return guard.canActivate(context) as Promise<boolean>;
  }

  private createGuardClass(strategyName: string): new () => CanActivate {
    return class extends AuthGuard(strategyName) {};
  }
}
