interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimiterOptions {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function createRateLimiter(options: RateLimiterOptions) {
  const { maxRequests, windowMs } = options;
  const store = new Map<string, RateLimitEntry>();

  function check(key: string): RateLimitResult {
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now >= entry.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
    }

    entry.count += 1;
    const allowed = entry.count <= maxRequests;
    return {
      allowed,
      remaining: Math.max(0, maxRequests - entry.count),
      resetAt: entry.resetAt,
    };
  }

  function reset() {
    store.clear();
  }

  function getClientIp(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
      return forwarded.split(',')[0]?.trim() ?? 'unknown';
    }
    const cf = request.headers.get('cf-connecting-ip');
    if (cf) return cf;
    return 'unknown';
  }

  return { check, reset, getClientIp };
}
