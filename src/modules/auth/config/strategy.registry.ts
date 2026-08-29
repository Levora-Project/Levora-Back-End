import { Type } from '@nestjs/common';
import { GoogleStrategy } from '../strategies/google.strategy';
import { LinkedInStrategy } from '../strategies/linkedin.strategy';

export const STRATEGY_REGISTRY: Record<string, Type<unknown>> = {
  google: GoogleStrategy,
  linkedin: LinkedInStrategy,
};

/**
 * Get strategy class for a provider
 */
export function getStrategyClass(provider: string): Type<unknown> | undefined {
  return STRATEGY_REGISTRY[provider.toLowerCase()];
}

/**
 * Get all registered strategy classes
 */
export function getAllStrategyClasses(): Type<unknown>[] {
  return Object.values(STRATEGY_REGISTRY);
}
