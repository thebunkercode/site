import { describe, it, expect, beforeEach, vi } from 'vitest';

const { mockResendSend } = vi.hoisted(() => ({
  mockResendSend: vi.fn(),
}));

const { mockEnv } = vi.hoisted(() => ({
  mockEnv: {
    RESEND_API_KEY: 'test_key',
    CONTACT_TO_EMAIL: 'test@example.com',
    DB: {
      prepare: vi.fn().mockReturnThis(),
      bind: vi.fn().mockReturnThis(),
      run: vi.fn().mockResolvedValue({}),
    },
  },
}));

const { mockRateLimiter } = vi.hoisted(() => ({
  mockRateLimiter: {
    check: vi.fn(() => ({ allowed: true, remaining: 9, resetAt: Date.now() + 60000 })),
    getClientIp: vi.fn(() => '127.0.0.1'),
    reset: vi.fn(),
  },
}));

vi.mock('cloudflare:workers', () => ({
  env: mockEnv,
}));

vi.mock('resend', () => {
  const Resend = vi.fn().mockImplementation(function () {
    return { emails: { send: mockResendSend } };
  });
  return { Resend };
});

vi.mock('@/lib/rate-limit', () => ({
  createRateLimiter: vi.fn(() => mockRateLimiter),
}));

import { POST as contactPost } from '@/pages/api/contact';
import { POST as notifyPost } from '@/pages/api/notify';

function createRequest(url: string, body?: string | object | null, origin?: string): Request {
  const init: RequestInit & { body?: BodyInit | null } = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  };
  if (body != null) {
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  const req = new Request(url, init as RequestInit);
  if (origin) req.headers.set('Origin', origin);
  return req;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createAstroContext(request: Request): any {
  return { request };
}

describe('POST /api/contact', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.clearAllMocks();
    mockRateLimiter.check.mockReturnValue({
      allowed: true,
      remaining: 9,
      resetAt: Date.now() + 60000,
    });
    mockRateLimiter.getClientIp.mockReturnValue('127.0.0.1');
    mockResendSend.mockResolvedValue({ error: null });
    mockEnv.RESEND_API_KEY = 'test_key';
    mockEnv.CONTACT_TO_EMAIL = 'test@example.com';
    mockEnv.DB.prepare.mockReturnThis();
    mockEnv.DB.bind.mockReturnThis();
    mockEnv.DB.run.mockResolvedValue({});
  });

  it('returns 400 for invalid JSON body', async () => {
    const req = createRequest('/api/contact', 'not-json');
    const res = await contactPost(createAstroContext(req));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ error: 'invalid json' });
  });

  it('returns 400 for missing required fields', async () => {
    const req = createRequest('/api/contact', { name: 'Test' });
    const res = await contactPost(createAstroContext(req));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ error: 'faltan campos obligatorios' });
  });

  it('returns 400 for invalid email format', async () => {
    const req = createRequest('/api/contact', {
      name: 'Test',
      email: 'not-an-email',
      message: 'Hello',
    });
    const res = await contactPost(createAstroContext(req));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ error: 'email inválido' });
  });

  it('returns 500 when RESEND_API_KEY is missing', async () => {
    (mockEnv as Record<string, unknown>).RESEND_API_KEY = undefined;
    const req = createRequest('/api/contact', {
      name: 'Test',
      email: 'test@example.com',
      message: 'Hello',
    });
    const res = await contactPost(createAstroContext(req));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toEqual({ error: 'error de configuración' });
  });

  it('returns 403 when Origin does not match', async () => {
    const req = createRequest('/api/contact', null, 'https://evil.com');
    const res = await contactPost(createAstroContext(req));
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body).toEqual({ error: 'origen no permitido' });
  });

  it('returns 429 when rate limited', async () => {
    mockRateLimiter.check.mockReturnValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 60000,
    });
    const req = createRequest('/api/contact', {
      name: 'Test',
      email: 'test@example.com',
      message: 'Hello',
    });
    const res = await contactPost(createAstroContext(req));
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body).toEqual({ error: 'demasiadas solicitudes' });
    expect(res.headers.get('Retry-After')).toBeTruthy();
  });

  it('returns 200 for valid submission', async () => {
    const req = createRequest('/api/contact', {
      name: 'Test User',
      email: 'test@example.com',
      company: 'Test Corp',
      message: 'Hello from test',
    });
    const res = await contactPost(createAstroContext(req));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ ok: true });
    expect(mockResendSend).toHaveBeenCalledOnce();
  });

  it('returns 500 when Resend returns error', async () => {
    mockResendSend.mockResolvedValue({ error: new Error('API error') });
    const req = createRequest('/api/contact', {
      name: 'Test User',
      email: 'test@example.com',
      message: 'Hello',
    });
    const res = await contactPost(createAstroContext(req));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toEqual({ error: 'error al enviar' });
  });
});

describe('POST /api/notify', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.clearAllMocks();
    mockRateLimiter.check.mockReturnValue({
      allowed: true,
      remaining: 9,
      resetAt: Date.now() + 60000,
    });
    mockRateLimiter.getClientIp.mockReturnValue('127.0.0.1');
    mockEnv.DB.prepare.mockReturnThis();
    mockEnv.DB.bind.mockReturnThis();
    mockEnv.DB.run.mockResolvedValue({});
  });

  it('returns 400 for invalid JSON body', async () => {
    const req = createRequest('/api/notify', 'not-json');
    const res = await notifyPost(createAstroContext(req));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ error: 'invalid json' });
  });

  it('returns 400 for missing email', async () => {
    const req = createRequest('/api/notify', {});
    const res = await notifyPost(createAstroContext(req));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ error: 'email es requerido' });
  });

  it('returns 400 for invalid email format', async () => {
    const req = createRequest('/api/notify', { email: 'not-an-email' });
    const res = await notifyPost(createAstroContext(req));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ error: 'email inválido' });
  });

  it('returns 200 for valid email', async () => {
    const req = createRequest('/api/notify', { email: 'test@example.com' });
    const res = await notifyPost(createAstroContext(req));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ ok: true });
  });

  it('returns 200 for duplicate email (UNIQUE constraint)', async () => {
    mockEnv.DB.run.mockRejectedValue(new Error('UNIQUE constraint failed: notify_emails.email'));
    const req = createRequest('/api/notify', { email: 'test@example.com' });
    const res = await notifyPost(createAstroContext(req));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ ok: true });
  });

  it('returns 500 for other D1 errors', async () => {
    mockEnv.DB.run.mockRejectedValue(new Error('some other error'));
    const req = createRequest('/api/notify', { email: 'test@example.com' });
    const res = await notifyPost(createAstroContext(req));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toEqual({ error: 'error al guardar' });
  });

  it('returns 403 when Origin does not match', async () => {
    const req = createRequest('/api/notify', null, 'https://evil.com');
    const res = await notifyPost(createAstroContext(req));
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body).toEqual({ error: 'origen no permitido' });
  });
});
