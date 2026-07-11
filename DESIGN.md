---
name: Decora AI
description: Ketik dekorasi wedding impianmu, AI generate gambarnya dalam hitungan detik.
colors:
  clay: "#c05f3c"
  clay-soft: "#f6e9e3"
  clay-deep: "#9c4a2d"
  paper: "#ffffff"
  paper-soft: "#faf9f7"
  paper-line: "#ece8e2"
  ink: "#1a1815"
  ink-soft: "#4a463f"
  ink-muted: "#78726a"
  danger: "#b3423a"
  danger-soft: "#f9e9e7"
  success: "#3d7a55"
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(3rem, 6vw, 4.5rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(2.25rem, 4vw, 3rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Karla, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Karla, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Karla, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.18em"
rounded:
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1.25rem"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "32px"
  lg: "64px"
  xl: "96px"
  2xl: "128px"
components:
  button-primary:
    backgroundColor: "{colors.clay}"
    textColor: "#ffffff"
    rounded: "{rounded.full}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.clay-deep}"
  button-ghost:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
  card:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.lg}"
    padding: "28px"
  input:
    backgroundColor: "{colors.paper-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
---

# Design System: Decora AI

## 1. Overview

**Creative North Star: "The Artisan's Notebook"**

The token names already say the quiet part out loud: `ink`, `paper`, `clay`. This is a craftsman's workbench, not a SaaS dashboard — a decorator's notebook where you sketch a wish in ink on paper, and the accent color is the literal material (clay) the thing gets shaped from. Every design decision should read as *made by hand, for a specific occasion* — never as generated scaffolding.

The system is warm without being soft, and confident without being loud. It earns warmth through specificity — naming real adat elements correctly, writing in plain Indonesian, letting a single clay accent do all the emotional work — rather than through decoration, pastel gradients, or cutesy copy. It explicitly rejects three things: **generic SaaS template energy** (gradient blobs, stock-icon grids, hero-metric cards, an eyebrow label repeated above every section), **murahan wedding-site energy** (script fonts stacked everywhere, floral flourish, stock-photo couples), and **cold corporate minimalism** (restraint that strips out the romance of the occasion entirely).

**Key Characteristics:**
- One accent (clay) carries the entire emotional temperature — spent deliberately, never diluted across more colors
- Serif display (Fraunces) for anything aspirational or emotional; sans (Karla) for anything functional or instructional
- Flat, border-first surfaces at rest; shadow is reserved for things that visually overlap other things
- Pill-shaped interactive elements (buttons, chips, badges) against softly-rounded containers (cards, inputs) — two radii, used consistently by role

## 2. Colors

Warm off-white paper, near-black ink, and a single fired-clay accent — the palette of a physical notebook, not a screen.

### Primary
- **Fired Clay** (`#c05f3c` / `oklch(58% 0.13 39)`): the one accent. Primary CTAs, links-as-action, active/selected states, the small spark of color in an otherwise neutral page. Used deliberately and sparingly — if more than one element per view is fighting for attention in clay, that's a sign something else should recede.
- **Clay Wash** (`#f6e9e3`): the tint of clay diluted almost to nothing. Backgrounds for icon badges, "featured" pills, chip hover states — anywhere the accent needs to be present but quiet.
- **Burnt Clay** (`#9c4a2d`): clay pushed darker for hover/active states and for price/emphasis text that needs to read as accent-colored but still pass body-text contrast.

### Neutral
- **Pure Paper** (`#ffffff`): card and input surfaces, the "foreground" plane.
- **Warm Paper** (`#faf9f7`): page and section backgrounds, the "background" plane — one step warmer/duller than pure paper so cards visibly sit above the page without needing a shadow.
- **Paper Fold** (`#ece8e2`): hairline borders, dividers, the grout between stat cells. This is the entire elevation system at rest — a 1px fold line, not a shadow.
- **Wet Ink** (`#1a1815`): headline and primary text. Warm near-black, never pure `#000` — paper doesn't hold pure black ink.
- **Ink Wash** (`#4a463f`): body copy, secondary text at readable weight.
- **Faded Ink** (`#78726a`): captions, meta text, timestamps — the lightest text color permitted; still verify ≥4.5:1 against its actual background before using at body size.

### Status
- **Alarm** (`#b3423a` on `#f9e9e7` wash): destructive actions, error states.
- **Moss** (`#3d7a55`): success confirmations only; used as text/icon color, not as a background fill.

### Named Rules
**The One-Accent Rule.** Clay is the only saturated color in the system. If a new element seems to need its own color to stand out, the answer is almost always spacing, weight, or size — not a new hue.

## 3. Typography

**Display Font:** Fraunces (with Georgia, serif fallback)
**Body Font:** Karla (with ui-sans-serif, system-ui fallback)

**Character:** A high-contrast, slightly editorial serif against a warm, humanist sans with rounded terminals — the flourish of a handwritten wish paired with the ease of a hand-lettered instruction, not the coldness of a corporate grotesque. This mirrors the product itself: an emotional, personal input (what you want your wedding to feel like) turned into a precise, usable output.

### Hierarchy
- **Display** (600, `clamp(3rem, 6vw, 4.5rem)`, 1.05, tracking -0.025em): hero headline only. `text-wrap: balance` to keep line breaks intentional. Sized to command the page on load — this is the one place the system gets loud.
- **Headline** (600, `clamp(2.25rem, 4vw, 3rem)`, 1.15, tracking -0.025em): section titles (`h2`).
- **Title** (600, 1.125rem, 1.4, sans not serif): card and component headings (`h3`) — one level down from section titles, deliberately switches to sans so serif stays reserved for the emotional register.
- **Body** (400, 1rem–1.125rem, 1.6): paragraph copy. Cap measure at 65–75ch (existing `max-w-2xl`/`max-w-3xl` containers already do this — keep it when adding new copy blocks).
- **Label** (600, 0.75rem, tracking 0.18em, uppercase): the `.eyebrow` utility. See Named Rule below — this token is currently over-used and due for restraint.

### Named Rules
**The Serif-Is-Earned Rule.** Fraunces appears only on `h1`/`h2` and other genuinely aspirational moments (a price, a standout stat). Component titles, buttons, labels, and body text stay in Karla. Mixing them elsewhere flattens the contrast that makes the pairing work.
**The Eyebrow-Off-By-Default Rule.** The `.eyebrow` utility exists but isn't in use anywhere on the current page — every section, including the Hero, leads straight with the headline. Reintroducing it needs a real category-label need, and even then it's still capped at one per page: never default scaffolding above every section.

## 4. Elevation

Flat and border-first by default. A card resting in the normal document flow is distinguished from the page by a 1px `paper-line` border and a shift from `paper-soft` (page) to `paper` (card) — never a drop shadow. Shadows are reserved strictly for surfaces that visually overlap other content and need to signal "this is floating above the page."

### Shadow Vocabulary
- **Resting lift** (`shadow-sm`): the generator input card, an active segmented-control tab. The lightest possible signal that something is interactive/raised, used only where the surface is directly manipulated.
- **Overlay — menu** (`shadow-lg`): dropdown menus. Enough separation to read as "on top of," not enough to feel heavy.
- **Overlay — modal** (`shadow-2xl`): dialogs and toasts — true overlays that block or float above the entire page.

### Named Rules
**The Border-Before-Shadow Rule.** If a card just sits in the page flow, its elevation is a `paper-line` border, full stop. A shadow on a resting card is a bug, not a style choice — it's reserved for content that overlaps other content (menus, dialogs, toasts) or is being actively touched (an input, a pressed tab).

## 5. Components

### Named Rules
**The Four-Role Spacing Rule.** Every gap on the page maps to one of four roles, and every instance of that role uses the same value — no unexplained one-offs:
- **`xs` (8px):** inline clusters — icon-to-label gap inside a single control.
- **`sm` (16px):** related items inside one component — chip-to-chip, toolbar item gaps.
- **`md` (32px):** between siblings in a content grid — card-to-card gap (`gap-8`), and card internal padding (`p-7`, 28px, close enough to this role to read as one family).
- **`lg` (64px):** heading-to-content — the gap between a `SectionHeading` and whatever follows it (`mt-16`), on every section without exception.
- **`xl`/`2xl` (112px / 176px):** section-to-section — outer vertical padding on every standard landing section (`py-28 md:py-44`), including the Hero. Two sections are deliberate exceptions: the scroll-darkening statement is full-height (`min-h-screen`, centered) so it gets a real moment, and the pinned HowItWorks scrollytelling is a tall `lg:h-[450vh]` scroll span.

If a new spot needs "a bit more" or "a bit less" than its role's value, that's a signal the role assignment is wrong, not a reason to introduce a fifth number.

**Codified tokens.** The two most-repeated roles are now real utilities in `index.css`, so sections don't hand-repeat literals: `.section-y` = the section-to-section step (`py-28 md:py-44`, 112/176px), `.stack-lg` = the heading-to-content gap (`mt-16`, 64px). Every standard landing section uses `.section-y`. The scroll-pinned sections (statement, HowItWorks) are deliberate exceptions with their own tall heights.

### Buttons
- **Shape:** fully rounded pill (`rounded-full`, 9999px).
- **Primary:** clay fill, white text, `px-6 py-3`, semibold. Hover deepens to Burnt Clay — a color shift, not a lift/shadow change.
- **Ghost/Secondary:** white fill, `paper-line` border, `ink-soft` text. Hover darkens the border toward ink and the text toward full ink. Used for secondary actions that still need a click target ("Lihat Contoh Hasil"), never for two competing primaries side by side.
- **Focus:** 2px clay ring at 40% opacity with offset, on every interactive element — this is already consistent and should be preserved on any new control.

### Chips
- **Style:** `rounded-full`, `paper-line` border, `paper-soft` fill, `ink-soft` text, `+` prefix when the chip is additive (style suggestions in the generator).
- **State:** hover shifts border to clay/40 and text to Burnt Clay. No filled/selected chip variant exists yet — if one is needed, use Clay Wash fill + Burnt Clay text rather than a solid clay fill (reserve solid clay for primary actions only).

### Cards / Containers
- **Corner style:** `rounded-xl2` (1.25rem) — the signature "soft but substantial" radius for anything containing content (problem cards, step cards, portfolio tiles, pricing cards, testimonial cards, FAQ group).
- **Background:** `paper` (white) against a `paper-soft` or `paper` section background.
- **Shadow strategy:** none at rest (see Elevation). The featured pricing card uses a 1px clay bottom-edge highlight plus a `ring-1 ring-clay/30` instead of a shadow to signal emphasis — an intentional exception, not a shadow substitute.
- **Border:** 1px `paper-line`, always — this is the primary depth cue in the whole system.
- **Internal padding:** `p-7` (28px), always — one value for every card in this family (problem cards, step cards, testimonial cards, pricing cards). A card that needs to feel denser or airier is a density decision, not a license to pick a different padding number.

### Inputs / Fields
- **Style:** `rounded-lg` (smaller radius than cards — inputs read as "inside" a card, one step down), `paper-line` border, `paper-soft` fill at rest.
- **Focus:** border shifts to clay, fill lightens to pure white, plus a `ring-2 ring-clay/20` glow. No layout shift on focus.
- **Placeholder:** full-strength `ink-muted` (not a faded/opacity variant of it) — a `/70`-opacity placeholder measured 2.6:1 against `paper-soft` and failed AA; the solid color clears 4.5:1.

### Composer (Hero prompt input)
- The one deliberate departure from "Inputs / Fields": a common-chatbot shape, not a form field. The bordered `rounded-xl2` card *is* the input boundary — the `<textarea>` inside it is borderless and transparent (`border-0 bg-transparent`), so there's no double-boxed look. Wide by intent (`max-w-3xl`) — this is the page's primary action, it earns the width.
- **Active state on the card, not the textarea.** Because the textarea is borderless, the whole card carries focus: `focus-within:border-clay focus-within:ring-2 focus-within:ring-clay/20`, plus a quiet `hover:border-ink/20`. The card lights up clay the moment the user starts typing.
- Below the textarea sits a single `paper-line`-topped toolbar row: reference-image attach control on the left, one circular send button (`h-11 w-11 rounded-full bg-clay`, 44px touch target) on the right — never a full-width labeled button stacked underneath. Send is icon-only (`aria-label`/`title` carry "Buat Desain Pernikahan" for a11y), disabled at 40% opacity until there's a prompt or a reference image. No suggestion chips, no helper microcopy under the card — the composer stands alone.
- This pattern is intentionally unique to the Hero composer. Don't generalize the borderless-textarea-in-a-card shape to ordinary form fields (wizard, login) — those stay on the standard Inputs/Fields treatment above.

### Hero Floaters
- Decorative wedding-decoration photos (the shared `MOCK_PHOTOS` pool) scattered in the margins around the centered composer — six `absolute`, `rounded-2xl`, `shadow-lg` figures with a gentle `animate-float` drift. `xl:block` only: below `xl` there isn't margin room beside the centered column, so they'd collide with content and are hidden entirely. `pointer-events-none` + `aria-hidden` — purely atmospheric, never interactive, never load-bearing for meaning. The float freezes under `prefers-reduced-motion` via the global rule.

### Feature Columns (Problem framing)
- Three columns, each `icon (clay) → title → body → supporting photo`, separated by hairline dividers (`divide-x` on desktop, `divide-y` stacked on mobile). The photo bleeds to the section's bottom edge with only its top corners rounded (`rounded-t-xl2`, `mt-auto`, no section `pb`) so the images anchor the section rather than floating as boxed cards. Distinct from the Masonry Gallery: this is a fixed 3-up editorial layout, not a variable masonry.

### Navigation
- Sticky header, transparent over the hero until scroll (`scrollY > 8`), then gains a `paper-line` border and `paper/85` blur backdrop. Nav links are `ink-muted` at rest, `ink` on hover — no underline, no pill background. Primary CTA in the nav is always the same pill-primary button used everywhere else, never a distinct "nav-only" treatment.

### Accordion (FAQ)
- Plain-text question row, a clay `+` glyph that rotates 45° into an "×" on open. Answer panel expands via `grid-template-rows` (0fr → 1fr) rather than `max-height`, which keeps the transition accurate at any content length. Single-open behavior (opening one closes the previous) — preserve this; don't switch to multi-open without a reason.

### Masonry Gallery (Portfolio)
- CSS `columns` (1 / 2 / 3 across breakpoints), not `grid` — each tile keeps its natural stacking order per column, no JS layout needed. Tile aspect ratio is deliberately varied per item (`4/5`, `1/1`, `3/4`, `16/11`, cycled) so the grid staggers asymmetrically instead of reading as uniform boxes. `break-inside-avoid` on every tile so a card never splits across columns. Each tile still carries the prompt → hasil split-pane; the masonry treatment is about rhythm, not about dropping the storytelling device.

### Quote Card (Testimonials) — adopted standard
- The canonical way a customer quote is shown. **Soft, quiet, low-contrast** — deliberately *not* the bordered white `p-7` card family: `rounded-xl2`, `bg-paper-soft` fill, **no border**, `p-5`. It recedes into the page rather than announcing itself.
- **Anatomy, top to bottom:** an oversized display quote mark at `text-clay/60` (a whisper of the accent, not full clay); the quote in `ink` at `text-[15px]`; then an attribution row — a `bg-clay-soft` initial avatar, name in `ink` semibold, role in `ink-muted` below.
- **The highlight is the signature move.** One key phrase per quote wears a `bg-clay-soft` `<mark>` (rounded, `px-1`) — the brand's warm wash standing in for the reference's yellow marker. Exactly one highlight per quote; highlighting two phrases kills the emphasis. The highlighted span stays `ink` (the wash is the accent, not the text color).
- This is the adopted quote card everywhere a testimonial appears; don't reintroduce the old bordered-white quote figure with the corner quote mark. Reuse this shape.

## 6. Do's and Don'ts

### Do:
- **Do** spend clay like it's rare — one primary action per view, one accent-colored moment per section.
- **Do** keep Fraunces reserved for headlines and genuinely aspirational numbers; everything functional stays in Karla.
- **Do** express elevation with a `paper-line` border first; reach for `shadow-sm`/`lg`/`2xl` only for touched or overlapping surfaces.
- **Do** name Indonesian wedding/adat terms correctly and specifically (gebyok, paes ageng, janur, Jawa × modern) — specificity is the brand's warmth, per PRODUCT.md.
- **Do** let the product's core action (type → see it generate) be reachable in one step from the hero, not buried below a scroll.

### Don't:
- **Don't** add a second saturated accent color "for variety" — if clay isn't doing the job, the fix is typography or spacing, not a new hue (PRODUCT.md: *generic SaaS template*).
- **Don't** stack an uppercase tracked eyebrow above every section by default — that repetition is the AI-landing-page tell this system is actively rejecting. Budget it to 1-2 sections per page.
- **Don't** add drop shadows to resting cards, gradient-blob background decoration, or hero-metric-card clichés (big number / small label / gradient accent) — reads as assembled-by-template, the opposite of "artisan's notebook" (PRODUCT.md: *generic SaaS template*).
- **Don't** introduce script fonts, floral flourish borders, or stock couple photography — reads as a cheap wedding-template marketplace product, undercuts the craftsman positioning (PRODUCT.md: *situs wedding murahan*).
- **Don't** over-minimize into cold enterprise restraint — the product is about the romance and specificity of one wedding, not a generic dashboard (PRODUCT.md: *kaku & korporat*).
- **Don't** use `border-left`/`border-right` as a colored accent stripe on any card or list item — full border or nothing.
