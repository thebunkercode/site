import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
import { resolve } from 'path';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    passWithNoTests: true,
    setupFiles: ['./src/lib/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 85,
        branches: 75,
        functions: 80,
        statements: 85,
      },
    },
  },
  resolve: {
    conditions: ['browser', 'module', 'import'],
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  plugins: [
    svelte(),
    {
      name: 'cloudflare-workers-mock',
      resolveId(id) {
        if (id === 'cloudflare:workers') {
          return '\0cloudflare:workers';
        }
        return undefined;
      },
      load(id) {
        if (id === '\0cloudflare:workers') {
          return 'export const env = {};';
        }
        return undefined;
      },
    },
  ],
});
