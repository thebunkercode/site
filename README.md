# the bunker code — landing

Landing page de **the bunker code**, un espacio donde construimos software en vivo en Twitch. Proyectos reales, open source, comunidad.

## Stack

- **pnpm 11** — package manager con seguridad integrada (contenido-addressable store, `onlyBuiltDependencies`, `strict-peer-dependencies`)
- **Astro 7** — static site + islands architecture
- **Svelte 5** — componentes interactivos con runes (`$state`, `$effect`, `$props`)
- **Cloudflare Workers** — API routes serverless + D1 database + KV
- **TypeScript 5.9** — strictest config (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`)
- **Vitest** + **happy-dom** — testing unitario y de componentes

## Estructura

```
code/
├── src/
│   ├── components/     # Svelte 5 + Astro componentes
│   ├── layouts/        # Layout base HTML
│   ├── lib/            # Lógica compartida + tests
│   ├── pages/          # Rutas (index, about, contact) + API endpoints
│   └── styles/         # Design system global CSS
├── migrations/         # D1 schema
├── public/             # Assets estáticos + _headers
├── docs/               # Documentación (workflows, planes)
├── .husky/             # Pre-commit hooks
└── vitest.config.ts    # Vitest + coverage thresholds
```

## Scripts

| Comando              | Descripción                         |
| -------------------- | ----------------------------------- |
| `pnpm dev`           | Dev server con HMR                  |
| `pnpm dev:edge`      | Dev server en Cloudflare edge local |
| `pnpm build`         | Build de producción                 |
| `pnpm check`         | Type check (`astro check`)          |
| `pnpm lint`          | ESLint                              |
| `pnpm format`        | Prettier                            |
| `pnpm test`          | Tests (watch)                       |
| `pnpm test:run`      | Tests (single run)                  |
| `pnpm test:coverage` | Tests + cobertura (gate ≥85%)       |
| `pnpm deploy`        | Deploy a Cloudflare Workers         |

## Testing

```bash
pnpm test:run          # 68 tests
pnpm test:coverage     # + reporte de cobertura
pnpm lint             # ESLint
pnpm check            # Type check
```

**Requisito pre-commit**: todo commit debe pasar `lint-staged` (ESLint + Prettier en archivos staged). El CI exige cobertura ≥85% para hacer merge.

## Instalación

```bash
pnpm install
```

## Branch strategy

```
feature/*  →  develop  →  main (producción)
fix/*      →  main (hotfix directo)
```

- `develop`: integración de features
- `main`: producción — solo via PR desde `develop` o `fix/*`
- Cada PR genera un preview URL automático

## Variables de entorno

Ver `.env.example`. Secrets se configuran via `wrangler secret put`.

## Licencia

MIT © 2026 the bunker code

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
