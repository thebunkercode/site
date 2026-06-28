import { describe, it, expect } from 'vitest';
import { validateOrigin } from '../csrf';

function req(origin?: string, host?: string): Request {
  const req = new Request('http://localhost');
  if (origin) req.headers.set('Origin', origin);
  if (host) req.headers.set('Host', host);
  return req;
}

describe('validateOrigin', () => {
  describe('with allowedOrigin set (production)', () => {
    const allowed = 'https://thebunkercode.com';

    it('allows matching origin', () => {
      expect(validateOrigin(req(allowed), allowed)).toBe(true);
    });

    it('rejects mismatched origin', () => {
      expect(validateOrigin(req('https://evil.com'), allowed)).toBe(false);
    });

    it('allows null origin (no header)', () => {
      expect(validateOrigin(req(undefined), allowed)).toBe(true);
    });

    it('allows string "null" origin', () => {
      expect(validateOrigin(req('null'), allowed)).toBe(true);
    });
  });

  describe('with multiple comma-separated origins', () => {
    const allowed = 'http://localhost:4321,https://thebunkercode.org,http://enlabe.com';

    it('allows origin from the list', () => {
      expect(validateOrigin(req('https://thebunkercode.org'), allowed)).toBe(true);
    });

    it('allows another origin from the list', () => {
      expect(validateOrigin(req('http://enlabe.com'), allowed)).toBe(true);
    });

    it('rejects origin not in the list', () => {
      expect(validateOrigin(req('https://evil.com'), allowed)).toBe(false);
    });
  });

  describe('with wildcard origins', () => {
    it('matches subdomain wildcard *.enlabe.workers.dev', () => {
      const allowed = 'https://*.enlabe.workers.dev';
      expect(
        validateOrigin(req('https://7ca3d7f8-the-bunker-code-landing.enlabe.workers.dev'), allowed),
      ).toBe(true);
    });

    it('rejects origin not matching wildcard', () => {
      const allowed = 'https://*.enlabe.workers.dev';
      expect(validateOrigin(req('https://evil.com'), allowed)).toBe(false);
    });

    it('matches without scheme wildcard *.workers.dev', () => {
      const allowed = '*.workers.dev';
      expect(validateOrigin(req('https://preview.workers.dev'), allowed)).toBe(true);
    });

    it('works with mixed exact and wildcard origins', () => {
      const allowed = 'https://thebunkercode.org,https://*.workers.dev';
      expect(validateOrigin(req('https://abc123.workers.dev'), allowed)).toBe(true);
      expect(validateOrigin(req('https://thebunkercode.org'), allowed)).toBe(true);
      expect(validateOrigin(req('https://evil.com'), allowed)).toBe(false);
    });
  });

  describe('without allowedOrigin (preview/dev)', () => {
    it('allows same-origin request (origin matches host)', () => {
      expect(validateOrigin(req('https://preview.workers.dev', 'preview.workers.dev'))).toBe(true);
    });

    it('allows preview URL with hash prefix', () => {
      expect(
        validateOrigin(
          req(
            'https://7ca3d7f8-the-bunker-code-landing.enlabe.workers.dev',
            '7ca3d7f8-the-bunker-code-landing.enlabe.workers.dev',
          ),
        ),
      ).toBe(true);
    });

    it('allows localhost with port', () => {
      expect(validateOrigin(req('http://localhost:4321', 'localhost:4321'))).toBe(true);
    });

    it('rejects different origin', () => {
      expect(validateOrigin(req('https://evil.com', 'preview.workers.dev'))).toBe(false);
    });

    it('allows null origin (no header)', () => {
      expect(validateOrigin(req(undefined, 'preview.workers.dev'))).toBe(true);
    });

    it('allows string "null" origin', () => {
      expect(validateOrigin(req('null', 'preview.workers.dev'))).toBe(true);
    });
  });
});
