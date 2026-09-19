# SNT Entertainments — Typography Audit
> Every font family, size, and weight actually in use in the codebase, pulled from source. This is a factual extraction of the current implementation, not a style-reference/inspiration doc (see `design.md` / `DESIGN-2.md` for those — unrelated brands, left untouched).

## Font Families

| Token | Value | Where it's set | Used by |
|---|---|---|---|
| `--font-body` | Montserrat (via `next/font/google`) | `frontend/src/app/layout.tsx` — `Montserrat({ subsets: ['latin'], weight: ['200','300','400','500','600','700','800'], variable: '--font-body', display: 'swap' })`, applied to `<html className={montserrat.variable}>` | Entire public site — every heading and body element resolves to this one variable |
| *(fallback stack)* | `ui-sans-serif, system-ui, sans-serif` | `globals.css` — `html { font-family: var(--font-body, ui-sans-serif, system-ui, sans-serif); font-weight: 400; }` | Base fallback if the variable fails to load; also sets the page-wide default weight (400) |
| `--font-lausanne` | `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` | `globals.css` `@theme` block, commented "Legacy — kept for admin layout which uses font-lausanne class" | **Admin panel only** — `app/admin/layout.tsx` (`className="... font-lausanne"`). Deliberately *not* Montserrat — the admin UI runs on native system fonts, separate from the public brand typeface |

Loaded Montserrat weights: **200, 300, 400, 500, 600, 700, 800**. Page default (unset elsewhere): **400**.

## Custom Type Scale (design tokens — `globals.css` `@theme`)

| Token | Raw value | Computed (px) |
|---|---|---|
| `--text-caption` | `11px` | 11px |
| `--text-body-sm` | `13px` | 13px |
| `--text-body` | `1.2rem` | 19.2px |
| `--text-body-lg` | `16px` | 16px |
| `--text-heading-sm` | `clamp(2.75rem, 5vw, 3rem)` | 44px → 48px |
| `--text-heading` | `clamp(2rem, 6vw, 3rem)` | 32px → 48px |
| `--text-heading-lg` | `clamp(2.25rem, 7vw, 3.75rem)` | 36px → 60px |
| `--text-display-sm` | `clamp(2.5rem, 9vw, 4.5rem)` | 40px → 72px |

These are the project's actual reusable size tokens, applied via Tailwind's `text-caption` / `text-body-sm` / `text-body` / `text-body-lg` / `text-heading-sm` / `text-heading` / `text-heading-lg` / `text-display-sm` utility classes and via `style={{ fontSize: 'var(--text-...)' }}`.

## Font Weight Scale

Tailwind's default weight scale is unmodified in this project (no `@theme` override), so:

| Class | Numeric weight | Used here? |
|---|---|---|
| `font-thin` | 100 | no |
| `font-extralight` | 200 | no *(used only via inline `fontWeight: 200`, not the class)* |
| `font-light` | 300 | **yes — 24 occurrences**, the dominant secondary-text weight |
| `font-normal` | 400 | yes — 3 occurrences |
| `font-medium` | 500 | yes — 1 occurrence |
| `font-semibold` | 600 | yes — 1 occurrence |
| `font-bold` | 700 | **yes — 10 occurrences**, the dominant headline weight |
| `font-extrabold` | 800 | no *(loaded by Montserrat but unused)* |
| `font-black` | 900 | no |

## Usage Inventory

### A. Tailwind font-weight classes — every occurrence

| File | Line | Class in context |
|---|---|---|
| `app/about/page.tsx` | 32 | `text-ghost-white font-bold mb-12 max-w-4xl` (h1 headline) |
| `app/about/page.tsx` | 62 | `text-ghost-white font-bold mb-12` (h2 headline) |
| `app/about/page.tsx` | 98 | `text-ghost-white font-bold mb-12` (h2 headline) |
| `app/about/page.tsx` | 107 | `text-caption text-electric-lime tracking-widest font-light shrink-0` (numbered label) |
| `app/about/page.tsx` | 113 | `text-body text-ghost-white font-light` (team member name) |
| `app/about/page.tsx` | 130 | `text-ghost-white font-bold mb-12` (h2 headline) |
| `app/admin/events/edit/page.tsx` | 280 | `... font-normal ...` (table header) |
| `app/admin/events/edit/page.tsx` | 534 | `text-xl font-light tracking-wide` (page title) |
| `app/admin/events/new/page.tsx` | 65 | `text-xl font-light tracking-wide` (page title) |
| `app/admin/events/page.tsx` | 56 | `text-xl font-light tracking-wide` (page title) |
| `app/admin/events/page.tsx` | 85 | `... font-normal ...` (table header) |
| `app/admin/events/page.tsx` | 95 | `... font-light` (table cell) |
| `app/admin/layout.tsx` | 34 | `... font-light` (sidebar label) |
| `app/admin/layout.tsx` | 46 | `text-[13px] font-light tracking-wide ...` (nav link) |
| `app/admin/login/page.tsx` | 37 | `text-3xl font-light` ("Admin" title) |
| `app/admin/media/page.tsx` | 56 | `... font-medium ...` (button) |
| `app/admin/media/page.tsx` | 223 | `... font-semibold ...` (badge) |
| `app/admin/media/page.tsx` | 477 | `text-[22px] font-light tracking-tight mb-6` ("Media" title) |
| `app/admin/settings/page.tsx` | 49 | `text-xl font-light tracking-wide` (page title) |
| `app/admin/ticket-requests/page.tsx` | 77 | `text-xl font-light tracking-wide` (page title) |
| `app/admin/ticket-requests/page.tsx` | 118 | `... font-normal ...` (table header) |
| `app/admin/ticket-requests/page.tsx` | 127 | `... font-light ...` (table cell) |
| `app/events/upcoming/page.tsx` | 52 | `text-ghost-white font-bold mb-14` (h1 headline) |
| `app/page.tsx` | 94 | `text-ghost-white font-bold` (h2 headline) |
| `app/page.tsx` | 163 | `text-ghost-white font-bold` (h2 headline) |
| `components/events/EmailCaptureModal.tsx` | 87 | `text-heading-sm text-ghost-white font-light` (modal title) |
| `components/events/FlyerCard.tsx` | 44 | `text-body-lg text-ghost-white font-light line-clamp-2 ...` (event title) |
| `components/events/PastEventsCoverflow.tsx` | 81 | `text-ghost-white font-light text-[17px] leading-tight` |
| `components/events/PastEventsCoverflow.tsx` | 274 | `text-ghost-white font-light text-[15px] leading-snug line-clamp-2` |
| `components/events/PastEventsCoverflow.tsx` | 494 | `text-ghost-white font-light` (headline) |
| `components/events/TeamMemberCard.tsx` | 41 | `text-body text-ghost-white font-light` (member name) |
| `components/events/TicketPhaseCard.tsx` | 28 | `text-body-lg text-ghost-white font-light` (phase name) |
| `components/events/TicketPhaseCard.tsx` | 36 | `text-body-lg text-ghost-white font-light whitespace-nowrap` (price) |
| `components/media/HeroCarousel.tsx` | 51 | `text-ghost-white font-bold leading-none mb-6` (hero headline) |
| `components/media/HeroCarousel.tsx` | 55 | `text-body-lg text-ghost-white/70 font-light max-w-lg` (tagline) |
| `components/media/HeroCarousel.tsx` | 114 | `text-ghost-white font-bold leading-none mb-6` (hero headline) |
| `components/media/HeroCarousel.tsx` | 119 | `text-body-lg text-ghost-white/80 font-light max-w-lg` (tagline) |
| `components/ui/GhostButton.tsx` | 56 | `... font-light tracking-widest uppercase` (button base style) |
| `components/ui/WhyChooseSNT.tsx` | 38 | `text-ghost-white font-bold mb-10` ("Built to deliver." subheading) |

**Pattern:** on the public site, headlines are `font-bold` (700) and everything else — body copy, taglines, labels, names — is `font-light` (300). The admin panel follows its own separate convention: page titles/labels are `font-light`, table headers `font-normal`, with occasional `font-medium`/`font-semibold` for buttons and badges.

### B. Inline `fontSize` / `fontWeight` overrides (bespoke values, not tokens)

| File | Line | Property | Value | Context |
|---|---|---|---|---|
| `app/events/past/page.tsx` | 65–66 | fontSize / fontWeight | `11px` / `400` | "Past Event" eyebrow label |
| `app/events/past/page.tsx` | 78–79 | fontSize / fontWeight | `var(--text-heading-sm)` / `200` | "Past Events." heading |
| `components/layout/BottomNav.tsx` | 9–10 | fontSize / fontWeight | `10` / `400` | nav pill tab labels |
| `components/layout/Footer.tsx` | 74–75 | fontSize / fontWeight | `0.68rem` / `700` | "Contact Us" heading |
| `components/layout/Footer.tsx` | 111 | fontSize | `10px` | copyright line |
| `components/layout/Footer.tsx` | 192–193 | fontSize / fontWeight | `0.68rem` / `400` | "Hotline:" label |
| `components/layout/Footer.tsx` | 205–206 | fontSize / fontWeight | `0.8rem` / `300` | hotline phone number |
| `components/media/HeroIntro.tsx` | 349–350 | fontSize / fontWeight | `clamp(1.1rem, 4.5vw, 2.75rem)` / `200` | "S N T ENTERTAINMENTS" hero mark |
| `components/media/HeroIntro.tsx` | 365–366 | fontSize / fontWeight | `clamp(0.5rem, 3.2vw, 1rem)` / `300` | full legal name line |
| `components/media/HeroIntro.tsx` | 380–381 | fontSize / fontWeight | `clamp(1rem, 1.6vw, 1.25rem)` / `400` | "Designed for prestige" |
| `components/ui/AllEventsButton.tsx` | 147 | fontSize | `var(--text-body-sm)` | button label |
| `components/ui/CapabilitiesMarquee.tsx` | 26, 32 | fontSize | `10px` | marquee item labels |
| `components/ui/GetInTouchButton.tsx` | 144–145 | fontSize / fontWeight | `var(--text-body-sm)` / `500` | CTA button label |
| `components/ui/WhyChooseSNT.tsx` | 31 | fontSize / fontWeight | `var(--text-heading-sm)` / `400` | "Why Choose SNT" eyebrow |
| `components/ui/WhyChooseSNT.tsx` | 40 | fontSize | `1.3125rem` | "Built to deliver." subheading |

### C. Custom size tokens (`text-caption`, `text-body`, `text-heading-sm`, etc.) — file locations

Used across 70+ locations; heaviest usage by file:

`app/about/page.tsx` (17), `components/events/EmailCaptureModal.tsx` (9), `app/page.tsx` (6), `components/events/TicketPhaseCard.tsx` (5), `app/events/upcoming/page.tsx` (3), `components/media/HeroCarousel.tsx` (4), `components/events/FlyerCard.tsx` (3), `components/events/TeamMemberCard.tsx` (3), plus single/double occurrences across `EventFilter.tsx`, `EventTicketSection.tsx`, `EventsGallery.tsx`, `Lightbox.tsx`, `PastEventsCoverflow.tsx`, `MediaCard.tsx`, `GhostButton.tsx`, `LoadingGate.tsx`, `PlaceholderMedia.tsx`, `WhyChooseSNT.tsx`, `events/past/page.tsx`.

### D. Admin panel — plain Tailwind default scale (not custom tokens)

The admin panel does **not** use the project's `--text-*` tokens — it uses Tailwind's built-in default type scale directly (`text-xs` 12px, `text-sm` 14px, `text-lg` 18px, `text-xl` 20px, `text-3xl` 30px), confined entirely to:

`app/admin/events/page.tsx`, `app/admin/events/edit/page.tsx`, `app/admin/events/new/page.tsx`, `app/admin/login/page.tsx`, `app/admin/settings/page.tsx`, `app/admin/ticket-requests/page.tsx`

This is a deliberate split, consistent with the admin using `font-lausanne` instead of Montserrat: the admin panel's typography system is intentionally independent of the public site's.

---
*Extracted from `frontend/src` as of the current working tree. Regenerate by re-grepping for `fontSize:`, `fontWeight:`, `font-(light|bold|normal|medium|semibold)`, and `text-(caption|body-sm|body|body-lg|heading-sm|heading|heading-lg|display-sm)` if the codebase changes.*
