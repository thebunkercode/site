/// <reference types="astro/client" />

declare module 'cloudflare:workers' {
  interface Env {
    DB: import('@cloudflare/workers-types').D1Database;
    RESEND_API_KEY: string;
    CONTACT_TO_EMAIL: string;
    SESSION: import('@cloudflare/workers-types').KVNamespace;
    ASSETS: import('@cloudflare/workers-types').Fetcher;
    IMAGES: import('@cloudflare/workers-types').Fetcher;
  }

  const env: Env;
  export { env };
}
