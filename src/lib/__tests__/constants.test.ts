import { describe, it, expect } from 'vitest';
import { SOCIAL_URLS, EMAILS, VERSION, TARGET_DATE, TIME_MS } from '../constants';

describe('SOCIAL_URLS', () => {
  it('all URLs are defined', () => {
    expect(SOCIAL_URLS.twitch).toBeDefined();
    expect(SOCIAL_URLS.github).toBeDefined();
    expect(SOCIAL_URLS.x).toBeDefined();
    expect(SOCIAL_URLS.linkedin).toBeDefined();
  });
  it('all URLs start with https://', () => {
    Object.values(SOCIAL_URLS).forEach((url) => {
      expect(url).toMatch(/^https:\/\//);
    });
  });
});

describe('EMAILS', () => {
  it('contact web email is correct', () => {
    expect(EMAILS.CONTACT_WEB).toBe('hola@thebunkercode.org');
  });
  it('contact to email is correct', () => {
    expect(EMAILS.CONTACT_TO).toBe('thebunkerofthecode@gmail.com');
  });
  it('resend sender is defined', () => {
    expect(EMAILS.RESEND_FROM).toBeTruthy();
  });
});

describe('VERSION', () => {
  it('is a non-empty string', () => {
    expect(typeof VERSION).toBe('string');
    expect(VERSION.length).toBeGreaterThan(0);
  });
});

describe('TARGET_DATE', () => {
  it('is a valid date string', () => {
    expect(new Date(TARGET_DATE).toString()).not.toBe('Invalid Date');
  });
});

describe('TIME_MS', () => {
  it('has correct millisecond values', () => {
    expect(TIME_MS.DAY).toBe(86_400_000);
    expect(TIME_MS.HOUR).toBe(3_600_000);
    expect(TIME_MS.MINUTE).toBe(60_000);
    expect(TIME_MS.SECOND).toBe(1_000);
  });
});
