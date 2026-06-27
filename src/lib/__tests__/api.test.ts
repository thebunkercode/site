import { describe, it, expect } from 'vitest';
import { jsonOk, jsonError, parseJsonBody } from '../api';

describe('jsonOk', () => {
  it('returns 200 with ok:true by default', async () => {
    const res = jsonOk();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it('includes extra data when provided', async () => {
    const res = jsonOk({ message: 'done' });
    expect(await res.json()).toEqual({ ok: true, message: 'done' });
  });

  it('sets Content-Type header', () => {
    const res = jsonOk();
    expect(res.headers.get('content-type')).toBe('application/json');
  });
});

describe('jsonError', () => {
  it('returns given status with error message', async () => {
    const res = jsonError('bad request', 400);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'bad request' });
  });

  it('returns 500 by default', async () => {
    const res = jsonError('server error');
    expect(res.status).toBe(500);
  });

  it('sets Content-Type header', () => {
    const res = jsonError('err', 400);
    expect(res.headers.get('content-type')).toBe('application/json');
  });
});

describe('parseJsonBody', () => {
  it('parses valid JSON', async () => {
    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ name: 'test' }),
    });
    const result = await parseJsonBody<{ name: string }>(req);
    expect(result).toEqual({ name: 'test' });
  });

  it('returns null for invalid JSON', async () => {
    const req = new Request('http://localhost', {
      method: 'POST',
      body: 'not json',
    });
    const result = await parseJsonBody(req);
    expect(result).toBeNull();
  });

  it('returns null for empty body', async () => {
    const req = new Request('http://localhost', { method: 'POST', body: '' });
    const result = await parseJsonBody(req);
    expect(result).toBeNull();
  });
});
