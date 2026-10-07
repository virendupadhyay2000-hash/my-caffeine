# Design Brief

## Direction

माटी और हरियाली (Earth & Verdure) — a civic village ledger rendered on warm parchment, deep forest green, and clay.

## Tone

Grounded, trustworthy, editorial — rural Indian civic record-keeping, not a corporate SaaS dashboard; warmth and legibility over gloss.

## Differentiation

A bilingual Devanagari-first type system (Fraunces serif display over General Sans) paired with a three-state problem lifecycle color language (clay → ochre → green) that makes village accountability readable at a glance.

## Color Palette

| Token      | OKLCH         | Role                                       |
| ---------- | ------------- | ------------------------------------------ |
| background | 0.975 0.012 85 | Warm parchment page base                   |
| foreground | 0.22 0.02 60   | Deep umber ink text                        |
| card       | 0.995 0.006 85 | Near-white cream surfaces                  |
| primary    | 0.42 0.11 155  | Deep forest green — header, CTAs           |
| accent     | 0.58 0.13 40   | Terracotta clay — highlights, "New" state  |
| muted      | 0.93 0.018 85  | Sand — secondary surfaces, footer          |
| success    | 0.55 0.14 152  | Resolved green                             |
| warning    | 0.72 0.14 78   | In-progress ochre                          |

## Typography

- Display: Fraunces (serif) — headings, app name ग्राम पंचायत, KPI numbers
- Body: General Sans — UI labels, body copy, bilingual Latin text
- Devanagari: Noto Sans Devanagari / Nirmala UI / Mangal system fallback (no bundled Devanagari .woff2 ships with the skill)
- Scale: hero `text-4xl md:text-6xl font-bold tracking-tight`, h2 `text-2xl md:text-3xl font-bold`, label `text-xs font-semibold tracking-widest uppercase`, body `text-base`

## Elevation & Depth

Layered parchment: cream cards float on a warm base with soft umber-tinted shadows (`shadow-subtle`, `shadow-elevated`); no glow, no glass.

## Structural Zones

| Zone    | Background        | Border          | Notes                                          |
| ------- | ----------------- | --------------- | ---------------------------------------------- |
| Header  | forest green      | none            | Solid `bg-primary`, bilingual nav, cream text  |
| Content | parchment         | —               | Alternate `bg-muted/30` between sections       |
| Footer  | sand `bg-muted/40`| `border-t`      | Muted, Hindi-first copyright + contact         |

## Spacing & Rhythm

Generous section gaps (`py-10 md:py-16`), 16–24px card padding, 8px micro-spacing; KPI grid tight, feed cards airy for scannability.

## Component Patterns

- Buttons: forest-green fill radius `--radius`, hover darkens + `shadow-elevated`; accent used only for "New"/primary report CTA
- Cards: cream, 12px radius, thin warm border, `shadow-subtle`, `shadow-elevated` on hover
- Badges: full pill; New = clay, In Progress = ochre, Resolved = green; category chips use muted sand

## Motion

- Entrance: `animate-fade-in-up` 0.4s staggered for feed cards and KPI grid
- Hover: `transition-smooth` 0.3s on cards/buttons, lift via shadow only
- Decorative: `animate-pulse-soft` on live status dots; no bounce

## Constraints

- Hindi-first copy with English labels alongside key actions
- Responsive: mobile single-column → `md:` two-column dashboard grid
- Semantic tokens only — no raw hex, no arbitrary Tailwind colors
- No email notifications, no village map view (out of scope)

## Signature Detail

The bilingual status pill — Devanagari word above a small uppercase Latin label, color-coded clay/ochre/green — turns every problem card into a legible civic status stamp.
