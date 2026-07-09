# Frontend

React 18 + Vite + Tailwind CSS. No SSR, no build-time data fetching — a pure client-side SPA that talks to `server/` over `/api`.

## Layout

```
src/
├── main.jsx              entrypoint: providers (Auth, Projects, Toast) + router
├── App.jsx                route table
├── content.js              all user-facing copy (Indonesian) — no hardcoded strings in components
├── pages/                 one file per route (React Router), composed from components/
├── components/
│   ├── ui/                  generic, content-agnostic primitives (Dialog, Toast, Skeleton, EmptyState...)
│   ├── shell/                app chrome once logged in (sidebar, top bar, sync indicator)
│   ├── generator/            Studio feed: a generation card, reference-image picker
│   ├── analyzer/             decoration checklist panel
│   ├── export/                export dialog + PNG/PDF brief builder
│   ├── wizard/                wizard form controls (chips, palette picker, stepper...)
│   └── *.jsx (top-level)      landing-page marketing sections (Hero, Nav, Pricing...)
├── context/                global state via React Context — not a state library
│   ├── AuthContext.jsx        mock session (localStorage), gates app routes
│   └── ProjectsContext.jsx    projects CRUD + generation/analysis orchestration, localStorage-first with server sync
└── api/
    └── client.js              the only file that calls fetch() — every backend endpoint has one function here
```

Rule of thumb: a `pages/*.jsx` file owns routing/URL state and composes components; a `components/**/*.jsx` file is presentational and takes callbacks as props; `context/` owns anything that needs to survive a navigation; `api/client.js` is the only network boundary.

## Data flow

`ProjectsContext` is the source of truth for project/generation state on the client. It keeps a `localStorage` copy for instant reads, syncs to the server in the background, and reconciles with the server on load (server wins). Long-running actions (`runGeneration`, `runItemImage`, `runAnalysis`) follow the same shape: optimistic local update → `api.*` call → poll `GET /projects/:id` until the entry leaves `pending`.

## Localization

All UI copy lives in `content.js` under `content.app.*`, in Indonesian. Two deliberate exceptions: AI image-generation prompts stay in English (model quality), and category *values* stay in English since they're persisted data matching the server's schema — only their *display labels* are localized (see `categoryLabels` maps).
