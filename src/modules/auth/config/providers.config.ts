import { STRATEGY_REGISTRY, getStrategyClass } from './strategy.registry';

export interface ProviderConfig {
  clientId: string;
  clientSecret: string;
  redirect: string;
}

export interface ProvidersConfig {
  [provider: string]: ProviderConfig;
}

export function getProvidersConfig(): ProvidersConfig {
  const config: ProvidersConfig = {};

  // Google configuration
  if (
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CALLBACK_URL
  ) {
    config.google = {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirect: process.env.GOOGLE_CALLBACK_URL,
    };
  }

  // LinkedIn configuration
  if (
    process.env.LINKEDIN_CLIENT_ID &&
    process.env.LINKEDIN_CLIENT_SECRET &&
    process.env.LINKEDIN_CALLBACK_URL
  ) {
    config.linkedin = {
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      redirect: process.env.LINKEDIN_CALLBACK_URL,
    };
  }

  return config;
}

/**
 * Get list of all providers that are currently configured via environment variables
 */
export function getConfiguredProviders(): string[] {
  const config = getProvidersConfig();
  return Object.keys(config);
}

/**
 * Get list of all providers supported by this library (have strategy implementations)
 */
export function getSupportedProviders(): string[] {
  return getAllSupportedProviders();
}

export function getProviderConfig(
  provider: string,
): ProviderConfig | undefined {
  const config = getProvidersConfig();
  return config[provider.toLowerCase()];
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
export function isProviderConfigured(provider: string): boolean {
  const config = getProvidersConfig();
  return provider.toLowerCase() in config;
}

/**
 * Get list of all providers with strategies (regardless of configuration)
 */
export function getAllSupportedProviders(): string[] {
  return Object.keys(STRATEGY_REGISTRY);
}
