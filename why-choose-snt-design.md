# "Why Choose SNT" Section — Design Spec

Portable reference for reimplementing this section elsewhere. Source: `frontend/src/components/ui/WhyChooseSNT.tsx` (SNT Entertainments site).

## 1. Structure

Eyebrow label → subheading → 2-column grid of 8 icon cards.

```
WHY CHOOSE SNT            ← eyebrow label
Built to deliver.         ← subheading
┌──────────────┐ ┌──────────────┐
│ [icon]       │ │ [icon]       │
│ card text... │ │ card text... │   ← 2-column grid, 4 rows, 8 cards total
└──────────────┘ └──────────────┘
... (repeats for all 8 cards)
```

## 2. Icons

Library: **[Lucide](https://lucide.dev)** — `lucide-react` v1.24.0 in the source project (`npm install lucide-react`). Lucide also ships as `lucide` (vanilla JS/SVG) and for Vue/Svelte/etc. under the same icon names, so this maps to any stack.

| # | Card text | Icon name |
|---|---|---|
| 1 | End-to-end event planning and production solutions. | `ClipboardCheck` |
| 2 | Experienced team with a proven record of successful event execution. | `Users` |
| 3 | Professional coordination of concerts, corporate events, and entertainment programs. | `CalendarCheck` |
| 4 | High-quality production standards, including stage, sound, lighting, and event logistics. | `SlidersHorizontal` |
| 5 | Creative concepts tailored to each client's requirements. | `Lightbulb` |
| 6 | Reliable project management with attention to every detail. | `Target` |
| 7 | Strong industry relationships with artists, entertainers, suppliers, and venues. | `Handshake` |
| 8 | Commitment to delivering memorable experiences on time and within budget. | `Sparkles` |

**Icon styling:** size `20px` (viewbox scales automatically), color = accent color (`#d3fd50`, see §4), default Lucide stroke width (`2`), no fill.

```jsx
<ClipboardCheck size={20} color="#d3fd50" />
```

## 3. Typography

Base font family: **Montserrat** (Google Fonts), loaded with weights `200 300 400 500 600 700 800`. Fallback stack: `ui-sans-serif, system-ui, sans-serif`.

```css
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@200;300;400;500;600;700;800&display=swap');
```

| Element | Font size | Font weight | Letter spacing | Text transform | Color | Notes |
|---|---|---|---|---|---|---|
| Eyebrow label ("WHY CHOOSE SNT") | `clamp(2.75rem, 5vw, 3rem)` (44px → 48px, responsive) | `400` | `0.1em` (wide/"tracking-widest") | `uppercase` | `#d3fd50` (accent) | Bottom margin `0.75rem` (12px) |
| Subheading ("Built to deliver.") | `1.3125rem` (21px) | `700` (bold) | `0.02em` | none | `#ffffff` | Bottom margin `2.5rem` (40px) |
| Card body text | `13px` | `400` (inherited default; not overridden) | normal | none | `#ffffff` | Line height `1.625` ("leading-relaxed"), top margin `0.75rem` (12px) from icon |

## 4. Colors

| Role | Value |
|---|---|
| Accent (icons, eyebrow label) | `#d3fd50` (lime-green) |
| Primary text | `#ffffff` |
| Card border | `#808080` at 20% opacity → `rgba(128,128,128,0.2)` |
| Card background | transparent (none set) |
| Page/section background | `#000000` |

## 5. Layout & Spacing

- Grid: 2 columns at **all** breakpoints (`grid-template-columns: repeat(2, minmax(0, 1fr))`), `gap: 0.75rem` (12px)
- Container max-width: `56rem` (896px)
- Card: `border: 1px solid rgba(128,128,128,0.2)`, `border-radius: 0.75rem` (12px), `padding: 1rem` (16px)
- Inside card: icon, then `0.75rem` (12px) gap, then text (icon sits above text, not side-by-side)

## 6. Portable vanilla HTML/CSS

Framework-agnostic version — swap the inline SVGs for your icon source of choice (Lucide icon names listed in §2 map 1:1 if you use `lucide` or any Lucide port).

```html
<section class="why-choose">
  <p class="why-choose__eyebrow">Why Choose SNT</p>
  <p class="why-choose__subheading">Built to deliver.</p>
  <div class="why-choose__grid">
    <div class="why-choose__card">
      <svg class="why-choose__icon" width="20" height="20" ...></svg>
      <p class="why-choose__text">End-to-end event planning and production solutions.</p>
    </div>
    <!-- repeat for all 8 items -->
  </div>
</section>
```

```css
.why-choose__eyebrow {
  font-family: 'Montserrat', ui-sans-serif, system-ui, sans-serif;
  font-size: clamp(2.75rem, 5vw, 3rem);
  font-weight: 400;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #d3fd50;
  margin-bottom: 0.75rem;
}

.why-choose__subheading {
  font-family: 'Montserrat', ui-sans-serif, system-ui, sans-serif;
  font-size: 1.3125rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #ffffff;
  margin-bottom: 2.5rem;
}

.why-choose__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  max-width: 56rem;
}

.why-choose__card {
  border: 1px solid rgba(128, 128, 128, 0.2);
  border-radius: 0.75rem;
  padding: 1rem;
}

.why-choose__icon {
  color: #d3fd50; /* SVG uses currentColor stroke */
}

.why-choose__text {
  font-family: 'Montserrat', ui-sans-serif, system-ui, sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.625;
  color: #ffffff;
  margin-top: 0.75rem;
}
```

## 7. Original React/Tailwind source (for reference)

```tsx
import { ClipboardCheck, Users, CalendarCheck, SlidersHorizontal, Lightbulb, Target, Handshake, Sparkles, type LucideIcon } from 'lucide-react'

const items: { text: string; icon: LucideIcon }[] = [
  { text: 'End-to-end event planning and production solutions.', icon: ClipboardCheck },
  { text: 'Experienced team with a proven record of successful event execution.', icon: Users },
  { text: 'Professional coordination of concerts, corporate events, and entertainment programs.', icon: CalendarCheck },
  { text: 'High-quality production standards, including stage, sound, lighting, and event logistics.', icon: SlidersHorizontal },
  { text: "Creative concepts tailored to each client's requirements.", icon: Lightbulb },
  { text: 'Reliable project management with attention to every detail.', icon: Target },
  { text: 'Strong industry relationships with artists, entertainers, suppliers, and venues.', icon: Handshake },
  { text: 'Commitment to delivering memorable experiences on time and within budget.', icon: Sparkles },
]

<p style={{ fontSize: 'clamp(2.75rem, 5vw, 3rem)', fontWeight: 400 }} className="text-[#d3fd50] tracking-widest uppercase mb-3">
  Why Choose SNT
</p>
<p style={{ fontSize: '1.3125rem', letterSpacing: '0.02em' }} className="text-white font-bold mb-10">
  Built to deliver.
</p>
<div className="grid grid-cols-2 gap-3 max-w-4xl">
  {items.map(({ text, icon: Icon }, i) => (
    <div key={i} className="border border-[#808080]/20 rounded-xl p-4">
      <Icon className="text-[#d3fd50]" size={20} />
      <p className="text-[13px] text-white leading-relaxed mt-3">{text}</p>
    </div>
  ))}
</div>
```
