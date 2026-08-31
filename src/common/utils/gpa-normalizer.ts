export function parseLetterGrade(letter: string): number {
  const mapping: Record<string, number> = {
    'A+': 4.0,
    A: 4.0,
    'A-': 3.7,
    'B+': 3.3,
    B: 3.0,
    'B-': 2.7,
    'C+': 2.3,
    C: 2.0,
    'C-': 1.7,
    'D+': 1.3,
    D: 1.0,
    F: 0.0,
  };
  return mapping[letter.toUpperCase()] ?? NaN;
}

export function validateGPARange(
  value: number | string,
  scale: '4.0' | 'percentage' | 'letter',
): boolean {
  if (value === null || value === undefined || value === '') {
    return false;
  }
  if (scale === 'letter') {
    return !isNaN(parseLetterGrade(String(value)));
  }
  const num = Number(value);
  if (isNaN(num)) {
    return false;
  }

  if (scale === '4.0') {
    return num >= 0.0 && num <= 4.0;
  }
  if (scale === 'percentage') {
    return num >= 0 && num <= 100;
  }
  return false;
}

export function normalizeGPA(
  value: number | string,
  scale: '4.0' | 'percentage' | 'letter',
): number {
  if (!validateGPARange(value, scale)) {
    throw new Error('Invalid GPA value or range');
  }

  if (scale === '4.0') {
    return Number(value);
  }

  if (scale === 'letter') {
    return parseLetterGrade(String(value));
  }

  if (scale === 'percentage') {
    // Standard mapping: (percentage / 100) * 4.0
    const num = Number(value);
    const normalized = (num / 100) * 4.0;
    return Math.round(normalized * 10) / 10;
  }

  throw new Error('Unsupported scale');
}
