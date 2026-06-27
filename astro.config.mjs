import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import svelte from '@astrojs/svelte';

export default defineConfig({
  output: 'static',
  site: 'https://thebunkercode.org',
  adapter: cloudflare(),
  integrations: [svelte()],
  build: {
    inlineStylesheets: 'always',
  },
});
