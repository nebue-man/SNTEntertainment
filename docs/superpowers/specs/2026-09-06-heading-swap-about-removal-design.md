# Design: Homepage About Removal + Heading Size Swap

**Date:** 2026-09-06  
**Status:** Approved

---

## Scope

Two independent visual changes:

1. Remove the About teaser section from the homepage.
2. In sections that have a lime green label + white heading + body content, swap the font sizes between the lime and white text.

---

## Change 1 — Remove About Teaser from Homepage

**File:** `frontend/src/app/page.tsx`

Delete the `About teaser` `<section>` block (currently between CapabilitiesMarquee and the hidden Past Events section). The full About content remains intact on the `/about` page. No other files change.

---

## Change 2 — Heading Size Swap (Approach A: Pure Exact Swap)

### Affected sections

| File | Lime label | White heading | Lime current size | White current size |
|---|---|---|---|---|
| `WhyChooseSNT.tsx` | "Why Choose SNT" | "Built to deliver." | 11px (`text-caption`) | `clamp(2rem, 6vw, 3.5rem)` |
| `about/page.tsx` — Company History | "Company History" | "We build nights worth remembering." | 11px | `var(--text-heading-sm)` |
| `about/page.tsx` — Mission & Vision | "Mission & Vision" | "What we stand for." | 11px | `var(--text-heading-sm)` |
| `about/page.tsx` — Core Values | "Core Values" | "What drives us." | 11px | `var(--text-heading-sm)` |

### Rule applied to each section

**Lime `<p>` (top label → becomes dominant heading):**
- Remove `text-caption` class
- Add `style={{ fontSize: '<white-heading-size>' }}` matching what the white heading had
- Keep all other styling unchanged: `text-electric-lime tracking-widest uppercase`
- Bottom margin: reduce from `mb-6` → `mb-3` (small gap before the white subtitle below)

**White SplitHeadline (dominant heading → becomes refined subtitle):**
- Replace `<SplitHeadline>` with a plain `<p>` tag (animating 11px text is meaningless)
- Apply `text-caption` size (11px)
- Keep `text-ghost-white font-light`
- Add `fontFamily: 'var(--font-display, var(--font-body))'` to preserve Cormorant Garamond character
- Bottom margin: promote to `mb-10` or `mb-12` (now sits above body content, needs breathing room)

### Resulting visual order per section

```
[LARGE LIME UPPERCASE LABEL]     ← formerly the small eyebrow
[small white cormorant subtitle] ← formerly the large heading
[body content / paragraph]
```

### Excluded sections

Sections that have lime text but no matching white heading + body paragraph are not touched:
- Homepage: "Upcoming Event" / "What's next." → card grid only, no paragraph
- About page Mission/Vision inner boxes: lime "Mission" / "Vision" labels → no white heading counterpart
- About page Core Values numbered items: lime numbers are list decorators, not section headings
- Event view page: lime labels like "About this event", "Upcoming Event" → no paired white heading

---

## Files Changed

| File | Change |
|---|---|
| `frontend/src/app/page.tsx` | Delete About teaser `<section>` |
| `frontend/src/components/ui/WhyChooseSNT.tsx` | Swap lime/white sizes |
| `frontend/src/app/about/page.tsx` | Swap lime/white sizes in 3 sections |

---

## Out of Scope

- No position changes — lime stays on top, white stays below it
- No color changes
- No font family changes on the lime labels
- No changes to the Upcoming Events, Past Events, or event card sections
- No changes to admin pages
