import { describe, it, expect, beforeEach } from 'vitest';
import { createRateLimiter } from '../rate-limit';

describe('createRateLimiter', () => {
  const limiter = createRateLimiter({ maxRequests: 3, windowMs: 60_000 });

  beforeEach(() => {
    limiter.reset();
  });

  it('allows requests under the limit', () => {
    expect(limiter.check('127.0.0.1').allowed).toBe(true);
    expect(limiter.check('127.0.0.1').allowed).toBe(true);
    expect(limiter.check('127.0.0.1').allowed).toBe(true);
  });

  it('blocks requests over the limit', () => {
    limiter.check('127.0.0.1');
    limiter.check('127.0.0.1');
    limiter.check('127.0.0.1');
    const result = limiter.check('127.0.0.1');
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('tracks different IPs independently', () => {
    expect(limiter.check('1.1.1.1').allowed).toBe(true);
    expect(limiter.check('2.2.2.2').allowed).toBe(true);
    expect(limiter.check('1.1.1.1').allowed).toBe(true);
    expect(limiter.check('1.1.1.1').allowed).toBe(true);
    expect(limiter.check('1.1.1.1').allowed).toBe(false);
    expect(limiter.check('2.2.2.2').allowed).toBe(true);
  });

  it('returns remaining count', () => {
    limiter.check('127.0.0.1');
    const r1 = limiter.check('127.0.0.1');
    expect(r1.remaining).toBe(1);
    const r2 = limiter.check('127.0.0.1');
    expect(r2.remaining).toBe(0);
  });

  it('reset clears all entries', () => {
    limiter.check('127.0.0.1');
    limiter.check('127.0.0.1');
    limiter.check('127.0.0.1');
    expect(limiter.check('127.0.0.1').allowed).toBe(false);
    limiter.reset();
    expect(limiter.check('127.0.0.1').allowed).toBe(true);
  });
});
