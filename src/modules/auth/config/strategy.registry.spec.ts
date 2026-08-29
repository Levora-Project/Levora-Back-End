import {
  STRATEGY_REGISTRY,
  getStrategyClass,
  getAllStrategyClasses,
} from './strategy.registry';
import { GoogleStrategy } from '../strategies/google.strategy';
import { LinkedInStrategy } from '../strategies/linkedin.strategy';

describe('StrategyRegistry', () => {
  describe('STRATEGY_REGISTRY', () => {
    it('should contain GoogleStrategy', () => {
      expect(STRATEGY_REGISTRY.google).toBe(GoogleStrategy);
    });

    it('should contain LinkedInStrategy', () => {
      expect(STRATEGY_REGISTRY.linkedin).toBe(LinkedInStrategy);
    });

    it('should have correct number of strategies', () => {
      expect(Object.keys(STRATEGY_REGISTRY).length).toBe(2);
    });
  });

  describe('getStrategyClass', () => {
    it('should return GoogleStrategy for google provider', () => {
      const strategy = getStrategyClass('google');
      expect(strategy).toBe(GoogleStrategy);
    });

    it('should return LinkedInStrategy for linkedin provider', () => {
      const strategy = getStrategyClass('linkedin');
      expect(strategy).toBe(LinkedInStrategy);
    });

    it('should return undefined for unknown provider', () => {
      const strategy = getStrategyClass('twitter');
      expect(strategy).toBeUndefined();
    });

    it('should be case-insensitive', () => {
      expect(getStrategyClass('GOOGLE')).toBe(GoogleStrategy);
      expect(getStrategyClass('Google')).toBe(GoogleStrategy);
      expect(getStrategyClass('google')).toBe(GoogleStrategy);
      expect(getStrategyClass('LINKEDIN')).toBe(LinkedInStrategy);
      expect(getStrategyClass('LinkedIn')).toBe(LinkedInStrategy);
      expect(getStrategyClass('linkedin')).toBe(LinkedInStrategy);
    });
  });

  describe('getAllStrategyClasses', () => {
    it('should return all strategy classes', () => {
      const strategies = getAllStrategyClasses();
      expect(strategies).toContain(GoogleStrategy);
      expect(strategies).toContain(LinkedInStrategy);
      expect(strategies.length).toBe(2);
    });

    it('should return array of strategy classes', () => {
      const strategies = getAllStrategyClasses();
      expect(Array.isArray(strategies)).toBe(true);
    });
  });
});
