# Decor-AI — MVP Tasks

Single source of truth during development. Derived from `plan.md` (scope), `ux-spec.md` (behavior, §refs), `wireflow.md` (flows, G/A/P/W/E edge refs), `ui-design-plan.md` (visual specs).

**Labels:** `FE` frontend logic · `BE` backend · `AI` OpenAI integration · `UI` component/visual build.
**Sizing:** every task is 30 min – 4 h. **Deps:** `→ needs #id`. Tasks without deps inside a feature can run in any order.
**Rule:** check tasks off here; if scope changes, edit this file in the same PR.

**Providers (as actually wired, not as originally speced):** image generation runs on **kie.ai's `gpt-image-2`** (`server/lib/kie.js`, key `KIE_API_KEY`) — an async task API, not OpenAI's Images endpoint, so `/api/generate` responds immediately with a `pending` generation and finishes the job in the background (see G1/G2). Decoration analysis still calls **OpenAI's vision chat-completions** (`server/lib/openai.js`, key `OPENAI_API_KEY`) — that key is not yet configured, so Analyze will fail until it's set.

---

# P0 — core loop: idea → image → checklist, survives refresh

## Foundations

- [x] **F1** Add deps (`express`, `cors`, `nanoid`, `concurrently`) + scripts `dev:server`, `dev` running both (BE)
- [x] **F2** Express skeleton in `server/index.js`: JSON body, CORS, static `/images` from `server/data/images/`, `.env` for `OPENAI_API_KEY`, gitignore `server/data/` (BE)
- [x] **F3** Vite proxy for `/api` and `/images` (FE) → needs F2
- [x] **F4** Install `react-router`, define routes `/`, `/projects`, `/projects/new`, `/studio/:projectId`, 404 fallback (ux-spec §2.1) (FE)
- [x] **F5** App shell: top bar (56px), wordmark, breadcrumb, marketing vs app shell split (§2.2) (UI) → needs F4
- [x] **F6** Extend Tailwind config with `danger`, `danger-soft`, `success` tokens (§1.1) (UI)
- [x] **F7** New icons: folder, duplicate, trash, download, file-pdf, checklist, sparkle, pencil, comment, plus, chevron, close, warning-triangle, check-circle (§1.5) (UI)
- [x] **F8** `ui/` primitives: `Dialog`, `Toast` (single, bottom-center, queue-replace), `Skeleton`, `DropdownMenu` (§3.3–3.5) (UI) → needs F6

## Backend Store & Project Persistence

- [x] **S1** `server/lib/store.js`: read/write/list/delete `data/projects/{id}.json`, save image buffer, atomic write (temp + rename) (BE)
- [x] **S2** Project routes: `GET /api/projects`, `GET /api/projects/:id`, `PUT /api/projects/:id` (upsert), `DELETE /api/projects/:id` (BE) → needs S1
- [x] **S3** `src/api/client.js`: fetch wrappers for all endpoints, typed error mapping (connectivity / policy / cap / 4xx) (FE) → needs S2
- [x] **S4** `ProjectsContext`: state shape per plan.md data model, mutations, localStorage read/write (FE)
- [x] **S5** Debounced 1s backend sync on every mutation + hydration on load (server wins, wireflow 3.8) (FE) → needs S3, S4
- [x] **S6** `SyncIndicator` component: saving / saved-fading / not-synced with retry (§3.6) (UI) → needs S5
- [x] **S7** Multi-tab `storage` event listener refreshing context (§10.2) (FE) → needs S4

## Guided Wizard

- [x] **W1** `ChipGroup` component: single/multi, custom chip with reveal input, roving focus, selected styles (§3.2, §6.1) (UI) → needs F6
- [x] **W2** `SegmentedControl` + `StepperInput` (clamp 10–5000, step 50, hold-to-accelerate) (§6.1, W4) (UI)
- [x] **W3** `PalettePicker`: curated swatch-pair chips + custom hex, max-3 with inline note (§6.1) (UI) → needs W1
- [x] **W4** WizardPage form layout: name field (autofocus, preselected), three `FieldGroup` sections, sticky footer (§6.1) (UI) → needs F5, W1, W2, W3
- [x] **W5** Form state + sessionStorage persistence + restore on refresh (§6.2) (FE) → needs W4
- [x] **W6** Validation on "Preview prompt": theme + venue required, scroll-to + inline error, custom-chip-empty counts as unselected (§6.2, W1) (FE) → needs W4
- [x] **W7** Prompt template `server/lib/promptTemplate.js`: pure function setup → prompt, covering all field combos (BE)
- [x] **W8** Unit tests for prompt template (empty optionals, custom theme, palettes, notes) (BE) → needs W7
- [ ] **W9** Manual quality pass: run template output through GPT Image across ≥6 theme×venue combos, tune wording (AI) → needs W7, G2
- [x] **W10** Prompt Preview view: editable textarea (2,000-char cap + counter, G7), back-link restoring form, slide transition (§6.3) (UI) → needs W4
- [x] **W11** Recompile-conflict banner: detect hand-edit + field change, offer recompile/keep (§6.3, wireflow 3.3) (FE) → needs W10
- [x] **W12** "Generate design": create project (nanoid, local + PUT), navigate to Studio with autorun flag; proceed locally if backend down (§6.3) (FE) → needs S5, W10

## AI Generation

- [x] **G1** ~~`server/lib/openai.js`: GPT Image call~~ → switched to `server/lib/kie.js`: kie.ai `gpt-image-2` (async create-task + poll `recordInfo`, not OpenAI's sync Images API — see doc links in the file header), downloads the result URL to a PNG buffer (AI) → needs F2
- [x] **G2** `POST /api/generate`: append pending generation, respond immediately, then run the kie.ai call **in the background** (kie.ai latency observed 30s–8+ min, too long to hold an HTTP request open) and write done/error back to the project JSON when it resolves; client discovers completion via the G12 poll (BE) → needs S1, G1
- [x] **G3** Server-side guards: daily per-project cap (env, default 20) → 429; reject concurrent generation per project → 409 (G1, G2) (BE) → needs G2
- [x] **G4** Error mapping in generate route: policy refusal vs connectivity vs cap, stable error codes for the client (BE) → needs G2
- [x] **G5** Replace StudioPage fake timers with real `POST /api/generate` call; keep feed insert + autorun mechanism (idempotent, G5 edge) (FE) → needs S3, G2, W12
- [x] **G6** `GenerationEntry` pending state: shimmer block, elapsed counter, 30s patience line (§7.2) (UI) → needs F6. Note: no hard client-side timeout — kie.ai generation can legitimately take minutes, so the entry stays pending until the background job resolves.
- [x] **G7** `GenerationEntry` done state: image (4:3, lightbox click), "Design {n}" label, modification-note quote line, action row (§7.2) (UI) → needs G6
- [x] **G8** `GenerationEntry` error states ×3 (connectivity / policy / cap) with per-type copy, Retry re-running same entry (§7.2, wireflow 3.4) (UI+FE) → needs G6, G4
- [x] **G9** Bottom bar: modification textarea (300 chars, grow to 3 lines), Cmd/Ctrl+Enter, disabled-while-pending lock (§7.1, G1) (FE) → needs G5
- [x] **G10** Modification-note prompt composition: note appends to base compiled prompt, never chains notes (wireflow 5.1) (BE) → needs G2
- [x] **G11** Prompt expander on entries showing full effective prompt (§7.2) (UI) → needs G7
- [x] **G12** Pending-status recovery: on Studio load with a pending generation, poll `GET /api/projects/:id` every 5s until resolved (wireflow 5.3, G3/G6) (FE) → needs S5, G2

## Decoration Analyzer

- [x] **A1** Vision call in `openai.js`: image + fixed-taxonomy prompt, JSON-schema response format, gpt-4o-mini (AI) → needs G1
- [x] **A2** `POST /api/analyze`: read image, call vision, validate/parse, retry once on malformed JSON (A3), store analysis on generation (BE) → needs A1, S1
- [ ] **A3** Detection quality pass: analyze ≥5 generated designs, tune taxonomy prompt for misses/hallucinations (AI) → needs A2
- [x] **A4** `SlideOver` primitive: 420px right panel, focus trap, Escape, popstate close, dim overlay (§3.3) (UI) → needs F8
- [x] **A5** AnalyzePanel shell: header + image strip + not-analyzed state with explicit "Analyze this design" button (§8.1) (UI) → needs A4, G7
- [x] **A6** Analyze flow wiring: call, skeleton rows, error + retry, zero-items state, cached-result reopen, close-mid-flight lands on generation (§8.3, wireflow 3.5) (FE) → needs A2, A5
- [x] **A7** `ChecklistItem` row: checkbox (default checked, dimmed 45% unchecked, no strikethrough), name, description clamp, quantity chip, hover menu (§8.2) (UI) → needs F6
- [x] **A8** Checklist interactions: toggle, inline edit name/quantity, per-item note, add manual item with category select, remove manual-only (§8.2) (FE) → needs A7, S5
- [x] **A9** Re-analyze with confirm popover; preserve `isManual` items, replace detected ones (A1 edge) (FE) → needs A6, A8
- [x] **A10** Entry action swap: "Analyze" → "View checklist ✓" once analysis exists (§7.2) (UI) → needs A6

---

# P1 — complete the journey

## Project Library

- [x] **L1** `ProjectCard` + `NewProjectTile` + grid layout (1/2/3 cols), thumbnail from latest done generation (§5.1) (UI) → needs F5
- [x] **L2** ProjectsPage: list from context sorted by `updatedAt`, loading skeletons, empty state with CTA (§5.3) (FE) → needs L1, S5
- [x] **L3** Rename inline (Enter/blur commit, Escape revert, empty reverts) (§5.2) (FE) → needs L2
- [x] **L4** Duplicate: copy setup + done generations (exclude pending, P3), "{name} (copy N)" naming (P7), highlight pulse (§5.2) (FE) → needs L2
- [x] **L5** Delete: confirm dialog → remove local → 6s Undo toast → commit backend DELETE on expiry; redirect first if current project (§3.7, wireflow 3.7) (FE) → needs L2, F8
- [x] **L6** Degraded banner when backend unreachable but local projects exist (§5.3) (UI) → needs L2
- [x] **L7** Landing CTA + teaser rewiring: Studio-aware routing, teaser text → wizard notes field with notice line (§4, wireflow 3.1) (FE) → needs W5
- [x] **L8** Not-found states: bad `projectId` and 404 route (§10.3) (UI) → needs F4

## Export

- [x] **E1** `ExportDialog` with two `OptionCard`s, preselection logic (PDF if analyzed), no-checklist note + Analyze-first link (§9.1–9.2) (UI) → needs F8, A6
- [x] **E2** PNG download: anchor download of image, filename `{slug}-design-{n}.png` (§9.2) (FE) → needs E1
- [x] **E3** Install `jspdf`; `buildBriefPdf.js`: A4 layout — header, image ≤60% height, details block with palette swatches, grouped checklist (included items, notes italic), page-2 overflow (§9.3, E2 edge) (FE) → needs A8
- [x] **E4** PDF flow wiring: "Preparing…" state, success toast + close, offline image-fetch error inline (§9.2) (FE) → needs E1, E3
- [x] **E5** "Export brief →" from Analyze panel footer (closes panel, opens dialog preselected) (§8.2) (FE) → needs E1

## Reference-Image Generation

- [x] **R1** `POST /api/uploads`: multipart, validate type/size (jpg/png/webp ≤8MB), save to `data/uploads/`, return id (BE) → needs F2
- [x] **R2** Wire existing `ReferenceImageInput` in wizard to upload endpoint, inline errors, remove action (§6.1, W2 edge) (FE) → needs R1, W4
- [x] **R3** Generate route branches to Images *edits* endpoint when `referenceImageId` present (AI) → needs G2, R1
- [x] **R4** "Use as reference" on done entries + `ReferenceChip` in bottom bar (one at a time, replace on set) (§7.2, wireflow 5.1) (FE) → needs G7, R3

## Studio Completion

- [x] **T1** Right panel Setup tab: read-only definition list with palette swatches + "Edit setup" link (§7.4) (UI) → needs G5
- [x] **T2** Wizard edit mode: prefill from project, save returns to Studio, "applies to next design" note; stale-project → not-found (wireflow 5.2, W3 edge) (FE) → needs W12, T1, L8
- [x] **T3** History tab wiring to real generations: click scrolls + clay border flash; `?gen=` deep link (§7.4, wireflow 5.3) (FE) → needs G7
- [x] **T4** Lightbox additions: caption bar (Design n + prompt), download PNG, open-Analyze, arrow-key navigation (§7.5) (UI) → needs G7, E2
- [x] **T5** Feed scroll behavior: auto-scroll to new entry only when near top; scroll restoration on Back (§7.2, wireflow §7) (FE) → needs G6

---

# P2 — hardening & polish

## Quality Pass

- [ ] **Q1** Keyboard + focus audit of golden path: chip roving focus, overlay traps, focus return, route-change focus to h1 (§12) (FE)
- [x] **Q2** `aria-live` announcements for generation/analysis lifecycle + alt-text template on images (§12) (FE) → needs G8, A6
- [x] **Q3** `prefers-reduced-motion` pass across all animations (§1.4) (UI)
- [ ] **Q4** Copy pass: move all new strings into `content.js`, apply tone rules, resolve language decision (§13, plan.md OQ1) (FE)
- [ ] **Q5** Mobile pass on golden path only: bottom-sheet Analyze, stacked Export, icon-only Generate, ≥40px targets (§11) (UI)
- [ ] **Q6** Edge-case QA sweep against wireflow §6 tables (G1–G7, A1–A5, P1–P7, W1–W4, E1–E3), fix fallout (FE)
- [x] **Q7** Generation-count log line per project/day for cost instrumentation (plan.md business risk) (BE) → needs G3

## Deploy

- [x] **D1** Prod mode: Express serves built `dist/`, single-process start script (BE) → needs F2
- [ ] **D2** Deploy to Railway/Render/Fly with env vars, verify 60s+ request timeout, set OpenAI spend limit (BE) → needs D1
- [ ] **D3** Smoke-test golden path on deployed URL (wizard → generate → analyze → export) (FE) → needs D2

---

## Dependency spine (critical path)

```
F2 → G1 → G2 → G5 → G8          (real generation end-to-end)
S1 → S2 → S3 → S5               (persistence)
W4 → W10 → W12 → G5             (wizard feeds studio)
G2 → A2 → A6 → A8               (analyzer)
A8 → E3 → E4                    (brief export)
```

Everything in **UI**-labeled tasks off the spine can be built in parallel against mock data.

---

# Post-MVP — Item Editor (user-requested, outside original P0–P2 scope)

Originally deferred in plan.md ("Item Editor — explicitly out of MVP"). Built anyway per direct user request, using a **mock generator by default** to avoid spending kie.ai credits during development — see `USE_MOCK` in `server/lib/itemImage.js`.

- [x] **I1** `server/lib/itemImage.js`: `buildItemPrompt` (ties item name/description back to parent theme/style/palette) + `generateItemImage` (mock: reuses parent image bytes with an artificial delay; real: kie.ai image-to-image, same model as R3/R4) (AI)
- [x] **I2** `POST /api/item-image`: async background pattern (mirrors G2) — responds immediately with `status: pending`, generates in the background, writes `item.itemImage` back onto the checklist item; concurrency guard per item (BE) → needs I1
- [x] **I3** `src/api/client.js` + `ProjectsContext.runItemImage`: optimistic update + poll-until-resolved (mirrors `runGeneration`) (FE) → needs I2
- [x] **I4** `ChecklistRow` UI: thumbnail + pending shimmer + error/retry, "Generate item image" for a fresh item, "Regenerate / customize" once one exists, inline custom-prompt input (UI) → needs I3

**Before flipping to real generation:** set `USE_MOCK = false` in `server/lib/itemImage.js`. Real mode calls kie.ai's image-to-image model using the parent design as the style reference — same `PUBLIC_BASE_URL` constraint as R3/R4 applies (kie.ai needs a public URL to fetch the reference image).

**Not yet done:** no dedicated lightbox/zoom for item images (reuses the same 48px thumbnail pattern as other UI); no explicit UI copy for "this is a mock" — the mock is invisible to the user by design (same image comes back either way) until real mode is enabled.

---

# Post-MVP — SaaS Shell & UIUX Review (uiuxcontext.md alignment)

Audit penuh terhadap `uiuxcontext.md` + mock login. Temuan & keputusan lengkap di `uiux-improvement-plan.md`.

- [x] **X1** Mock auth: `AuthContext` (sesi localStorage, kredensial apa pun diterima), `/login` (masuk/daftar/Google mock), `RequireAuth` gate untuk semua route app, avatar + menu user di AppShell (FE/UI)
- [x] **X2** `/settings`: profil mock (nama/email), info aplikasi, keluar (UI)
- [x] **X3** Landing CTA masuk produk: Hero & Nav → "Buat Desain Wedding" → /login / /projects/new (uiuxcontext §9) (FE)
- [x] **X4** Lokalisasi Indonesia seluruh app via `content.app` — layar, error client+server, label PDF; blok `content.studio` mati dihapus. Deviasi: prompt & nilai chip tetap EN (kualitas image model) (FE)
- [x] **X5** `EmptyState` (ilustrasi+penjelasan+CTA, uiuxcontext §11) di Library, feed Studio, hasil analisis kosong (UI)
- [x] **X6** Toast sukses: proyek tersimpan, desain jadi, analisis selesai, gambar item jadi (uiuxcontext §13) (FE)
- [x] **X7** "Menganalisis… ±15 detik" + spinner di fase loading analisis (uiuxcontext §10) (UI)
- [x] **X8** Aksi utama tunggal di Studio: Analisis primer di desain terbaru yang belum dianalisis (uiuxcontext §5.6) (UI)
- [x] **X9** Taksonomi +`VIP Chairs` (additive; rename kategori lama sengaja dihindari — memutus data tersimpan) (BE/FE)
- [x] **X10** `ProjectsPage` pakai `<Link>` alih-alih `<a>`+preventDefault (FE)

---

# Gelombang 2 — Full SaaS, semua mock (plan.md P2 + uiuxcontext P2)

Semua fitur tersisa dari kedua plan, dikerjakan dengan data mock (nol kredit AI). Detail di `uiux-improvement-plan.md` §5.

- [x] **Y1** Mode `MOCK_AI=true` (default di .env): generate → foto wedding asli (Wikimedia, rotasi, cache) + delay realistis; analisis → checklist kanonik 8 item. Seluruh golden path gratis. `server/lib/mockAi.js` (BE/AI)
- [x] **Y2** Label kategori checklist bahasa Indonesia (peta tampilan di `content.app.analyze.categoryLabels`; data/enum tetap EN) — panel + PDF (FE)
- [x] **Y3** Estimasi biaya per item (input Rp di mode edit, chip tampil, total di panel + PDF brief) (FE/UI)
- [x] **Y4** Favorit desain: bintang di header kartu, persisted di project (FE/UI)
- [x] **Y5** Bandingkan Versi: pilih 2 desain → modal side-by-side; bar seleksi di atas composer (FE/UI)
- [x] **Y6** Link berbagi: opsi ke-3 dialog Ekspor (salin URL) + halaman publik `/share/:pid/:gid` lihat-saja (mock, tanpa kontrol akses) (FE/UI)
- [x] **Y7** Vendor Marketplace mock `/vendors` (6 vendor contoh, kontak → toast demo) + link dari panel analisis (FE/UI)
- [x] **Y8** Paket & Tagihan mock di Pengaturan (Gratis ⇄ Plus, tersimpan di sesi) (FE/UI)
- [x] **Y9** Code-splitting: route React.lazy + jsPDF dynamic import — bundle utama 658→214 kB (FE)
