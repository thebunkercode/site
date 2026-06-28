function originMatches(pattern: string, origin: string): boolean {
  if (!pattern.includes('*')) return origin === pattern;

  let matchTarget = origin;
  if (!pattern.includes('://')) {
    try {
      matchTarget = new URL(origin).host;
    } catch {
      return false;
    }
  }

  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp('^' + escaped.replace(/\*/g, '[^/]+') + '$');
  return regex.test(matchTarget);
}

export function validateOrigin(request: Request, allowedOrigins?: string): boolean {
  const origin = request.headers.get('Origin');
  if (!origin || origin === 'null') return true;

  if (allowedOrigins) {
    return allowedOrigins.split(',').some((o) => originMatches(o.trim(), origin));
  }

  const host = request.headers.get('Host');
  if (host) {
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }
  return false;
}
