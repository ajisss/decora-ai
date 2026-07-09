# Decor-AI — UI Design Plan

The Figma-ready layer of the documentation set. `plan.md` = scope, `ux-spec.md` = behavior, `wireflow.md` = flows; this document = what to draw, with what tokens, at what sizes, in what file structure. Section references (§) point into `ux-spec.md`; edge/flow references (G1, A1…) into `wireflow.md`.

Ground rule: the design system **already exists in code** (`tailwind.config.js`, `index.css`, the landing page). Figma mirrors code, not the other way around. Where this document says "exists," design by extracting from the live landing page, not by reinterpreting.

---

## 1. Design Tokens

Create these as Figma Variables (one collection, `Default` mode only — no dark mode in MVP).

### 1.1 Color

| Variable | Hex | Status | Usage |
|---|---|---|---|
| `color/ink` | `#1a1815` | exists | primary text, icons, toast bg |
| `color/ink-soft` | `#4a463f` | exists | secondary text, ghost-button labels |
| `color/ink-muted` | `#78726a` | exists | tertiary text, placeholders, timestamps, helper text |
| `color/paper` | `#ffffff` | exists | page bg, cards, inputs |
| `color/paper-soft` | `#faf9f7` | exists | recessed panels, hover fills, skeletons, image placeholders |
| `color/paper-line` | `#ece8e2` | exists | ALL borders and dividers — there is no second border color |
| `color/clay` | `#c05f3c` | exists | the single accent: primary buttons, active states, focus rings, progress, selected borders |
| `color/clay-soft` | `#f6e9e3` | exists | selected chip fill, active tab fill, highlight pulse |
| `color/clay-deep` | `#9c4a2d` | exists | primary hover, selected chip text |
| `color/danger` | `#b3423a` | **new** | destructive buttons, error text/borders |
| `color/danger-soft` | `#f9e9e7` | **new** | error wells and surfaces |
| `color/success` | `#3d7a55` | **new** | confirmation checks and toast icons only — never buttons, never large surfaces |
| `color/overlay` | `ink @ 40%` | new (derived) | dialog scrim; lightbox uses ink @ 90%; panel dim uses ink @ 20% |

Discipline notes for the designer:
- Clay is the *only* accent. If a mockup needs a second accent color, the mockup is wrong.
- Success green appears only as small glyphs/icons ("View checklist ✓", toast check). No green buttons, banners, or fills.
- Alpha variants (`clay/40` focus ring, `ink/20` hover borders) are derived in Figma via opacity, not new hex values.

### 1.2 Typography

Families: **Fraunces** (display) and **Inter** (everything else). Both on Google Fonts — available in Figma directly.

| Style token | Font / size / weight / line-height | Usage |
|---|---|---|
| `type/display-xl` | Fraunces 30/38 SemiBold | page titles (Projects, wizard title) |
| `type/display-lg` | Fraunces 20/28 SemiBold | dialog titles, wizard section headings, empty-state headlines |
| `type/title` | Inter 16/24 SemiBold | card titles, panel headers |
| `type/body` | Inter 14/20 Regular | default body, inputs, buttons (SemiBold for buttons) |
| `type/body-medium` | Inter 14/20 Medium | checklist item names, field labels |
| `type/meta` | Inter 12/16 Regular | timestamps, helper text, counters — always `ink-muted` |
| `type/eyebrow` | Inter 12/16 SemiBold, uppercase, 0.18em tracking | exists on landing; clay for marketing eyebrows, ink-muted for in-app category headers (§8.2) |

Fraunces never appears inside components, buttons, or body copy (§1.2 of ux-spec). If a text layer is smaller than 20px, it's Inter.

### 1.3 Radius

| Token | Value | Usage |
|---|---|---|
| `radius/pill` | 999 | buttons, chips, toasts-ish (toast uses xl2), segmented controls |
| `radius/xl2` | 20 | cards, panels, dialogs, feed entries |
| `radius/lg` | 8 | inputs, textareas, images inside cards, dropdown menus |
| `radius/sm` | 6 | checkboxes, small thumbnails, swatches |

### 1.4 Elevation

| Token | Value | Usage |
|---|---|---|
| `shadow/none` | — | ALL static cards (they use `paper-line` border instead) |
| `shadow/float` | 0 8px 24px ink@8%, 0 2px 8px ink@6% | dropdowns, popovers, toasts |
| `shadow/overlay` | 0 16px 48px ink@16% | dialogs, slide-over panel |

Flat, line-based system. A shadowed static card in a mockup is a bug.

---

## 2. Spacing & Layout System

### 2.1 Spacing scale

4px grid. Named steps (map to Tailwind):

| Token | px | Typical use |
|---|---|---|
| `space/1` | 4 | icon-to-label gaps, chip inner tweaks |
| `space/2` | 8 | between related meta lines, chip gaps |
| `space/3` | 12 | input padding-y, small card padding |
| `space/4` | 16 | default component padding, grid gutters (mobile) |
| `space/6` | 24 | card padding, section gaps within a group, page padding (mobile) |
| `space/8` | 32 | wizard group gaps, page padding (desktop), region separation |
| `space/12` | 48 | page-title-to-content, empty-state vertical rhythm |

Component internals use 1–4; layout composition uses 6–12. When unsure between two steps, take the smaller inside components and the larger between regions.

### 2.2 Layout grids (per shell)

| Context | Grid |
|---|---|
| Marketing (`/`) | exists — 72rem (1152) max content, 24/32 side padding |
| App shell pages (Library, Wizard) | 12-col, 24px gutter, max 1152; Wizard content constrained to 640 centered on top of it |
| Studio | not a column grid — a **region layout**: sidebar 48 / feed flexible (content max 720 centered) / right panel 320. Bottom bar spans feed width |

### 2.3 Fixed dimensions reference

| Element | Size |
|---|---|
| App shell top bar | height 56, sticky |
| Studio icon sidebar | width 48; icons 20 in 36 hit areas |
| Studio right panel | width 320 |
| Analyze slide-over | width 420 (desktop); 90vh bottom sheet (mobile) |
| Dialog | max-width 480 |
| Feed entry image | 4:3, max width 720 |
| Library card thumbnail | 4:3 |
| Buttons | height 44 (px-6 py-3 existing); quiet/icon buttons 36 |
| Inputs | height 40; textarea min 40, max 6 lines |
| Checkbox | 20, radius/sm |
| Toast | max-width 400, bottom-center offset 24 |

---

## 3. Screen Inventory

Every frame the designer must produce, with its states (from wireflow §8 coverage matrix). Desktop-first (1440 frame), plus the mobile frames listed in §5.

| # | Frame | States to design | Priority |
|---|---|---|---|
| 01 | Landing (exists) | CTA relabel only — 1 frame showing nav/hero deltas | P1 |
| 02 | Project Library | populated · empty · loading (skeletons) · degraded banner · card hover · card menu open · rename inline · delete dialog | P0 |
| 03 | Wizard — Form | default (blank+defaults) · prefilled (teaser notice) · validation error (theme missing) · reference image added · reference image error | P0 |
| 04 | Wizard — Prompt Preview | compiled · hand-edited + recompile banner · generate loading | P0 |
| 05 | Studio — feed | empty feed · pending entry (0:12 elapsed) · pending >30s (patience line) · done entry · done entry analyzed ("View checklist ✓") · error entry ×3 (connectivity / policy / cap) · image-missing entry (P6) | P0 |
| 06 | Studio — chrome | bottom bar idle · locked (generating) · with reference chip · right panel Setup tab · History tab · sync indicator states | P0 |
| 07 | Lightbox | default with caption bar + actions | P1 |
| 08 | Analyze panel | not-analyzed · analyzing (skeleton) · result · result with row menu open · row edit mode · zero-items · error · re-analyze confirm popover | P0 |
| 09 | Export dialog | PDF preselected (analysis exists) · PNG preselected + no-checklist note · preparing · inline error | P1 |
| 10 | PDF brief template | 1-page layout per §9.3 (design at A4, it's a print artifact not a screen) | P1 |
| 11 | Fallbacks | project not-found · 404 | P2 |
| 12 | Toasts | confirmation · undo-delete · sync-retry | P0 (component sheet, not full frames) |

Count: ~40 desktop frames + ~10 mobile frames (§5). Sequence for design: 05 → 08 → 03/04 → 02 → 09 → rest. Studio feed is the product's center of gravity and settles the visual language for everything else.

---

## 4. Layout Hierarchy (per screen)

Auto-layout skeletons — nesting order for Figma frames. Indentation = containment.

### 02 Library
```
AppShell (vertical, fill)
├── TopBar (56, horizontal, space-between)
│   ├── Wordmark + Breadcrumb "Projects"
│   └── SyncIndicator (conditional)
└── Page (vertical, max 1152 centered, pad 32, gap 48)
    ├── PageHeader (horizontal, space-between)
    │   ├── display-xl "Projects"
    │   └── Button/primary "New project"
    └── ProjectGrid (grid 3col, gap 24)
        ├── NewProjectTile (dashed)
        └── ProjectCard × n
            ├── Thumbnail (4:3, radius/lg)
            └── CardBody (pad 16, gap 4)
                ├── row: title + CardMenu trigger
                └── meta "{n} designs · Updated 2h ago"
```

### 03 Wizard — Form
```
AppShell
└── Page (640 centered, pad-y 48, gap 32)
    ├── Header (gap 8): display-xl + meta subline
    ├── Field: project name
    ├── FieldGroup "The wedding" (gap 24, divider below)
    │   ├── ChipGroup Theme (label + chips wrap, gap 8)
    │   └── ChipGroup Style
    ├── FieldGroup "The venue"
    │   ├── ChipGroup Venue type
    │   ├── SegmentedControl Venue size
    │   └── StepperInput Guest capacity
    ├── FieldGroup "The look"
    │   ├── SegmentedControl Budget (+ helper meta)
    │   ├── PalettePicker (swatch chips + custom)
    │   ├── Textarea Notes (+ counter)
    │   └── ReferenceImageInput (exists)
    └── StickyFooter (paper, top border, pad 16)
        ├── Button/quiet "Cancel"
        └── Button/primary "Preview prompt →"
```

### 05 Studio
```
AppShell
└── Workspace (horizontal, fill height)
    ├── IconSidebar (48, vertical, pad-y 16, gap 8)
    ├── FeedColumn (fill, vertical)
    │   ├── Feed (scroll, pad 24, gap 16, content max 720 centered)
    │   │   └── GenerationEntry × n  →  see component spec §6
    │   └── BottomBar (sticky, paper, top border, pad 12, horizontal gap 8)
    │       ├── ReferenceChip (conditional)
    │       ├── Textarea (fill, 1→3 lines)
    │       └── Button/primary sparkle "Generate"
    └── RightPanel (320, border-left, vertical)
        ├── Tabs [Setup | History]
        └── TabContent (scroll, pad 16)
```

### 08 Analyze panel
```
SlideOver (420, right, shadow/overlay)
├── Header (pad 16, border-bottom): title + "Design {n}" meta + ✕
├── ImageStrip (16:9 crop thumbnail)
├── Body (scroll, pad 16, gap 24)
│   └── ChecklistGroup × n (gap 8)
│       ├── CategoryHeader (eyebrow ink-muted + count)
│       └── ChecklistItem × n  →  see §6
└── Footer (sticky, pad 16, border-top, horizontal space-between)
    ├── Button/quiet "＋ Add item"
    └── group: Button/ghost "Re-analyze" + Button/primary "Export brief →"
```

Other screens follow directly from ux-spec §5–§9; the four above establish every layout pattern the rest reuse.

---

## 5. Responsive Behavior

Design breakpoints = Tailwind's: 640 / 768 / 1024. Frames to produce: **1440 (primary)** and **390 (mobile)** for the golden-path screens only (Library, Wizard Form, Studio feed, Analyze sheet, Export sheet). 768–1023 behavior is described, not drawn — it's derivable.

| Region | 390 frame shows | Notes |
|---|---|---|
| Library | 1-col grid, full-width cards | menu always visible (no hover on touch) |
| Wizard | 24px side padding, sticky footer with safe-area | chips wrap naturally; no layout change |
| Studio | no sidebar; feed full-width; bottom bar with icon-only Generate; panel toggle at top | right panel = existing mobile bottom-sheet pattern |
| Analyze | bottom sheet 90vh, drag handle, image thumb in header | §3.3 |
| Export | full-width bottom sheet, option cards stacked | §11 |

Touch adjustments (design into the 390 frames, per §12): hit areas ≥ 40, hover-reveal row menus become persistent icons, tooltips don't exist.

Mobile is *supported, not optimized* (plan.md cut list) — do not design mobile-specific features or navigation patterns beyond this table.

---

## 6. Reusable Component Library

Figma components with variant properties. Build these **before** screen frames — screens are assemblies. States marked (all) mean: default / hover / active / focus-visible / disabled, per §3.1–3.2.

### 6.1 Primitives (`ui/`)

| Component | Variants / properties | Spec |
|---|---|---|
| `Button` | variant: primary · ghost · quiet · destructive · icon; state: (all) + loading; size: default(44) · compact(36); icon: boolean, position | §3.1 — loading keeps the label |
| `Input` | type: text · textarea · number-stepper; state: (all) + error; label, helper, counter: booleans | §3.2 — label always above, error clears on change |
| `Chip` | mode: single · multi; state: default · hover · selected · focus · disabled; content: label · swatch-pair+label · custom(+input) | §3.2, §6.1 |
| `SegmentedControl` | 2–4 segments, sliding thumb | §6.4 |
| `Checkbox` | checked · unchecked · focus; round, clay fill | §8.2 |
| `Dialog` | shell only: title, body slot, footer slot | §3.3 |
| `SlideOver` | desktop 420 · mobile sheet | §3.3 |
| `DropdownMenu` | item: default · destructive · divider | §5.2 |
| `ConfirmPopover` | text + two buttons, anchored | §8.2 re-analyze |
| `Toast` | type: confirm · with-action(Undo) · sync-error | §3.4 |
| `Skeleton` | shape: card · text-line · checklist-row · image-block | §3.5 |
| `Tooltip` | right · top; 300ms delay note | §7.1 |
| `Banner` | inline page-level: info · degraded(sync) | §5.3 |

### 6.2 Product components

| Component | Variants | Spec |
|---|---|---|
| `AppShell/TopBar` | breadcrumb depth 1 · 2; with/without SyncIndicator | §2.2 |
| `SyncIndicator` | saving · saved(fading) · not-synced(danger, clickable) | §3.6 |
| `ProjectCard` | default · hover · rename-editing · broken-thumb · menu-open | §5.2, P6 |
| `NewProjectTile` | default · hover | §5.1 |
| `FieldGroup` | header + divider wrapper | §6.1 |
| `PalettePicker` | swatch chip: default · selected · custom-input open; max-3 note state | §6.1 |
| `PromptPreview` | compiled · edited+banner | §6.3 |
| `GenerationEntry` | **status: pending · pending-long · done · done-analyzed · error-connectivity · error-policy · error-cap · image-missing**; promptExpanded: boolean; hasNote: boolean | §7.2 — the most important component in the file; design it first |
| `BottomBar` | idle · locked · with-reference-chip | §7.1 |
| `ReferenceChip` | thumb + label + remove | §5.1 wireflow |
| `RightPanel` | tab: setup · history; collapsed | §7.4 |
| `HistoryRow` | default · hover · active-flash | §7.4 |
| `ChecklistGroup` | header + rows | §8.2 |
| `ChecklistItem` | checked · unchecked(dimmed 45%) · editing · with-note · manual(removable) · menu-visible | §8.2 — no strikethrough on unchecked |
| `AddItemRow` | collapsed · category-select open · editing | §8.2 |
| `OptionCard` (export) | selected · unselected · with-note(no-checklist) | §9.1 |
| `EmptyState` | illustration slot + headline + body + CTA; contexts: library · feed · zero-items · not-found | §5.3, §7.3, §8.3, §10.3 |
| `Lightbox` | with caption bar + action icons | §7.5 |

### 6.3 Icons

Extend the existing inline set (`src/components/icons.jsx`): 20px, 1.5 stroke, rounded caps. New glyphs needed: folder, duplicate, trash, download, file-pdf, checklist, sparkle, image-reference, pencil, comment, plus, chevron-down/right, close, warning-triangle, check-circle, external, drag-handle. Draw on a 20 grid; export as the same inline-SVG style, not an icon-font.

---

## 7. Figma File Structure

One file: **"Decor-AI — Product"**. Pages in this order:

| Page | Contents |
|---|---|
| `📖 Cover & Docs` | links to plan.md / ux-spec.md / wireflow.md, changelog, status legend (🟢 ready for dev · 🟡 in progress · 🔴 exploration) |
| `🎨 Foundations` | variables sheet: color swatches with usage notes, type ramp, radius, elevation, spacing scale — all as visible reference frames |
| `🧩 UI Primitives` | §6.1 components, every variant laid out in state grids |
| `🧩 Product Components` | §6.2, same treatment; `GenerationEntry` gets its own section with all 8 status variants side by side |
| `🖥 02 Library` | desktop frames, all states from §3 inventory |
| `🖥 03–04 Wizard` | form + preview states |
| `🖥 05–07 Studio` | feed states, chrome, lightbox — plus one "assembled" frame per golden-path step for flow review |
| `🖥 08 Analyze` | panel states over a dimmed studio context frame |
| `🖥 09–10 Export & PDF` | dialog states + A4 brief template |
| `🖥 11–12 Fallbacks & Toasts` | not-found, 404, toast sheet |
| `📱 Mobile` | the 390 golden-path frames (§5) |
| `🔗 Prototype` | wired golden path (journey 4.1 from wireflow) for stakeholder walkthrough — links between existing frames, no new art |
| `🗄 Archive` | explorations move here, never deleted in place |

Conventions:
- Frame naming: `{screen}/{state}` — e.g. `studio/feed-error-cap`, matching the §3 inventory so QA can diff against the coverage matrix.
- Every dev-ready frame gets a 🟢 in its section header; engineers build only from 🟢.
- Component descriptions in Figma link the ux-spec § anchor (paste the section reference — e.g. "see ux-spec §7.2").

---

## 8. Design Sequence & Definition of Done

Recommended order (mirrors build risk, not document order):

1. **Foundations + Primitives** (0.5 day) — mostly extraction from the live landing page.
2. **GenerationEntry, all 8 variants** (0.5 day) — settles card language, image treatment, error tone for the entire app.
3. **Studio assembly** (1 day) — feed + chrome + bottom bar; validate the 720 content width against real 4:3 images.
4. **Analyze panel** (0.5 day) — checklist row density is the hardest readability problem in the app; test with 15+ items.
5. **Wizard** (1 day) — chips/palette picker; test the form at its longest (custom theme + custom palette + full notes).
6. **Library, Export, PDF, fallbacks, mobile, prototype** (1.5 days).

~5 design-days total, deliberately parallel to engineering week 1 (backend + wiring need no finished UI).

A frame is **done** when: it uses only tokens from §1 (no detached fills), every state in its §3 inventory row exists, its components come from the library pages (no local one-offs), copy comes from ux-spec (placeholder-English, final intent), and it's marked 🟢 with a spec reference. The wireflow §8 coverage matrix is the final audit: every ✓ cell must map to a named frame.
