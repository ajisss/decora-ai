# Backend

Express API. Projects are persisted in Neon (serverless Postgres, `lib/db.js`), normalized into two tables — `projects` (metadata) and `generations` (one row per generation, queryable by `status` — e.g. count pending generations across the whole system without parsing JSON). A generation's decoration analysis stays as a JSONB column on its row since it's always read/written together with the generation. `lib/store.js`'s `getProject`/`saveProject`/`listProjects` reconstruct the exact same nested JSON shape the app has always used (`{ id, name, setup, generations: [...] }`), so routes and the frontend are unaware of the table split. Generated images and reference uploads are persisted in Vercel Blob (public access) — `imageId`/`referenceImageId` are full Blob URLs, served directly by Blob's CDN. `data/` (gitignored) now only holds `mockAi.js`'s Wikimedia photo cache, a dev-only concern.

## Layout

```
server/
├── index.js          entrypoint: mounts routes, runs DB migration, serves dist/ in prod
├── routes/           HTTP layer — request/response only, no business logic
│   ├── projects.js       CRUD for projects
│   ├── generate.js       main design generation (+ /cancel)
│   ├── analyze.js        decoration analysis
│   ├── itemImage.js      per-checklist-item image generation (+ /cancel)
│   ├── uploads.js        reference image uploads
│   ├── prompt.js         prompt preview/compile
│   └── auth.js           register/login/Google SSO/survey
├── lib/               business logic, external API clients — no req/res
│   ├── db.js             Neon connection (sql tag) + table migration (projects, generations)
│   ├── store.js          reconstructs the project JSON from projects+generations tables; images/uploads in Vercel Blob
│   ├── imaginer.js       Imaginer (Mirava) client — image generation, gpt-image-2
│   ├── vision.js         kie.ai client — decoration analysis, gemini-2.5-flash
│   ├── mockAi.js         mock image generation (MOCK_AI=true), real photos, no cost
│   ├── itemImage.js      per-item prompt building + mock/real dispatch
│   ├── promptTemplate.js structured wizard answers → generation prompt
│   ├── userStore.js      users in Postgres (Neon) — same table-per-entity pattern as store.js
│   └── auth.js           password hashing, JWT, Google ID token verification
├── middleware/         requireAuth.js — Bearer JWT verification
└── data/              runtime data (gitignored): mock-cache/ only
```

Rule of thumb: a `routes/*.js` file validates the request, calls into `lib/`, and shapes the response. It should never itself call `fetch()` against an external API or touch the filesystem directly — that belongs in `lib/`.

## The two AI providers — don't conflate them

- **Image generation** (main design + per-item images): `lib/imaginer.js`, gated by `MOCK_AI`. When mocked, `lib/mockAi.js` and `lib/itemImage.js`'s mock path return real cached stock photos instead of calling the paid API.
- **Decoration analysis**: `lib/vision.js`, **always real** — it's cheap (gemini-2.5-flash) and `MOCK_AI` intentionally does not affect it. Do not add a mock path here without an explicit product decision; this was already tried and deliberately reverted once.

## Background jobs

Image generation (both main design and per-item) is slow (tens of seconds to minutes) — routes respond immediately with a `pending` entry and do the actual work in an unawaited background function. The client discovers completion by polling `GET /api/projects/:id`. Each background function re-reads the project before writing its result (so it doesn't clobber unrelated edits made while it was running) and checks for a `cancelled` status first (so a user-cancelled request isn't resurrected by a late-arriving result).

`saveProject` replaces a project's entire `generations` row set (delete + reinsert) in a single `sql.transaction(...)` — this must stay atomic, since a background job re-reading the project mid-save must never observe a moment where generations were deleted but not yet reinserted.
