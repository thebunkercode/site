export const SOCIAL_URLS = {
  twitch: 'https://twitch.tv/thebunkercode',
  github: 'https://github.com/thebunkercode',
  x: 'https://x.com/thebunkercode',
  linkedin: 'https://linkedin.com/company/thebunkercode',
} as const;

export const EMAILS = {
  CONTACT_WEB: 'hola@thebunkercode.org',
  CONTACT_TO: 'thebunkerofthecode@gmail.com',
  RESEND_FROM: 'Bunker Contact <onboarding@resend.dev>',
} as const;

export const VERSION = 'v0.1.0';

export const TARGET_DATE = '2026-08-24T00:00:00-05:00';

export const TIME_MS = {
  DAY: 86_400_000,
  HOUR: 3_600_000,
  MINUTE: 60_000,
  SECOND: 1_000,
} as const;
