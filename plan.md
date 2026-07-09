# Decor-AI Vision

Implementation-ready plan for the Decor-AI MVP. Written for the engineers and designers who will build it, and grounded in the code that already exists in this repo (Vite + React 18 + Tailwind landing page, plus a **simulated** Studio page with a generate feed, reference-image upload, and a fake progress timer). The MVP is the shortest path from that simulation to a real product.

---

## Executive Summary

Decor-AI turns a structured questionnaire about a wedding (theme, venue, budget, palette) into an optimized image-generation prompt, calls the GPT Image API, and renders results in a workspace where the image can be analyzed into a decoration checklist and exported as a vendor brief.

The MVP is deliberately small:

- **One new Node/Express backend** (~3 endpoints) that proxies OpenAI calls and persists projects as JSON files on disk.
- **The existing React frontend extended**, not rewritten: a guided setup wizard feeding the existing Studio page, plus an analyze panel and an export action.
- **No auth, no database, no item-level editing** in the MVP. Projects live in localStorage (frontend) mirrored to JSON files (backend) so nothing is lost on refresh.

Estimated build time: 2 weeks for one engineer, with week 1 producing a demoable end-to-end flow.

---

## Problem Statement

Couples and organizers can describe a wedding in plain language ("rustic garden, gold and sage, 300 guests") but cannot translate that into an AI prompt that produces a usable decoration concept. Raw image generators produce inconsistent results and give no path from "pretty picture" to "list of things a vendor must build and price."

Three gaps, in order of pain:

1. **Prompt gap** — users don't know how to prompt; results are generic or off-brief.
2. **Actionability gap** — a generated image is not a plan; vendors need an itemized list (stage, backdrop, chairs, florals, lighting…).
3. **Iteration gap** — regenerating the whole image loses everything the user liked. (This is the Item Editor problem — real, but explicitly post-MVP.)

The MVP closes gaps 1 and 2 and takes the cheapest possible swing at gap 3 (regenerate with a modification note, not object-level editing).

---

## Product Vision

Idea → AI-generated design → understand the decoration items in it → refine → walk into a vendor meeting with a brief. All in one session, in minutes.

The long-term differentiator is not image generation (a commodity) — it is the **structured context layer** (the wizard) on the way in and the **structured decomposition layer** (the analyzer/checklist) on the way out. Everything between those two layers can be swapped (GPT Image today, Midjourney later) without changing the product.

---

## Design Principles

1. **Structure over prompts.** The user never has to write a prompt from scratch. Free text is always optional and always additive.
2. **Every image is a step toward a checklist.** Generation is not the end state; the vendor brief is. UI should always show the path forward (Generate → Analyze → Export).
3. **Ship the proxy, not the platform.** The backend is a thin API proxy + JSON store. Resist any abstraction that isn't needed to call two OpenAI endpoints and write files.
4. **Degrade gracefully.** AI calls fail and cost money. Every AI action needs a loading state, an error state with retry, and must never lose user input.
5. **Reuse what exists.** The Studio page's feed layout, progress UI, and reference upload already work as simulation. Wire them to real APIs before building anything new.

---

## User Personas

### 1. Bride & Groom ("Sari & Dimas")
- Planning their own wedding, no design vocabulary, moderate budget sensitivity.
- Goal: see what their wedding *could* look like and bring something concrete to vendor meetings.
- Success: exports a design + checklist they're excited about in under 15 minutes.
- MVP priority: **primary persona.** The wizard defaults and copy are written for them.

### 2. Wedding Organizer ("Rina, WO")
- Runs 3–10 weddings a month, uses the tool to align clients quickly during consultations.
- Goal: generate 2–3 concept directions live in a meeting, compare, and send the chosen one to the client.
- Success: faster client sign-off; fewer revision cycles.
- MVP priority: served by the same flow; needs the Project Library (multiple projects, duplicate) more than the couple does.

### 3. Decoration Vendor ("Pak Budi, decorator")
- Receives briefs; wants an unambiguous item list with the image.
- In the MVP, the vendor is a **recipient of the export**, not a logged-in user. Designing for vendor accounts now would be premature.

---

## User Journey

```
Sari lands on the site
  → clicks "Create a design" (CTA already on landing page)
  → New Project: names it "Garden Wedding — Dec 2026"
  → Wizard: picks Rustic theme, Garden venue, ~300 guests, gold/sage palette,
    adds note "lots of fairy lights", optionally uploads a Pinterest screenshot
  → Reviews the generated prompt summary (editable), hits Generate
  → Studio: 15–30s progress, image appears in the feed
  → Not quite right → "Regenerate with changes": types "make the backdrop taller"
  → Second image is right → clicks Analyze
  → Checklist appears: Stage, Backdrop, Chairs (Tiffany, ~300), Florals, Fairy lights, Walkway…
  → Unchecks items she'll source herself, adds a note on the backdrop
  → Export → downloads PDF vendor brief (image + checklist + wedding parameters)
  → Brings it to Pak Budi
```

Time budget: wizard ≤ 3 min, generation ≤ 45 s per image, analysis ≤ 20 s, export instant.

---

## Information Architecture

Reorganization from the mindmap — the mindmap's 8 modules collapse into **4 screens**:

```
/                     Landing (exists)
/projects             Project Library (list of projects)
/projects/new         Guided Wizard (setup → prompt preview)
/studio/:projectId    Studio workspace
                        ├── Generate feed (exists as simulation)
                        ├── Analyze panel (checklist, per generation)
                        └── Export action (per generation)
```

Rationale for the collapse:

- **Design Canvas ≠ separate screen.** The existing Studio feed *is* the canvas. A dedicated canvas with zoom/versions is a lightbox + the feed itself (each generation in the feed is effectively a version).
- **Decoration Analyzer ≠ separate screen.** It's a side panel attached to a selected generation. Navigating away from the image to see its checklist would be worse UX.
- **Export ≠ separate screen.** It's a button + dialog on a generation.
- **Account** is cut from MVP entirely (see Open Questions). No auth means no signup friction for a demo-stage product.

---

## Functional Modules

### 1. Guided Project Setup (Wizard)

- **Purpose:** Collect structured inputs and compile them into an optimized prompt so users never prompt-engineer.
- **User story:** As a couple, I answer simple questions about my wedding and get a professional-quality generation prompt I can tweak or just accept.
- **Features (MVP):**
  - Single-page form with grouped sections (not a multi-step wizard — 8 fields don't justify step navigation; a scrollable form with a sticky "Continue" is simpler and faster). Fields: Theme, Style, Venue Type, Venue Size, Guest Capacity, Budget tier, Color Palette (multi-select chips + custom hex), Additional notes (free text).
  - All fields have sensible defaults; only Theme and Venue Type are required.
  - Optional reference image upload (component already exists: `ReferenceImageInput`).
  - **Prompt preview step:** show the compiled prompt in an editable textarea before generating. This is cheap trust-building and a power-user escape hatch.
  - Prompt compilation is a **deterministic template on the backend** (string assembly from fields), *not* an LLM call. An LLM "prompt optimizer" adds latency, cost, and nondeterminism for marginal gain at MVP. Revisit if template prompts underperform.
- **Future scope:** LLM-assisted prompt refinement, theme presets gallery, saved palettes, multi-language prompts.

### 2. AI Design Generator

- **Purpose:** Turn the compiled prompt into decoration concept images.
- **User story:** As a user, I click Generate and get a realistic decoration concept; if it's off, I say what to change and regenerate.
- **Features (MVP):**
  - Generate 1 image per click (GPT Image, `1536x1024` landscape, quality `medium`). One image, not four: each image costs real money and 30+ seconds; the feed model makes sequential generation feel natural. "Variations" = clicking Generate again.
  - Regenerate with a modification note (appends "Modification request: …" to the prompt). This is the MVP answer to refinement.
  - Progress indicator (exists; replace the fake timer with real request lifecycle — indeterminate progress with elapsed time, since GPT Image doesn't stream progress).
  - Reference image passed to the image edit endpoint when provided.
  - Error state with retry; the prompt is never cleared on failure.
- **Future scope:** batch variations, style-consistency via seed/reference chaining, Midjourney backend.

### 3. Design Canvas (folded into Studio feed)

- **Purpose:** View and compare what's been generated.
- **User story:** As a user, I scroll my generation history, open any image full-screen, and pick the one to analyze/export.
- **Features (MVP):** feed of generations newest-first (exists), lightbox zoom (exists), each generation persisted as part of the project (new). "Save version" is implicit — every generation is saved; nothing is overwritten.
- **Future scope:** side-by-side compare, annotations, favorites within a project.

### 4. Decoration Analyzer

- **Purpose:** Convert a chosen image into an itemized decoration checklist.
- **User story:** As a user, I click Analyze on my chosen design and get a checklist of decoration elements I can edit and hand to a vendor.
- **Features (MVP):**
  - One GPT Vision call with a fixed item taxonomy (Stage, Backdrop, Chairs, Tables, Flowers, Lighting, Walkway, Reception Desk, Ceiling Decoration, LED Screen, Other) and a JSON schema response (`items: [{category, name, description, estimatedQuantity}]`). Structured output, not free text — the checklist must be machine-editable.
  - Checklist panel: check/uncheck items, edit names/quantities, add manual items, per-item notes.
  - Result cached on the generation — analyzing twice doesn't re-call the API unless the user asks.
- **Future scope:** bounding boxes on the image, per-item cost estimation, linking items to vendor catalogs.

### 5. Item Editor — **explicitly out of MVP**

- **Purpose (future):** Replace a single object (e.g., chairs) without regenerating the scene.
- Requires inpainting/masking, which GPT Image supports via the edits endpoint with a mask — but producing good masks needs segmentation UI work that dwarfs the rest of the MVP. The MVP substitute is regenerate-with-note.
- **Future scope:** click-to-select item (from analyzer bounding boxes) → auto-mask → inpaint replacement.

### 6. Project Library

- **Purpose:** Hold multiple projects (critical for the WO persona).
- **User story:** As an organizer, I keep a project per client, duplicate a past concept as a starting point, and delete dead ones.
- **Features (MVP):** grid of project cards (name, thumbnail of latest generation, updated date), create, open, rename, duplicate, delete. Favorite and cross-project compare are P2.
- **Future scope:** search/filter, client tags, sharing between accounts.

### 7. Export

- **Purpose:** Produce vendor-ready artifacts.
- **User story:** As a user, I export my chosen design as an image or a one-page brief I can send to a vendor.
- **Features (MVP):**
  - PNG download (trivial — the image URL/file already exists).
  - **PDF Vendor Brief** — one page: project name, wedding parameters, the image, the checklist with notes. Generated client-side with `jsPDF` (no backend rendering service). "Checklist export" and "vendor brief" are the same document; don't build two.
- **Future scope:** share link (needs hosting/auth decisions), branded templates, multi-image briefs.

### 8. Account — **cut from MVP**

No auth. Projects are keyed by a client-generated ID, stored in localStorage and mirrored to the backend JSON store. Acceptable for a 2-week MVP whose goal is validating the flow; see Risks and Open Questions.

---

## MVP Scope

| Priority | Item | Why |
|---|---|---|
| **P0** | Backend proxy (generate, analyze) + API key handling | Nothing is real without it; keys must never ship to the browser. |
| **P0** | Wizard form → prompt template → editable prompt preview | The core product thesis (structure over prompts). |
| **P0** | Real generation wired into existing Studio feed | Converts the existing simulation into the product. |
| **P0** | Regenerate with modification note | Cheapest viable refinement loop; without it users churn on first bad image. |
| **P0** | Analyzer → editable checklist | The actionability gap is the differentiator vs. raw ChatGPT. |
| **P0** | Project persistence (localStorage + backend JSON files) | Losing a generated project on refresh is unacceptable even in a demo. |
| **P1** | Project Library screen (list, create, open, delete, duplicate) | Needed for the WO persona and any repeat use; but a single implicit project is enough to demo the core loop, so it can land in week 2. |
| **P1** | PDF vendor brief export + PNG download | The journey's endpoint; P1 only because the checklist on screen already demonstrates value in week 1. |
| **P1** | Reference-image-guided generation | Component exists; wiring it to the image edits endpoint is moderate effort, high delight. |
| **P2** | Favorites, compare view, per-item quantity/cost fields | Nice-to-have polish; no persona is blocked without them. |
| **P2** | Share link | Requires hosted images + link infra + a privacy decision. |
| **Cut** | Item Editor, accounts/auth, Midjourney, mobile-optimized studio | Each is a project-sized effort or blocked on decisions; none is needed to validate the loop. |

---

## UX Flow

### Screen 1 — Landing (`/`) — exists
- Marketing sections already built. **Change:** primary CTA routes to `/projects/new` (or `/projects` if projects exist locally). The `GeneratorTeaser` keeps its quick-prompt behavior but hands off into a real project.

### Screen 2 — Project Library (`/projects`)
- Grid of project cards + "New project" card.
- **Actions:** open (→ studio), rename (inline), duplicate, delete (confirm dialog).
- Empty state: single illustration + "Start your first design" → wizard.

### Screen 3 — Guided Wizard (`/projects/new`)
- One scrollable form, three visual groups: *The wedding* (theme, style), *The venue* (type, size, capacity), *The look* (palette, budget, notes, reference image).
- Sticky footer: "Preview prompt →".
- **Prompt preview state (same route, second panel):** compiled prompt in an editable textarea, the reference image thumbnail, and "Generate design" button. Back link returns to the form with values intact.
- **Actions:** edit any field, edit compiled prompt directly, upload/remove reference image, generate (creates the project and routes to studio with autorun — the autorun mechanism already exists in `StudioPage`).

### Screen 4 — Studio (`/studio/:projectId`)
- Existing layout kept: icon sidebar, generation feed, bottom prompt bar, right panel.
- **Feed entry (done state):** image, prompt used, timestamp, and three buttons: **Analyze**, **Export**, **Use as reference** (P1).
- **Bottom bar:** modification note input + Generate. Placeholder: "Describe what to change, or leave empty to rerun".
- **Right panel tabs:** *Setup* (read-only summary of wizard answers, "Edit setup" link) and *History* (exists).
- **Actions:** generate/regenerate, open lightbox (zoom — exists), analyze, export, edit setup.

### Screen 5 — Analyze (panel over Studio, per generation)
- Slide-over panel: image thumbnail on top, checklist below grouped by category.
- **Actions:** run analysis (first open), toggle item on/off, edit item text/quantity, add manual item, add note per item, "Re-analyze" (explicit, because it costs an API call).
- Loading: skeleton checklist rows. Error: retry button, panel stays open.

### Screen 6 — Export (dialog over Studio)
- Two options with previews: **PNG** (image only) and **Vendor Brief PDF** (image + parameters + checklist). If the generation was never analyzed, the PDF option shows "Checklist not included — analyze first?" with a shortcut.
- **Actions:** download PNG, download PDF.

---

## Data Model

Plain JSON, no ORM. One file per project on the backend: `data/projects/{id}.json`.

```
Project
  id            string (nanoid, client-generated)
  name          string
  createdAt     ISO string
  updatedAt     ISO string
  setup         Setup
  generations   Generation[]

Setup
  theme         string        // "rustic" | "modern" | ... free string, chips in UI
  style         string
  venueType     string        // "indoor-ballroom" | "garden" | "beach" | ...
  venueSize     string        // "small" | "medium" | "large"
  guestCapacity number
  budgetTier    string        // "economy" | "standard" | "premium" | "luxury"
  colorPalette  string[]      // hex codes or named colors
  notes         string
  referenceImageId string|null   // filename in data/uploads/

Generation                     // one per Generate click; doubles as "Version"
  id            string
  createdAt     ISO string
  prompt        string        // the exact prompt sent (post-edit, post-modification)
  modificationNote string|null
  status        "pending" | "done" | "error"
  imageId       string|null   // filename in data/images/
  error         string|null
  analysis      Analysis|null

Analysis
  analyzedAt    ISO string
  items         DetectedItem[]

DetectedItem
  id            string
  category      string        // fixed taxonomy + "other"
  name          string        // "Tiffany chairs"
  description   string
  estimatedQuantity string|null   // "~300" — string, not number; AI estimates are fuzzy
  included      boolean       // checkbox state, default true
  note          string        // user note
  isManual      boolean       // user-added vs detected
```

There is **no separate Version or Export entity.** A generation *is* a version; an export is a client-side render of existing data and needs no record. Adding entities for them now is speculative.

Frontend keeps the same shapes in a single React context backed by localStorage; every mutation also fires a debounced `PUT /api/projects/:id`. Backend files are the source of truth for images; localStorage is the fast path for UI state.

---

## Technical Architecture

```
Browser (React SPA, exists)
   │  fetch /api/*
   ▼
Node + Express server (new, ~200 lines)
   ├── serves  /api/generate, /api/analyze, /api/projects, /api/uploads
   ├── holds   OPENAI_API_KEY (env var, never in client)
   ├── writes  data/projects/*.json, data/images/*.png, data/uploads/*
   └── serves  data/images statically at /images/*
   │
   ▼
OpenAI API
   ├── Images (gpt-image-1): generations + edits (when reference image present)
   └── Chat Completions with vision (gpt-4o-mini first; upgrade to gpt-4o
       only if detection quality demands it) with JSON-schema response_format
```

- **Frontend:** existing Vite + React 18 + Tailwind app. Add `react-router` routes, a `ProjectsContext`, and an `api/` client module. No state library — context + localStorage is sufficient at this scale. Add `jsPDF` for the brief.
- **Backend:** single Express app in `server/` inside this repo (monorepo-lite; no workspaces needed). Dev: run Vite and Express side by side with a Vite proxy for `/api` and `/images`. Prod: Express serves the built `dist/`.
- **Storage:** filesystem JSON + image files. No SQLite, no Postgres — with no auth and demo-scale traffic, files are simpler to inspect and debug. Migration path to SQLite is trivial later because all access goes through one `store.js` module.
- **Images:** GPT Image returns base64; the server decodes and saves to `data/images/{id}.png` immediately (never store base64 in JSON, never rely on expiring URLs).
- **Cost control:** server-side guard — max N generations per project per day (env-configurable, default 20) and a hard image-size/quality setting. Prevents a demo link from burning the API budget.

---

## API Flow

### Generate
```
User clicks Generate (Studio)
  → POST /api/generate { projectId, prompt, modificationNote?, referenceImageId? }
  → Server: appends generation {status:"pending"} to project JSON, compiles final prompt
  → Server → OpenAI Images (generations, or edits if reference image)   [20–60s]
  → Server: decodes base64 → data/images/{genId}.png, sets status:"done", saves JSON
  → 200 { generation }        // single response; no polling — 60s is fine for one HTTP request,
                              // frontend shows indeterminate progress with elapsed time
  → Frontend updates feed + localStorage
On error: server records status:"error" + message → 502 { error } → feed entry shows retry.
```

### Decoration Analysis
```
User clicks Analyze on a generation
  → POST /api/analyze { projectId, generationId }
  → Server: reads image file, sends to Chat Completions (vision) with fixed taxonomy
    prompt + JSON schema response_format
  → Server: validates/parses JSON, stores analysis on the generation, saves project JSON
  → 200 { analysis }
  → Frontend renders checklist; subsequent edits are project saves, not AI calls
```

### Project Save
```
Any project mutation (rename, checklist edit, setup change)
  → localStorage write (instant)
  → debounced 1s → PUT /api/projects/:id { project }
  → Server overwrites data/projects/{id}.json
GET /api/projects and GET /api/projects/:id hydrate on app load
(server wins over localStorage if both exist — images only live server-side).
```

### Export
```
Entirely client-side. PNG: <a download> of /images/{id}.png.
PDF: jsPDF composes image (fetched as blob) + setup summary + checklist → download.
No backend involvement, no Export API.
```

---

## Folder Structure

```
decor-ai/
├── server/
│   ├── index.js            # Express bootstrap, static serving
│   ├── routes/
│   │   ├── generate.js
│   │   ├── analyze.js
│   │   └── projects.js
│   ├── lib/
│   │   ├── openai.js       # API calls, model config in one place
│   │   ├── promptTemplate.js  # setup → prompt compilation (pure function, unit-testable)
│   │   └── store.js        # all fs reads/writes for projects & images
│   └── data/               # gitignored: projects/, images/, uploads/
├── src/
│   ├── api/client.js       # fetch wrappers for /api/*
│   ├── context/ProjectsContext.jsx
│   ├── pages/
│   │   ├── LandingPage.jsx      # exists
│   │   ├── ProjectsPage.jsx     # library
│   │   ├── WizardPage.jsx
│   │   └── StudioPage.jsx       # exists, gets real API wiring
│   ├── components/
│   │   ├── (landing components — exist, untouched)
│   │   ├── wizard/         # field groups, PalettePicker, PromptPreview
│   │   ├── generator/      # exists: ReferenceImageInput, ResultTile
│   │   ├── analyzer/       # ChecklistPanel, ChecklistItem
│   │   └── export/         # ExportDialog, buildBriefPdf.js
│   ├── lib/                # date/format helpers, localStorage sync
│   └── content.js          # exists — copy stays centralized here
├── plan.md
└── package.json            # add: express, cors, nanoid, jspdf; scripts: dev:server, dev (concurrently)
```

Feature-folder structure (`wizard/`, `analyzer/`) over type folders — matches how the existing `generator/` folder is already organized.

---

## Implementation Roadmap

### Week 1 — real end-to-end loop (demoable by Friday)
1. **Day 1:** Express server skeleton, `/api/generate` calling GPT Image with a hardcoded prompt, image saved and served. Vite proxy. *Proves the riskiest integration first.*
2. **Day 2:** Prompt template (`setup → prompt`, unit-tested), `POST /api/generate` accepting real setup, generation cost guard.
3. **Day 3:** Wizard page (form + prompt preview) → creates project → routes to Studio; StudioPage simulation replaced with real API calls (keep the feed/progress UI, swap the fake timers).
4. **Day 4:** `/api/analyze` with JSON-schema vision call; ChecklistPanel with toggle/edit/add.
5. **Day 5:** Project persistence (store.js, PUT/GET projects, localStorage sync). Bug day. **Milestone: idea → image → checklist survives a refresh.**

### Week 2 — complete the journey + harden
6. **Day 6–7:** Project Library page (list/open/duplicate/delete), landing CTA rewiring.
7. **Day 8:** Export — PNG download + jsPDF vendor brief.
8. **Day 9:** Reference-image generation path (upload endpoint + edits API), regenerate-with-note polish.
9. **Day 10:** Error/empty/loading states pass, copy pass on `content.js`, cost-guard tuning, deploy (single Node process on Railway/Render/Fly — no Docker required by those platforms' Node buildpacks).

### Future (validated demand first)
- Item Editor via analyzer bounding boxes → mask → GPT Image edits inpainting.
- Accounts + share links (likely together — sharing forces the hosting/identity question).
- SQLite migration, Midjourney backend, cost estimation per checklist item, compare view.

---

## Risks

### Technical
- **Image generation quality/consistency** (highest risk). Rustic-garden prompts may produce non-wedding or physically implausible scenes. *Mitigation:* invest Day 2 in the prompt template with real test runs across all theme×venue combos; keep the template in one pure function so iteration is cheap; editable prompt preview as escape hatch.
- **Vision analysis accuracy.** Wrong or missed items undermine the "checklist you can trust" promise. *Mitigation:* fixed taxonomy constrains hallucination; checklist is fully editable so AI output is a draft, not a verdict; start with `gpt-4o-mini` and benchmark before paying for `gpt-4o`.
- **API cost runaway.** A public demo link + image API = surprise bill. *Mitigation:* server-side per-project daily cap, medium quality, single-image generation, OpenAI spend limit set on the account.
- **Long request duration (up to 60s) on one HTTP call.** Some hosts kill long requests. *Mitigation:* pick a host with configurable timeouts (Railway/Fly); if it becomes a problem, switch to pending-status + polling — the data model already supports it (`status: "pending"`).

### UX
- **No-auth persistence confusion.** Users on a second device/browser won't see their projects. *Mitigation:* copy on the library page ("Projects are saved on this device"); accept for MVP.
- **Wizard abandonment.** Even 8 fields can stall users. *Mitigation:* only 2 required fields, defaults everywhere, single scrollable page.
- **Expectation gap on refinement.** Users will expect "change only the chairs" and get whole-image regeneration. *Mitigation:* label the input honestly ("Describe changes — we'll generate a new version") and keep old versions in the feed so nothing feels lost.

### Business
- **Thin moat.** ChatGPT can do a worse version of this flow for free. The bet is that structure (wizard) + actionability (checklist/brief) + domain focus beats a general tool. Validate with real WO users in week 3, before building Item Editor.
- **Cost per session vs. willingness to pay.** ~4 images + 1 analysis per session has real COGS; pricing must cover it. Instrument generation counts per session from day one (a log line is enough).

---

## Open Questions

1. **Language.** The existing Studio code has Indonesian comments and the target users are plausibly Indonesian; the mindmap is English. Which language for UI copy — ID, EN, or both? (Copy is centralized in `content.js`, so the cost of deciding late is low, but the PDF brief template needs one now.)
2. **Budget field semantics.** Is budget an input to the *visual style* (premium look vs. economy look) or future cost-estimation data? MVP treats it as a style modifier in the prompt; confirm.
3. **When do accounts arrive?** The moment we want share links or cross-device access. Recommendation: not before the core loop is validated with ~10 real users.
4. **Image rights & watermarking.** Are exported briefs Decor-AI-branded? Do we watermark PNG exports on the free tier? Product/pricing decision, not needed for build start.
5. **Vendor as a user.** Vendors are export recipients in the MVP. Is there a near-term play where vendors respond to briefs in-product (quotes)? Affects whether the brief gets a share link sooner.
6. **Quality tier of GPT Image.** `medium` quality at 1536×1024 is the planned default (cost/speed). If demo feedback says images look flat, `high` roughly triples cost — needs a pricing answer.
7. **Existing pricing section on the landing page** promises tiers — do those tiers gate anything in the MVP (e.g., generations per day), or is all of MVP free-demo? Affects the cost guard defaults.
