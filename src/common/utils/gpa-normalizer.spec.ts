import {
  validateGPARange,
  normalizeGPA,
  parseLetterGrade,
} from './gpa-normalizer';

describe('GPA Normalizer Utility', () => {
  describe('parseLetterGrade', () => {
    it('should correctly parse letter grades', () => {
      expect(parseLetterGrade('A+')).toBe(4.0);
      expect(parseLetterGrade('A')).toBe(4.0);
      expect(parseLetterGrade('A-')).toBe(3.7);
      expect(parseLetterGrade('F')).toBe(0.0);
    });

    it('should handle case insensitivity', () => {
      expect(parseLetterGrade('a+')).toBe(4.0);
    });

    it('should return NaN for invalid letters', () => {
      expect(parseLetterGrade('Z')).toBeNaN();
    });
  });

  describe('validateGPARange', () => {
    it('should validate 4.0 scale', () => {
      expect(validateGPARange(3.5, '4.0')).toBe(true);
      expect(validateGPARange(4.0, '4.0')).toBe(true);
      expect(validateGPARange(0.0, '4.0')).toBe(true);
      expect(validateGPARange(4.5, '4.0')).toBe(false);
      expect(validateGPARange(-1, '4.0')).toBe(false);
    });

    it('should validate percentage scale', () => {
      expect(validateGPARange(85, 'percentage')).toBe(true);
      expect(validateGPARange(100, 'percentage')).toBe(true);
      expect(validateGPARange(105, 'percentage')).toBe(false);
    });

    it('should validate letter scale', () => {
      expect(validateGPARange('B+', 'letter')).toBe(true);
      expect(validateGPARange('Z', 'letter')).toBe(false);
    });

    it('should reject empty or invalid values', () => {
      expect(validateGPARange('', '4.0')).toBe(false);
      expect(validateGPARange(null as any, '4.0')).toBe(false);
      expect(validateGPARange(undefined as any, '4.0')).toBe(false);
    });
  });

  describe('normalizeGPA', () => {
    it('should normalize 4.0 scale to itself', () => {
      expect(normalizeGPA(3.5, '4.0')).toBe(3.5);
    });

    it('should normalize letter scale', () => {
      expect(normalizeGPA('A', 'letter')).toBe(4.0);
      expect(normalizeGPA('B+', 'letter')).toBe(3.3);
    });

    it('should normalize percentage scale using standard mapping table', () => {
      expect(normalizeGPA(95, 'percentage')).toBe(4.0); // A
      expect(normalizeGPA(91, 'percentage')).toBe(3.7); // A-
      expect(normalizeGPA(85, 'percentage')).toBe(3.0); // B
      expect(normalizeGPA(60, 'percentage')).toBe(1.0); // D
      expect(normalizeGPA(50, 'percentage')).toBe(0.0); // F
    });

    it('should throw error on invalid inputs', () => {
      expect(() => normalizeGPA(4.5, '4.0')).toThrow(
        'Invalid GPA value or range',
      );
      expect(() => normalizeGPA('Z', 'letter')).toThrow(
        'Invalid GPA value or range',
      );
    });
  });
});
