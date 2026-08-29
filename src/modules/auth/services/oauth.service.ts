import { Injectable } from '@nestjs/common';
import {
  isProviderSupported as checkProviderSupported,
  isProviderConfigured as checkProviderConfigured,
  getProviderConfig,
  getAllSupportedProviders,
  getConfiguredProviders,
} from '../config/providers.config';

@Injectable()
export class OAuthService {
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
    return getConfiguredProviders();
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
    return checkProviderConfigured(provider);
  }

  getProviderConfig(provider: string) {
    return getProviderConfig(provider);
  }
}
