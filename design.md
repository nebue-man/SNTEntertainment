# Agence K72 — Style Reference
> Midnight graphic stage

**Theme:** dark

K72 utilizes a dark, high-contrast aesthetic with stark white typography against deep black surfaces, creating a bold and assertive tone. Interaction is signaled through vivid green accents and large, characterful outline buttons. The design emphasizes content through dramatic scaling typography and generous horizontal padding, giving elements ample room to breathe in a visually dense environment. Components are distinctly outlined, reinforcing a graphic, almost print-like quality.

Source: https://k72.ca

## Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| Absolute Zero | `#000000` | `--color-absolute-zero` | Page backgrounds, card surfaces, navigation background — forms the primary dark canvas |
| Ghost White | `#ffffff` | `--color-ghost-white` | Primary text, heading text, button text, borders for outlines and graphic elements, navigation text, icons |
| Pewter | `#4d4d4d` | `--color-pewter` | Muted text, secondary navigation text, subtle borders in certain contexts |
| Electric Lime | `#d3fd50` | `--color-electric-lime` | Green decorative accent for icons, marks, and small graphic details. Do not promote it to the primary CTA color |

## Tokens — Typography

### Lausanne — single typeface across all UI contexts · `--font-lausanne`
- **Substitute:** system-ui, sans-serif
- **Weights:** 300, 400
- **Sizes:** 11px, 14px, 16px, 20px, 35px, 94px, 115px, 137px
- **Line height:** 0.70, 0.75, 0.87, 1.20, 1.30, 1.50
- **Letter spacing:** normal
- **Role:** All textual content — headlines, body text, navigation, and buttons. Its varied weights and tightly-packed large sizes define the brand's bold and graphic typographic voice.

### Type Scale

| Role | Size | Line Height | Token |
|------|------|-------------|-------|
| caption | 11px | 1.2 | `--text-caption` |
| body-sm | 14px | 1.2 | `--text-body-sm` |
| body | 16px | 1.2 | `--text-body` |
| body-lg | 20px | 1.2 | `--text-body-lg` |
| heading-sm | 35px | 1.2 | `--text-heading-sm` |
| heading | 94px | 1.2 | `--text-heading` |
| heading-lg | 115px | 1.2 | `--text-heading-lg` |
| display-sm | 137px | 1.2 | `--text-display-sm` |

## Tokens — Spacing & Shapes

**Density:** compact

- **Section gap:** 40px
- **Card padding:** 28px
- **Element gap:** 10px
- **Headline horizontal padding:** 144px

### Border Radius
- Buttons (pill): 93506.4px (i.e. fully rounded / pill)
- Nav badges: 34965px (fully rounded)

## Components

### Ghost Button Thin Border
Transparent background, Ghost White text, 1px Ghost White border, 0px radius, 25px horizontal padding, 0px vertical padding. Used for "Menu" / "Fermer le menu".

### Ghost Button Thick Border Rounded (primary action)
Transparent background, Ghost White text, 3px Ghost White border, pill radius, ~28px horizontal padding, ~21px top padding, 0px bottom padding. Used for "Projets" and "Agence".

### Nav Item
Ghost White text, 10px padding, no background, 3px margin between items. Language toggle uses full pill radius. Active states may use Pewter as background.

## Do's and Don'ts

### Do
- Use Absolute Zero (#000000) for all primary backgrounds.
- Apply Ghost White (#ffffff) for all primary text, headlines, and interactive borders.
- Use Lausanne exclusively (weights 300/400) for all text.
- Give primary buttons a 3px Ghost White border and full pill radius.
- Keep compact density, 10px element gaps for small interactive groups.
- Use generous horizontal padding — 28px for buttons, 144px for main headlines.
- Use Electric Lime (#d3fd50) sparingly, only as decorative stroke/accent.

### Don't
- Don't fill interactive elements with solid color — favor outlines/ghost styles.
- Don't use sharp corners on buttons — stay pill-shaped.
- Don't deviate from Lausanne or its specified weights.
- Don't use Electric Lime as a functional background or text color.
- Don't substitute generic system fonts — Lausanne is core to the identity.
- Don't add shadows or elevation — flat surfaces and strong outlines only.

## Imagery
Full-bleed photography with a dark, moody overlay (often hands/activity shots), used as textural backdrop for high-contrast white text — not the content focus. No illustrations, no product screenshots. Icons are minimal Ghost White line icons.

## Layout
Full-bleed sections, background imagery stretching the full viewport. Hero: centered, dramatically scaled headline over background image/video. Content centered or with heavy horizontal padding. Minimal top nav with discreet links; primary actions are large pill-shaped outline buttons. Expansive negative space around key elements.

## Motion & stack notes (from site inspection, not Refero tokens)
- Confirmed stack: Locomotive Scroll (smooth scroll), GSAP (scroll-triggered animation), Lottie (vector animation), Canvas API.
- For a modern build, Lenis is the maintained successor to Locomotive Scroll and pairs well with GSAP ScrollTrigger.
- Kinetic, large-scale headline reveals and scroll-linked pinning are the site's signature motion pattern.

## Interaction & Motion Spec
*(Not part of the Refero token extraction — added from direct site inspection. This is the part that actually makes it feel like K72; the color/type tokens alone won't get you there.)*

### Full-screen menu overlay
- Menu button ("Menu") is top-right, ghost-thin-border style per token spec.
- On click: a full-viewport panel wipes/slides in from the right (or fades+scales in) covering the entire screen in Absolute Zero — not a dropdown, not a side drawer partially covering content.
- Nav links inside the overlay are large (heading-sm to heading scale, 35-94px), stacked vertically, generous line-height gaps.
- Links stagger in individually (each line animates in ~40-60ms after the previous) rather than the whole menu appearing at once.
- Close control becomes "Fermer le menu" (Close menu) in the same ghost-thin-border style, same top-right position.
- Language toggle (fr/en) sits near the close button, small pill badge style.

### Scroll choreography (Lenis + GSAP ScrollTrigger)
- Global smooth scroll via Lenis — no native scroll-snap, everything glides.
- Hero headline: splits into words or lines on load/scroll-in, each line translates up + fades in with a slight stagger (SplitText-style effect).
- Section headlines: same split-and-reveal treatment triggered when the section enters ~70-80% of viewport height.
- Background video/imagery: subtle parallax — moves slower than scroll speed (~0.5-0.7x) to create depth without being distracting.
- Occasional section pinning: a section holds in place for a short scroll distance while its content changes/animates, then releases — used sparingly (1-2 spots per page), not on every section.
- Body copy fades/translates in on scroll without splitting (word-splitting is reserved for headlines only).

### Custom cursor (optional but on-brand)
- Small filled or ringed dot replacing the default cursor.
- Scales up (roughly 2-3x) and may invert (white becomes lime, or gains a lime ring) when hovering any link or button.
- Hidden on touch devices.

### Ambient detail
- Small live-updating label, e.g. city name + live clock ("MONTREAL_22:30:24"), positioned in a corner, updates every second. Purely atmospheric — low visual weight, caption-scale type, Pewter or Ghost White at reduced opacity.

### Responsive scaling
- The token values (137px display, 144px headline padding) are desktop-scale and will break mobile layouts as-is.
- Use `clamp()` for all heading sizes, e.g. `clamp(2.5rem, 8vw, 8.56rem)` for display-sm, scaling proportionally down to a readable mobile floor (roughly 40-56px on small screens).
- Drop headline horizontal padding to ~20-24px below 768px; drop section gap to ~24px.
- Full-screen menu overlay behavior stays the same on mobile — it's already full-viewport, just adjust link font size.

## Quick Start — CSS Custom Properties

```css
:root {
  --color-absolute-zero: #000000;
  --color-ghost-white: #ffffff;
  --color-pewter: #4d4d4d;
  --color-electric-lime: #d3fd50;

  --font-lausanne: 'Lausanne', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  --text-caption: 11px;
  --text-body-sm: 14px;
  --text-body: 16px;
  --text-body-lg: 20px;
  --text-heading-sm: 35px;
  --text-heading: 94px;
  --text-heading-lg: 115px;
  --text-display-sm: 137px;

  --font-weight-light: 300;
  --font-weight-regular: 400;

  --section-gap: 40px;
  --card-padding: 28px;
  --element-gap: 10px;
  --headline-padding-x: 144px;

  --radius-buttons: 93506.4px;
  --radius-navbadges: 34965px;
}
```

### Tailwind v4

```css
@theme {
  --color-absolute-zero: #000000;
  --color-ghost-white: #ffffff;
  --color-pewter: #4d4d4d;
  --color-electric-lime: #d3fd50;

  --font-lausanne: 'Lausanne', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  --text-caption: 11px;
  --text-body-sm: 14px;
  --text-body: 16px;
  --text-body-lg: 20px;
  --text-heading-sm: 35px;
  --text-heading: 94px;
  --text-heading-lg: 115px;
  --text-display-sm: 137px;

  --radius-full: 34965px;
  --radius-full-2: 93506.4px;
}
```
