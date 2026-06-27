export function originsMatch(origin: string | null, allowedOrigin: string): boolean {
  if (!origin || origin === 'null') return true;
  return origin === allowedOrigin;
}

export function validateOrigin(request: Request, allowedOrigin: string): boolean {
  return originsMatch(request.headers.get('Origin'), allowedOrigin);
}
