import { describe, it, expect } from 'vitest';
import { originsMatch } from '../csrf';

describe('originsMatch', () => {
  const allowedOrigin = 'https://thebunkercode.com';

  it('allows matching origins', () => {
    expect(originsMatch(allowedOrigin, allowedOrigin)).toBe(true);
  });

  it('rejects mismatched origins', () => {
    expect(originsMatch('https://evil.com', allowedOrigin)).toBe(false);
  });

  it('allows null origin (no header)', () => {
    expect(originsMatch(null, allowedOrigin)).toBe(true);
  });

  it('allows string "null" origin (non-browser clients)', () => {
    expect(originsMatch('null', allowedOrigin)).toBe(true);
  });
});
