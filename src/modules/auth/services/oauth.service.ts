import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  isProviderSupported as checkProviderSupported,
  isProviderConfigured as checkProviderConfigured,
  getAllSupportedProviders,
} from '../config/providers.config';

@Injectable()
export class OAuthService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Get list of providers supported by this library (have strategy implementations)
   */
  getSupportedProviders(): string[] {
    return getAllSupportedProviders();
  }

  /**
   * Get list of providers that are currently configured via environment variables
   */
  getConfiguredProviders(): string[] {
    return this.getSupportedProviders().filter((provider) =>
      checkProviderConfigured(provider, this.configService),
    );
  }

  /**
   * Check if a provider has a strategy implementation in this library
   */
  isProviderSupported(provider: string): boolean {
    return checkProviderSupported(provider);
  }

  /**
   * Check if a provider is configured via environment variables
   */
  isProviderConfigured(provider: string): boolean {
    return checkProviderConfigured(provider, this.configService);
  }

  getProviderConfig(provider: string) {
    if (!this.isProviderConfigured(provider)) {
      return undefined;
    }
    const p = provider.toLowerCase();
    if (p === 'google') {
      return {
        clientId: this.configService.get<string>('oauth.GOOGLE_CLIENT_ID'),
        clientSecret: this.configService.get<string>(
          'oauth.GOOGLE_CLIENT_SECRET',
        ),
        redirect: this.configService.get<string>('oauth.GOOGLE_CALLBACK_URL'),
      };
    }
    if (p === 'linkedin') {
      return {
        clientId: this.configService.get<string>('oauth.LINKEDIN_CLIENT_ID'),
        clientSecret: this.configService.get<string>(
          'oauth.LINKEDIN_CLIENT_SECRET',
        ),
        redirect: this.configService.get<string>('oauth.LINKEDIN_CALLBACK_URL'),
      };
    }
    return undefined;
  }
}
