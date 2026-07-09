# Decor-AI — UX Specification

Companion to `plan.md`. That document defines *what* we build and why; this one defines *how every screen behaves* — down to states, validation, motion, and copy rules — so a designer can go straight to Figma and an engineer can build without guessing.

Scope: the 4-screen MVP (Landing → Project Library → Wizard → Studio, with Analyze panel and Export dialog). Nothing here redesigns the product vision.

---

## 1. Design Foundations

These already exist in code (`tailwind.config.js`, `index.css`). The spec references them by token name; do not invent parallel values in Figma.

### 1.1 Tokens

| Token | Value | Use |
|---|---|---|
| `ink` | `#1a1815` | Primary text, icons |
| `ink-soft` | `#4a463f` | Secondary text, ghost-button labels |
| `ink-muted` | `#78726a` | Tertiary text, placeholders, timestamps, helper text |
| `paper` | `#ffffff` | Page and card backgrounds |
| `paper-soft` | `#faf9f7` | Recessed surfaces: panels, wells, hover fills |
| `paper-line` | `#ece8e2` | All borders and dividers |
| `clay` | `#c05f3c` | Single accent: primary buttons, active states, links, focus rings, progress |
| `clay-soft` | `#f6e9e3` | Accent tint: selected chips, active tab fills, info surfaces |
| `clay-deep` | `#9c4a2d` | Primary button hover |

Semantic additions needed for MVP (extend Tailwind config, don't hardcode):

| Token | Suggested value | Use |
|---|---|---|
| `danger` | `#b3423a` | Destructive actions, error text/borders |
| `danger-soft` | `#f9e9e7` | Error surface fills |
| `success` | `#3d7a55` | Success confirmations only (checkmarks, toast icon) |

No dark mode in MVP. The product is light-theme by identity (matches landing).

### 1.2 Typography

- **Display (`Fraunces`)**: page titles, wizard section headings, empty-state headlines only. Never in components, buttons, or body copy.
- **Sans (`Inter`)**: everything else.
- Scale (Tailwind defaults): page title `text-3xl`/display; section heading `text-xl`/display; card title `text-base` semibold; body `text-sm`; meta/helper `text-xs` in `ink-muted`.
- Line length in prose blocks (empty states, helper text): max ~60ch.

### 1.3 Spacing, radius, elevation

- Spacing on the 4px grid; component padding steps: 12 / 16 / 24 / 32.
- Radius: pills (`rounded-full`) for buttons and chips — already the house style; cards and panels `rounded-xl2` (20px); inputs `rounded-lg` (8px); images inside cards `rounded-lg`.
- Elevation: this is a flat, line-based system. Default cards use `border-paper-line`, **no shadow**. Shadows appear only on floating layers: dropdown menus, dialogs, slide-over panel, toasts (`shadow-lg`, soft and neutral). Never shadow a static card.

### 1.4 Motion

| Pattern | Spec |
|---|---|
| Hover/press transitions | `transition-colors`, 150ms, ease-out (matches existing buttons) |
| Panel slide-over (Analyze) | 240ms ease-out translate-x; overlay fade 200ms |
| Dialog (Export, confirms) | 160ms scale from 0.98 + fade |
| Feed entry insertion | 200ms fade + 8px translate-y; **only** the new entry animates, the feed must not reflow-jump |
| Skeletons | subtle pulse (`animate-pulse`), `paper-soft` on `paper` |
| Progress on generation | indeterminate shimmer bar + elapsed-time counter (see §6.4) |
| Reduced motion | all of the above collapse to instant/opacity-only under `prefers-reduced-motion` |

Nothing bounces. No spring physics. Motion communicates state change, never delight for its own sake.

### 1.5 Iconography

Continue the existing inline SVG set (`src/components/icons.jsx`): 1.5px stroke, rounded caps, 20px default. New icons needed: folder (library), duplicate, trash, download, file-pdf, checklist, sparkle (generate), image-reference, pencil, plus, chevron, close, warning-triangle, check-circle, external. Match stroke weight exactly.

---

## 2. Information Architecture & Navigation

### 2.1 Route map

```
/                      Landing (marketing; exists)
/projects              Project Library
/projects/new          Guided Wizard (form → prompt preview, same route)
/studio/:projectId     Studio workspace
  ?gen=:generationId     deep-link/selection state (optional)
  Analyze panel          overlay state, not a route
  Export dialog          overlay state, not a route
404 fallback           any unknown route or missing projectId
```

Overlays (panel, dialogs, lightbox) are UI state, not routes — Back button must exit the overlay if one is open (intercept popstate for the Analyze panel and lightbox; dialogs may simply close on Escape/back).

### 2.2 App shell

Two shells:

1. **Marketing shell** (`/`): existing `Nav` + `Footer`. One change — primary nav CTA label becomes **"Open Studio"**, routing to `/projects` if ≥1 project exists in localStorage, else `/projects/new`.
2. **App shell** (`/projects`, `/projects/new`, `/studio/*`): slim top bar, no footer.
   - Left: wordmark (→ `/`), then breadcrumb: `Projects` / `{Project name}`. Breadcrumb segments are links.
   - Right: nothing in MVP (no account). Do not add placeholder avatar UI — it promises auth that doesn't exist.
   - Height 56px, `paper` background, `paper-line` bottom border. Sticky.

Studio keeps its internal icon sidebar (existing) *inside* the app shell; the sidebar is workspace navigation (feed / setup / history focus), not app navigation.

### 2.3 Navigation rules

- Creating a project (wizard → Generate) uses `navigate(..., { replace: false })` so Back from Studio returns to the wizard preview — but the wizard must then show the *completed* form, not a blank one (state restored from the just-created project).
- Deleting the currently-open project navigates to `/projects` with a toast.
- Unknown `projectId` → full-screen "Project not found" state (§10.3), never a blank studio.

---

## 3. Global Patterns

Defined once here; screens reference them.

### 3.1 Buttons

| Variant | Style | Use |
|---|---|---|
| Primary | existing `.btn-primary` (clay pill) | One per view region max. Generate, Export confirm, wizard Continue |
| Ghost | existing `.btn-ghost` | Secondary actions |
| Quiet | text-only, `ink-soft`, hover `ink` + `paper-soft` fill, pill | Inline actions on cards/list rows (Rename, Duplicate) |
| Destructive | quiet variant in `danger`; in dialogs, filled `danger` pill | Delete only |
| Icon button | 36px hit area, 20px icon, pill hover fill | Panel close, lightbox controls, card overflow menu |

Button states — all variants must define: default, hover, active (pressed, slightly darker), focus-visible (2px `clay/40` ring, offset 2 — exists), disabled (50% opacity + `cursor-not-allowed`; **never remove a button while loading, disable it**), loading (spinner replaces icon, label persists: "Generating…" not a bare spinner).

### 3.2 Inputs

- Text/textarea: `paper` bg, `paper-line` border, `rounded-lg`, 40px height (textarea auto-grow to 6 lines max), focus = `clay` border + ring. Placeholder in `ink-muted`.
- Error state: `danger` border + 12px helper line below in `danger`, icon-prefixed. Error clears on input change, not on blur.
- Labels: `text-sm` medium, always visible above the field. **No floating labels, no placeholder-as-label.**
- Optional fields marked "(optional)" in `ink-muted` after the label. Required fields are *not* starred — with only 2 required fields (Theme, Venue Type), marking the optional majority is clearer.
- Chips (select-one / select-many): pill, `paper-line` border; selected = `clay-soft` fill + `clay` border + `clay-deep` text. Selection togglable by click and Space/Enter. Chip groups are radiogroup/group with arrow-key roving focus.

### 3.3 Overlays

- **Dialog** (Export, delete confirm): centered, max-w 480px, `rounded-xl2`, overlay `ink/40`. Focus-trapped; initial focus on the least destructive action. Escape and overlay-click close (except mid-download nothing blocks). Title in display font, `text-lg`.
- **Slide-over panel** (Analyze): right-anchored, width 420px desktop (full-width sheet on <768px, 90vh bottom sheet). Focus-trapped. Escape closes. Underlying studio dimmed `ink/20` but *visible* — the user must keep seeing the image being analyzed on desktop; on mobile the sheet header shows the image thumbnail instead.
- **Lightbox** (exists): full-screen `ink/90`, image centered, close on Escape/overlay click. Add: download-PNG icon button and generation prompt caption at bottom.
- Only one overlay layer at a time. Export dialog opened from within Analyze panel closes the panel first? **No** — Export is only launched from feed entries and lightbox, never from inside Analyze (keeps stacking rules trivial).

### 3.4 Toasts

- Bottom-center, max 1 visible (queue replaces), 4s auto-dismiss, dismissible by click. `ink` background, `paper` text, pill-ish `rounded-xl2`.
- Use for: non-blocking confirmations ("Project duplicated", "Brief downloaded", "Project deleted" with **Undo** — see §5.4) and background-save failures ("Couldn't sync — retrying").
- Never use toasts for errors that block the user's current task — those render in place (feed entry error, form error, panel error).

### 3.5 Loading vocabulary

Three loading patterns, used consistently:

1. **Skeletons** — for *content that will appear in place*: project cards on library load, checklist rows during analysis. Shaped like the real content.
2. **Progress entry** — for *generation*: the feed entry itself is the loading UI (§6.4). Never a full-screen spinner.
3. **Button spinners** — for *short mutations* (<2s expected): duplicating, saving setup.

Rule: no full-page spinners anywhere. The shell always renders instantly; only content regions load.

### 3.6 Save model (visible behavior)

All edits (project name, checklist, setup) save automatically — localStorage instantly, backend debounced 1s. There is **no Save button** anywhere except the wizard's Generate.
- Indicator: tiny "Saved" / "Saving…" text in the app-shell breadcrumb area, `text-xs ink-muted`, fading in/out. Shown only while a sync is pending or within 1.5s after; never permanently visible.
- Sync failure: indicator becomes "Not synced" in `danger` with a retry-on-click; local edits are never lost, and copy must say so on hover ("Changes are saved on this device; retrying server sync").

### 3.7 Destructive-action rule

Delete (project) always confirms via dialog: title "Delete '{name}'?", body "This removes the project and its {n} generated designs. This can't be undone.", buttons Cancel (focused) / Delete (filled danger). After deletion, toast with 6s **Undo** (undo restores from an in-memory copy; if the toast expires, backend delete is committed — actual API delete is deferred until toast expiry).
Checklist item removal and generation "hide" are not destructive-confirm — they're inline and undoable by re-adding; MVP does not delete generations at all (versions are the history; hiding/deleting generations is P2).

---

## 4. Screen: Landing (`/`)

Exists; changes only.

- Primary hero CTA → routes per §2.2 rule (Studio-aware).
- `GeneratorTeaser`: keeps quick-prompt input; submitting now routes to `/projects/new` with the free text pre-filled into the wizard's **Additional notes** field and a one-line notice at the top of the wizard: "We started your project from your idea — add a few details for a better result." Rationale: the teaser must not bypass the wizard (the wizard *is* the product thesis), but typed effort must not be discarded.
- No other landing changes in MVP.

---

## 5. Screen: Project Library (`/projects`)

### 5.1 Layout

- App shell + page header: title "Projects" (display), right-aligned primary button **"New project"**.
- Responsive card grid: 1 col <640, 2 cols <1024, 3 cols ≥1024. Card = thumbnail (4:3, latest done generation; `paper-soft` + image icon if none), name (semibold, single line, truncate), meta line "{n} designs · Updated {relative time}", overflow menu (⋯ icon button).
- First card position is a dashed-border "New project" tile (plus icon + label) — in addition to the header button; both do the same thing.

### 5.2 Card interactions

- Whole card clickable → `/studio/:id`. Hover: border darkens to `ink/20` + thumbnail scales 1.02 (200ms). Card is a single `<a>`; menu button stops propagation.
- Overflow menu (dropdown, shadow-lg): **Rename**, **Duplicate**, divider, **Delete** (danger).
  - Rename: name becomes an inline input in place, pre-selected text, Enter/blur commits, Escape reverts. Empty name reverts silently to previous.
  - Duplicate: button-spinner on the menu item ≤ instant; new card appears beside the original named "{name} (copy)", brief highlight pulse (`clay-soft` background fading over 800ms). Duplicates setup + generations (images referenced, not re-generated) but **not** running state.
  - Delete: per §3.7.

### 5.3 States

| State | Behavior |
|---|---|
| Loading | 3 skeleton cards (thumbnail + two text lines). Hydrates from localStorage instantly in practice; skeletons cover the backend-merge case |
| Empty | No grid. Centered empty state: illustration slot (simple line drawing), display headline "Start your first design", one line "Answer a few questions about the wedding — we'll generate the concept.", primary button "New project". This is most users' true entry screen; give it real design attention |
| Error (backend unreachable, local projects exist) | Grid renders from localStorage + non-blocking banner under the header: "Showing designs saved on this device. Server sync unavailable." with Retry link. Images that live only server-side show a broken-image placeholder tile with a retry-on-click |
| Error (backend unreachable, no local data) | Same as Empty plus the banner. Never a dead-end error page |

### 5.4 Sorting & scale

Sorted by `updatedAt` desc. No search/filter/pagination in MVP (validated at <30 projects). If a user exceeds ~24 projects, that's a good problem; do not build for it now.

---

## 6. Screen: Guided Wizard (`/projects/new`)

One route, two sequential views: **Form** → **Prompt Preview**. Not a multi-step wizard; the form is one scrollable page (per plan.md).

### 6.1 Form view — layout

- Max-width 640px, centered. Page title "Tell us about the wedding" (display) + subline "Only theme and venue are required — everything else makes the design better."
- Project name field at top, pre-filled `"Untitled wedding"` — auto-focus, text pre-selected so typing replaces it.
- Three visually grouped sections (heading + fields, separated by `paper-line` dividers, generous 32px gaps):

**The wedding**
- *Theme* (required): chip group, single-select — Rustic, Modern, Traditional, Garden, Glamorous, Bohemian, Minimalist, + "Custom…" chip that reveals a text input.
- *Style*: chip group, single-select — Romantic, Elegant, Playful, Dramatic, Natural. Optional.

**The venue**
- *Venue type* (required): chip group — Indoor ballroom, Garden / outdoor, Beach, Rooftop, Traditional hall, Tent / marquee, + Custom…
- *Venue size*: segmented control — Small / Medium / Large. Default Medium.
- *Guest capacity*: number input with +/– steppers, step 50, default 200, min 10, max 5000. Free typing allowed; clamp on blur with helper note if clamped.

**The look**
- *Budget tier*: segmented control — Economy / Standard / Premium / Luxury. Default Standard. Helper text: "Sets how lavish the design looks." (manages expectation per plan.md Open Question 2).
- *Color palette*: multi-select swatch chips (8–10 curated wedding palettes as paired swatches, e.g. Gold + Sage, Blush + Ivory, Burgundy + Gold…) + "Custom" opening a small hex/color input that adds a swatch chip. Max 3 selections; selecting a 4th shows inline note "Up to 3 colors keeps the design cohesive" and doesn't select. Zero selections is valid (AI chooses).
- *Additional notes*: textarea, placeholder "Anything specific — e.g. lots of fairy lights, a floral arch, no red." 500-char limit with counter appearing at >400.
- *Reference image* (optional): existing `ReferenceImageInput` component. Accept jpg/png/webp ≤ 8MB. On file: thumbnail preview + remove (×). Errors inline under the dropzone: wrong type ("Use a JPG, PNG, or WebP image"), too large ("Keep it under 8 MB"). Drag-over state: `clay` dashed border + `clay-soft` fill.

- Sticky footer bar (within content column, `paper` + top border): right-aligned primary **"Preview prompt →"**, left-aligned quiet "Cancel" → `/projects` (or `/` if no projects).

### 6.2 Form validation

- Only Theme and Venue type block progression. Clicking "Preview prompt" with either missing: scroll to first invalid group (smooth, then focus first chip), group heading gets `danger` text + inline "Choose a theme to continue" under the chips. No toast, no summary box — with 2 possible errors, inline is enough.
- All values persist in sessionStorage on change; refresh mid-form restores everything including the reference image (object URL re-created from IndexedDB blob — or simplest acceptable: image is lost on refresh, dropzone shows note "Re-add your reference image"; **decide with eng, prefer the simple path** and note it in the dropzone only when restoration actually failed).

### 6.3 Prompt Preview view

- Same route; form slides out left / preview slides in right (200ms; instant under reduced motion). Back link top-left: "← Edit details" restores the form with values intact (scroll position too).
- Content: eyebrow "Your generation prompt", the compiled prompt in a textarea (auto-height, editable, monospace **no** — keep Inter, this is natural language), reference thumbnail beside it if present, and a `ink-muted` note: "Feel free to tweak the wording. Your answers above are already baked in."
- If the user edits the prompt and *then* goes back and changes form fields, show a choice on returning to preview: keep manual edits or recompile — banner above the textarea: "You edited this prompt by hand. **Recompile from your answers** or keep your version." Recompile link replaces the text. (Silent overwrite of hand edits is the one unforgivable behavior here.)
- Primary button: **"Generate design ✦"** (sparkle icon). On click: create project (name, setup, prompt), navigate to `/studio/:id` with autorun (mechanism exists). Button enters loading state during project creation (<500ms) — the *generation* loading happens in Studio, not here.
- Creation failure (backend down): project is still created locally; proceed to Studio regardless (generation itself will surface the connectivity error in the feed entry). Never trap the user on this screen.

### 6.4 Micro-interactions

- Chip select: 120ms background fade; no scale.
- Segmented control: sliding `paper` thumb, 150ms.
- Guest capacity steppers: press-and-hold accelerates after 600ms.
- The "Preview prompt" button subtly enables state: it's *always* enabled (validation on click, per §6.2) — disabled-until-valid punishes users for exploring top-to-bottom.

---

## 7. Screen: Studio (`/studio/:projectId`)

Existing layout retained: left icon sidebar, center feed, bottom prompt bar, right panel. This section specs the real-data behavior.

### 7.1 Regions

- **Icon sidebar** (48px): Feed (default), Setup, History — these switch the right panel tab and/or scroll focus; Feed icon scrolls feed to top. Bottom of sidebar: back-to-projects icon (folder). Tooltips on hover (300ms delay, right-side).
- **Feed** (center, scrollable): generation entries newest-first. Max content width 720px centered.
- **Bottom bar** (sticky): modification textarea (1 line, grows to 3) + primary Generate button. Placeholder: "Describe what to change — or leave empty to run again". Char limit 300. `Cmd/Ctrl+Enter` submits. While a generation is pending, button label "Generating…" disabled — **one generation at a time** (queueing multiplies cost and confuses the feed; enforce in UI and server).
- **Right panel** (320px, collapsible; hidden <1024px behind the existing mobile toggle): tabs **Setup** | **History**.

### 7.2 Feed entry anatomy & states

Each entry is a card (`rounded-xl2`, `paper-line` border):

**Header row** — timestamp (relative, `text-xs ink-muted`, absolute on hover via title attr), version label "Design {n}" (n = 1-based, oldest = 1; stable forever), and status affordance.

**Pending state**
- Body: 4:3 shimmer block (`paper-soft` animated) + indeterminate clay progress bar + elapsed counter "Generating… 0:12". At 30s the line under it appears: "Complex designs can take up to a minute." At 90s treat as timeout → error state.
- The prompt being used is shown collapsed under the shimmer ("Prompt ▸" expander) so the user can re-read what they asked for while waiting.
- Entry inserts at top with §1.4 motion; feed auto-scrolls to top *only if* the user was already within 100px of top (never yank scroll from someone reading older versions).

**Done state**
- Image (4:3, `rounded-lg`, click → lightbox). Below: modification note if any, in a quote-styled line ("↳ make the backdrop taller"), then action row:
  - **Analyze** (ghost, checklist icon) — becomes "View checklist ✓" (with `success` check) once analysis exists.
  - **Export** (ghost, download icon).
  - **Use as reference** (quiet, P1): sets this image as the reference for the next generation; bottom bar shows a small thumbnail chip "Ref: Design {n} ×".
- Prompt expander ("Prompt ▸") collapsed by default.

**Error state**
- Body: `danger-soft` well with warning icon, message, and **Retry** ghost button. Messages map from server errors:
  - Connectivity/5xx: "We couldn't reach the design service. Your prompt is safe — try again."
  - OpenAI content policy: "This request was declined by the image service. Try rewording your notes." (retry keeps the entry, editing happens in bottom bar → new entry).
  - Daily cap hit: "You've reached today's design limit for this project ({n}). Come back tomorrow." No retry button — hide it; show the cap number.
- Retry re-runs the *same* prompt in the *same* entry (returns to pending); it does not create a new version number until it succeeds.

### 7.3 Feed empty state

Project with zero generations (possible via duplicate-then-clear edge or direct nav): centered in feed — "No designs yet. Generate your first one below ↓" pointing at the bottom bar. If arriving from the wizard, this state is never seen (autorun fires immediately).

### 7.4 Right panel

**Setup tab**: read-only definition list of wizard answers (label + value rows, palette shown as swatches). Footer link "Edit setup" → opens the wizard form pre-filled *for this project* (route `/projects/new?edit=:id` or inline — simplest: navigate to wizard in edit mode; on save, return to studio; changed setup affects *future* generations only, and the preview banner from §6.3 applies).
**History tab** (exists): compact list of generations (thumb, "Design {n}", time); click scrolls feed to that entry and flashes its border `clay` once (600ms).

### 7.5 Lightbox additions

Bottom caption bar: "Design {n} · {prompt, 1-line truncated}" + icon buttons: download PNG, open Analyze (closes lightbox, opens panel). Arrow keys navigate between done generations; ×/Escape/overlay closes.

---

## 8. Overlay: Analyze Panel

Slide-over per §3.3, attached to one generation.

### 8.1 First open (no analysis yet)

- Header: "Decoration checklist" + "Design {n}" subtitle + close ×. Image thumbnail (16:9 crop) pinned under header.
- Body: primary button centered "Analyze this design ✦" with cost-honest helper "Takes about 15 seconds." — analysis is **explicitly user-triggered**, not automatic on open (it costs an API call; the button also gives a beat to confirm the right design).
- On click: button → skeleton checklist (6 rows: checkbox circle + two-line text bars), grouped under 3 skeleton headers. Header shows "Analyzing…" with mini progress shimmer.

### 8.2 Result state

- Items grouped by category (fixed taxonomy order: Stage, Backdrop, Chairs, Tables, Flowers, Lighting, Walkway, Reception Desk, Ceiling Decoration, LED Screen, Other). Empty categories are omitted.
- Category header: name + count, `text-xs` uppercase tracking (eyebrow style, but `ink-muted` not clay).
- Item row: checkbox (round, `clay` when checked — checked = "included in brief", **default checked**), name (medium), description (`text-xs ink-muted`, 2-line clamp, expands on click), quantity chip if present ("~300"), and a hover-revealed row menu: edit (pencil), note (comment icon; note renders as indented `ink-muted` line once added), remove (× — only for manual items; detected items *uncheck* instead of delete, preserving the AI record).
- Unchecked items: 45% opacity, name struck? **No strikethrough** — just dimmed (strikethrough implies "wrong", unchecked means "not in my brief").
- Edit mode per row: name and quantity become inputs inline, Enter/blur commits.
- Footer (sticky): quiet "＋ Add item" (adds editable row at bottom of chosen category via small category select), ghost "Re-analyze" with confirm popover ("Replaces this checklist and any edits. Re-analyze?") since it costs a call *and* destroys edits, and primary "Export brief →" (opens Export dialog with this generation preselected — exception to §3.3 stacking: panel closes as dialog opens, one layer at a time).

### 8.3 States

| State | Behavior |
|---|---|
| Loading | §8.1 skeletons; panel not closable? — closable (Escape/×); analysis continues server-side and result lands on the generation; reopening shows result or still-loading |
| Error | In-body `danger-soft` well: "Couldn't analyze this design. Try again." + Retry. Panel stays open |
| Zero items detected (valid JSON, empty) | "We couldn't identify decoration items in this design. You can add items manually." + Add item affordance — never pretend-fail |
| Edits | every toggle/edit/add saves per §3.6; no save button |

---

## 9. Overlay: Export Dialog

### 9.1 Layout

Dialog per §3.3. Title "Export Design {n}". Two option cards side by side (stack <480px):

1. **Image (PNG)** — thumbnail icon, "The design image at full resolution."
2. **Vendor brief (PDF)** — file icon, "One page: design, wedding details, and checklist."

Cards are radio-select (border → `clay`, `clay-soft` fill); PDF preselected if analysis exists, PNG otherwise. Footer: quiet Cancel, primary **Download**.

### 9.2 Conditional states

- PDF card when analysis is missing: card enabled but shows inline note "No checklist yet — the brief will include design + details only. [Analyze first](→ closes dialog, opens Analyze panel)". Don't disable the card; a brief without a checklist is still useful.
- Download click: button loading state ("Preparing…") while jsPDF composes (<2s), then browser download + toast "Brief downloaded" / "Image downloaded". Dialog closes on success.
- PDF generation failure (image fetch fails offline): inline `danger` line in dialog "Couldn't fetch the design image. Check your connection and retry." Dialog stays open.
- Filenames: `{project-name-slug}-design-{n}.png` / `{project-name-slug}-brief-design-{n}.pdf`.

### 9.3 PDF brief content spec (for the template)

A4 portrait, single page: header (project name in display style + date + "Made with Decor-AI" small), image (max 60% height, centered, rounded corners flattened — print-safe), two-column details block (theme, style, venue, size, capacity, budget tier, palette swatches as filled squares + hex), checklist (included items only, grouped by category, checkbox squares pre-checked, per-item notes in italic, quantities right-aligned). If checklist overflows one page, allow page 2 for checklist continuation — never shrink below 9pt.

---

## 10. Cross-cutting States

### 10.1 Connectivity model

The app is local-first for *data*, server-dependent for *AI and images*:

| Offline/backend-down effect | Behavior |
|---|---|
| Browse library, open studio, edit checklists, rename | Works (localStorage); "Not synced" indicator per §3.6 |
| View images | Cached ones render (browser cache); uncached show placeholder tile with retry |
| Generate / Analyze | Fails into the entry/panel error states with connectivity copy |
| Export PNG/PDF | Works if image cached; else §9.2 failure line |

### 10.2 Multi-tab

Last-write-wins via storage events: a `storage` listener refreshes context from localStorage so two tabs don't diverge silently. Do not build conflict UI; note the behavior for QA.

### 10.3 Not-found & fallback

- `/studio/badId`: app shell + centered "This project doesn't exist or was deleted." + primary "Back to projects".
- Unknown route: same pattern, "Page not found".
- Missing image file for a done generation (server data loss): entry renders `paper-soft` tile "Image unavailable" + Retry (re-fetch) — the prompt and analysis remain usable.

### 10.4 First-run vs returning

- First visit, no projects: Landing CTA → wizard directly (skip the empty library — one less click on the golden path). `/projects` still reachable and shows its empty state.
- Returning: CTA → library.

---

## 11. Responsive Behavior

Breakpoints: base (<640), `sm` 640, `md` 768, `lg` 1024 — matches Tailwind defaults already in use.

| Region | <768 | 768–1023 | ≥1024 |
|---|---|---|---|
| App shell breadcrumb | project name only | full | full |
| Library grid | 1 col | 2 col | 3 col |
| Wizard | full-bleed padding 24px; sticky footer respects `env(safe-area-inset-bottom)` | 640px centered | 640px centered |
| Studio sidebar | hidden; actions fold into a top-of-feed row | icon sidebar | icon sidebar |
| Studio right panel | bottom-sheet toggle (existing mobile pattern) | toggleable overlay | persistent 320px |
| Analyze panel | full-height bottom sheet (90vh, drag-handle, swipe-down closes) | 420px slide-over | 420px slide-over |
| Export dialog | full-width sheet, options stacked | centered dialog | centered dialog |
| Bottom bar | full-width, textarea 1 line, generate icon-only button (sparkle) with visible disabled/loading state | full | full |

Mobile is *supported*, not optimized (per plan.md cut list): the golden path must work on a phone (WO showing a client), but dense features (History tab, Use-as-reference) may hide under the panel toggle.

---

## 12. Accessibility Requirements

- Full keyboard path through the golden journey: wizard (chips = roving tabindex groups), generate (`Cmd/Ctrl+Enter`), feed entries (cards focusable; Enter opens lightbox; action buttons in tab order), panel & dialogs (focus trap, Escape, focus returns to invoking element on close).
- Generation lifecycle announced via `aria-live="polite"` region: "Generating design 3…", "Design 3 ready", "Design 3 failed". Same for analysis and save-sync status.
- All images get alt text: `"Generated wedding decoration concept, design {n}: {theme}, {venueType}"`.
- Color: `ink-muted` on `paper` passes AA for small text (verify — it's borderline; if it fails, darken the token, don't add a new one). `clay` on white is accent/large-text only; button text is white-on-clay (passes). Checkbox/selected states never rely on color alone (checkmark glyph + border weight).
- Touch targets ≥ 40px on mobile (row menus become always-visible on touch devices — hover-reveal is desktop-only).
- `prefers-reduced-motion` per §1.4.

---

## 13. Copy Guidelines

- Language: **single language for MVP** — decision pending (plan.md Open Question 1). All strings stay in `content.js` (existing pattern) so the decision is a content swap, not a refactor. This spec's copy strings are English placeholders with final intent (tone, length), not throwaway lorem.
- Tone: calm, concrete, second person. No exclamation marks except zero. Never blame the user in errors; always state what's safe ("Your prompt is safe").
- AI honesty: never claim precision the system lacks — "~300" not "300"; "we identified" not "the design contains"; analysis intro line in panel: "AI-detected — edit anything that's off."
- Buttons are verb-first ("Generate design", "Download", "Analyze this design"); never "OK"/"Yes".
- Timestamps relative under 7 days ("2h ago"), date after ("Jun 30").

---

## 14. Component Inventory (build checklist)

New components, mapped to the folder structure in plan.md:

| Component | Location | Spec section |
|---|---|---|
| `AppShell`, `Breadcrumb`, `SyncIndicator` | `components/shell/` | §2.2, §3.6 |
| `ProjectCard`, `ProjectGrid`, `NewProjectTile`, `CardMenu` | `components/library/` | §5 |
| `ChipGroup`, `SegmentedControl`, `PalettePicker`, `StepperInput`, `FieldGroup` | `components/wizard/` | §6.1 |
| `PromptPreview` (with recompile banner) | `components/wizard/` | §6.3 |
| `GenerationEntry` (pending/done/error), `PromptExpander`, `ReferenceChip` | `components/generator/` | §7.2 |
| `BottomBar` | `components/generator/` | §7.1 |
| `AnalyzePanel`, `ChecklistGroup`, `ChecklistItem`, `AddItemRow` | `components/analyzer/` | §8 |
| `ExportDialog`, `OptionCard`, `buildBriefPdf` | `components/export/` | §9 |
| `Dialog`, `SlideOver`, `Toast`, `DropdownMenu`, `ConfirmPopover`, `Skeleton` | `components/ui/` | §3 |
| Existing, reused as-is | `ReferenceImageInput`, `ResultTile` (absorbed into `GenerationEntry`), lightbox, icons | — |

Figma file structure should mirror this table: one page per screen (§4–§9), one page for `ui/` primitives with all states laid out per §3, one page for tokens (§1).

---

## 15. Out of Scope (restating, so nobody designs them)

Dark mode; accounts/avatars; share links; item-level editing on the image; generation queueing; comparing two designs side-by-side; search/filter in library; mobile-optimized studio beyond §11; localization infrastructure beyond `content.js`. If a Figma frame includes any of these, it's scope creep — flag it against `plan.md`.
