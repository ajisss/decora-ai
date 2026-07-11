# Decor-AI

AI-powered wedding decoration planning: guided wizard → AI-generated design → decoration checklist analysis → vendor-ready export.

## Architecture

Two halves, one repo, one deploy artifact:

```
┌─────────────────────────┐        ┌──────────────────────────┐
│   src/  (Frontend)       │        │   server/  (Backend)     │
│   React + Vite + Tailwind│  /api  │   Express, Node.js       │
│   Client-only rendering  │ ─────▶ │   Neon Postgres + Blob   │
└─────────────────────────┘        └──────────────────────────┘
                                              │
                                              ▼
                                    Imaginer API (image generation)
                                    kie.ai gemini-2.5-flash (analysis)
```

- **Dev**: two processes — Vite dev server (default port 4488, hot reload) proxies `/api` to the Express API (default port 4489).
- **Prod**: one process — `npm run build` outputs static files to `dist/`; Express (`server/index.js`) serves `dist/` directly and answers `/api/*` itself. Only one port to expose.

Projects are persisted in Neon (serverless Postgres); generated images and reference uploads are persisted in Vercel Blob and served directly from its CDN. See `server/README.md`.

## Folder guide

| Path | What it is |
|---|---|
| `src/` | Frontend — see [`src/README.md`](src/README.md) |
| `server/` | Backend — see [`server/README.md`](server/README.md) |
| `docs/product/` | Product/UX planning docs (vision, wireframes, task breakdown) — not loaded at runtime, reference only |
| `index.html`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js` | Frontend build config (must stay at repo root — Vite convention) |
| `package.json` | Single package for both halves — see Scripts below |

## Running it

```bash
npm install
cp server/.env.example server/.env   # fill in API keys, see Environment below
npm run dev             # frontend on :4488, backend on :4489, proxied together
```

Or as a single port (closer to production):

```bash
npm run build           # builds src/ into dist/
node --env-file=server/.env server/index.js   # serves dist/ + API on one port (:4489 by default)
```

## Scripts

| Script | Does |
|---|---|
| `npm run dev` | Runs `dev:web` (Vite) and `dev:server` (Express) concurrently |
| `npm run build` | Builds the frontend to `dist/` |
| `npm run preview` | Previews the built frontend (Vite only, no API) |
| `npm test` | Runs backend unit tests (`server/lib/*.test.js`) |

## Environment

See `server/.env.example` for the full list with comments. Key ones:

| Var | Purpose |
|---|---|
| `MOCK_AI` | `true` = image generation (main design + item images) is mocked, zero API cost. `false` = real Imaginer calls. Never affects decoration analysis (see `server/README.md`). |
| `IMAGINER_API_KEY` | Image generation (Imaginer/Mirava, `gpt-image-2` model) |
| `KIE_API_KEY` | Decoration analysis (kie.ai, `gemini-2.5-flash`) |
| `API_PORT` | Backend port (default `4489`) |
| `GENERATION_DAILY_CAP` | Per-project daily design-generation limit |
| `DATABASE_URL` | Neon Postgres pooled connection string (project data) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token (generated images + reference uploads) |
