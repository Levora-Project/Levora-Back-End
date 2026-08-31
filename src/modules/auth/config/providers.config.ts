import { ConfigService } from '@nestjs/config';
import { STRATEGY_REGISTRY, getStrategyClass } from './strategy.registry';

export interface ProviderConfig {
  clientId: string;
  clientSecret: string;
  redirect: string;
}

/**
 * Get list of all providers supported by this library (have strategy implementations)
 */
export function getSupportedProviders(): string[] {
  return getAllSupportedProviders();
}

/**
 * Check if a provider has a strategy implementation in this library
 */
export function isProviderSupported(provider: string): boolean {
  return !!getStrategyClass(provider);
}

/**
 * Check if a provider is configured via environment variables
 */
export function isProviderConfigured(
  provider: string,
  configService: ConfigService,
): boolean {
  if (provider.toLowerCase() === 'google') {
    return !!(
      configService.get<string>('oauth.GOOGLE_CLIENT_ID') &&
      configService.get<string>('oauth.GOOGLE_CLIENT_SECRET') &&
      configService.get<string>('oauth.GOOGLE_CALLBACK_URL')
    );
  }
  if (provider.toLowerCase() === 'linkedin') {
    return !!(
      configService.get<string>('oauth.LINKEDIN_CLIENT_ID') &&
      configService.get<string>('oauth.LINKEDIN_CLIENT_SECRET') &&
      configService.get<string>('oauth.LINKEDIN_CALLBACK_URL')
    );
  }
  return false;
}

/**
 * Get list of all providers with strategies (regardless of configuration)
 */
export function getAllSupportedProviders(): string[] {
  return Object.keys(STRATEGY_REGISTRY);
}
