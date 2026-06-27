import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { EMAIL_RE, type NotifyBody } from '@/lib/validation';
import { jsonOk, jsonError, parseJsonBody } from '@/lib/api';
import { validateOrigin } from '@/lib/csrf';
import { createRateLimiter } from '@/lib/rate-limit';

export const prerender = false;

const rateLimiter = createRateLimiter({ maxRequests: 10, windowMs: 60_000 });

const ALLOWED_ORIGIN = 'https://thebunkercode.com';

export const POST: APIRoute = async ({ request }) => {
  if (!validateOrigin(request, ALLOWED_ORIGIN)) {
    return jsonError('origen no permitido', 403);
  }

  const ip = rateLimiter.getClientIp(request);
  const rateCheck = rateLimiter.check(ip);
  if (!rateCheck.allowed) {
    return new Response(JSON.stringify({ error: 'demasiadas solicitudes' }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)),
      },
    });
  }

  const body = await parseJsonBody<NotifyBody>(request);
  if (!body) {
    return jsonError('invalid json', 400);
  }

  const email = body.email?.trim();
  if (!email) {
    return jsonError('email es requerido', 400);
  }

  if (!EMAIL_RE.test(email)) {
    return jsonError('email inválido', 400);
  }

  try {
    await env.DB.prepare('INSERT INTO notify_emails (email) VALUES (?1)').bind(email).run();
    return jsonOk();
  } catch (err: unknown) {
    if (
      err &&
      typeof err === 'object' &&
      'message' in err &&
      typeof err.message === 'string' &&
      err.message.includes('UNIQUE constraint failed')
    ) {
      return jsonOk();
    }
    console.error('D1 error:', err);
    return jsonError('error al guardar', 500);
  }
};
