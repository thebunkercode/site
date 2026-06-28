import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { EMAIL_RE, type ContactBody } from '@/lib/validation';
import { jsonOk, jsonError, parseJsonBody } from '@/lib/api';
import { escapeHtml } from '@/lib/utils';
import { EMAILS } from '@/lib/constants';
import { validateOrigin } from '@/lib/csrf';
import { createRateLimiter } from '@/lib/rate-limit';

export const prerender = false;

const rateLimiter = createRateLimiter({ maxRequests: 10, windowMs: 60_000 });

const allowedOrigin =
  (env as unknown as Record<string, string | undefined>).ALLOWED_ORIGIN ??
  import.meta.env.ALLOWED_ORIGIN;

export const POST: APIRoute = async ({ request }) => {
  if (!validateOrigin(request, allowedOrigin)) {
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

  const body = await parseJsonBody<ContactBody>(request);
  if (!body) {
    return jsonError('invalid json', 400);
  }

  const name = body.name?.trim();
  const email = body.email?.trim();
  const message = body.message?.trim();
  const company = body.company?.trim() || '';

  if (!name || !email || !message) {
    return jsonError('faltan campos obligatorios', 400);
  }

  if (!EMAIL_RE.test(email)) {
    return jsonError('email inválido', 400);
  }

  const RESEND_API_KEY = env.RESEND_API_KEY ?? import.meta.env.RESEND_API_KEY;
  const CONTACT_TO_EMAIL = env.CONTACT_TO_EMAIL ?? import.meta.env.CONTACT_TO_EMAIL;

  if (!RESEND_API_KEY) {
    console.error('Missing RESEND_API_KEY');
    return jsonError('error de configuración', 500);
  }

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(RESEND_API_KEY);

    const html = [
      '<html><body style="font-family:monospace;background:#000;color:#F0FDF4;padding:32px">',
      '<p style="color:#A3E635;font-weight:bold">nuevo mensaje del bunker</p>',
      `<p><span style="color:#4A7C5E">nombre:</span> ${escapeHtml(name)}</p>`,
      `<p><span style="color:#4A7C5E">email:</span> ${escapeHtml(email)}</p>`,
      company ? `<p><span style="color:#4A7C5E">empresa:</span> ${escapeHtml(company)}</p>` : '',
      '<hr style="border-color:#1F4D33">',
      `<p style="color:#C5E8B0">${escapeHtml(message)}</p>`,
      '</body></html>',
    ].join('');

    const { error } = await resend.emails.send({
      from: EMAILS.RESEND_FROM,
      to: [CONTACT_TO_EMAIL],
      subject: `[bunker] mensaje de ${name}`,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return jsonError('error al enviar', 500);
    }

    return jsonOk();
  } catch (err) {
    console.error('Contact error:', err);
    return jsonError('error al enviar', 500);
  }
};
