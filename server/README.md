# Backend

Express API. No database — everything is file-based JSON under `data/` (gitignored, created on first run).

## Layout

```
server/
├── index.js          entrypoint: mounts routes, serves dist/ in prod
├── routes/           HTTP layer — request/response only, no business logic
│   ├── projects.js       CRUD for projects
│   ├── generate.js       main design generation (+ /cancel)
│   ├── analyze.js        decoration analysis
│   ├── itemImage.js      per-checklist-item image generation (+ /cancel)
│   ├── uploads.js        reference image uploads
│   └── prompt.js         prompt preview/compile
├── lib/               business logic, external API clients — no req/res
│   ├── store.js          file-based persistence (projects/images/uploads)
│   ├── imaginer.js       Imaginer (Mirava) client — image generation, gpt-image-2
│   ├── vision.js         kie.ai client — decoration analysis, gemini-2.5-flash
│   ├── mockAi.js         mock image generation (MOCK_AI=true), real photos, no cost
│   ├── itemImage.js      per-item prompt building + mock/real dispatch
│   └── promptTemplate.js structured wizard answers → generation prompt
└── data/              runtime data (gitignored): projects/, images/, uploads/, mock-cache/
```

Rule of thumb: a `routes/*.js` file validates the request, calls into `lib/`, and shapes the response. It should never itself call `fetch()` against an external API or touch the filesystem directly — that belongs in `lib/`.

## The two AI providers — don't conflate them

- **Image generation** (main design + per-item images): `lib/imaginer.js`, gated by `MOCK_AI`. When mocked, `lib/mockAi.js` and `lib/itemImage.js`'s mock path return real cached stock photos instead of calling the paid API.
- **Decoration analysis**: `lib/vision.js`, **always real** — it's cheap (gemini-2.5-flash) and `MOCK_AI` intentionally does not affect it. Do not add a mock path here without an explicit product decision; this was already tried and deliberately reverted once.

## Background jobs

Image generation (both main design and per-item) is slow (tens of seconds to minutes) — routes respond immediately with a `pending` entry and do the actual work in an unawaited background function. The client discovers completion by polling `GET /api/projects/:id`. Each background function re-reads the project before writing its result (so it doesn't clobber unrelated edits made while it was running) and checks for a `cancelled` status first (so a user-cancelled request isn't resurrected by a late-arriving result).
