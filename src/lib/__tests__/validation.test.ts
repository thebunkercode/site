import { describe, it, expect } from 'vitest';
import { EMAIL_RE, isValidEmail } from '../validation';

describe('EMAIL_RE', () => {
  it('accepts valid emails', () => {
    expect(EMAIL_RE.test('user@example.com')).toBe(true);
    expect(EMAIL_RE.test('a@b.co')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(EMAIL_RE.test('notanemail')).toBe(false);
    expect(EMAIL_RE.test('@domain.com')).toBe(false);
    expect(EMAIL_RE.test('user@')).toBe(false);
    expect(EMAIL_RE.test('')).toBe(false);
  });
});

describe('isValidEmail', () => {
  it('returns true for valid email', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });

  it('returns false for invalid email', () => {
    expect(isValidEmail('notanemail')).toBe(false);
  });
});
