import { describe, it, expect } from 'vitest';
import { isValidCode, calculateHits } from './engine';

describe('isValidCode validation', () => {
  it('should accept valid 4-digit codes', () => {
    expect(isValidCode('1234')).toBe(true);
    expect(isValidCode('0000')).toBe(true);
    expect(isValidCode('9999')).toBe(true);
    expect(isValidCode('1122')).toBe(true);
  });

  it('should reject codes with non-numeric characters', () => {
    expect(isValidCode('12a4')).toBe(false);
    expect(isValidCode('abcd')).toBe(false);
    expect(isValidCode('12.3')).toBe(false);
    expect(isValidCode('12 3')).toBe(false);
  });

  it('should reject codes that are not exactly 4 characters long', () => {
    expect(isValidCode('123')).toBe(false);
    expect(isValidCode('12345')).toBe(false);
    expect(isValidCode('')).toBe(false);
  });
});

describe('calculateHits matching logic', () => {
  it('should calculate exact position and value matches correctly', () => {
    expect(calculateHits('1234', '1538')).toBe(2);
    expect(calculateHits('1234', '5678')).toBe(0);
    expect(calculateHits('1234', '1234')).toBe(4);
    expect(calculateHits('1122', '1221')).toBe(2);
    expect(calculateHits('4321', '1234')).toBe(0);
  });
});
