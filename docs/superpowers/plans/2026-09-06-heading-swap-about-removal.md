# Heading Size Swap + About Teaser Removal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the About teaser block from the homepage and swap lime/white heading sizes in all paragraph sections sitewide.

**Architecture:** Three file edits — delete one JSX section from `page.tsx`, rewrite the lime+white heading pair in `WhyChooseSNT.tsx`, and rewrite three lime+white heading pairs in `about/page.tsx`. No new components or abstractions needed.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Cormorant Garamond (`--font-display`), DM Sans (`--font-body`)

---

## File Map

| File | Change |
|---|---|
| `frontend/src/app/page.tsx` | Delete the "About teaser" `<section>` block |
| `frontend/src/components/ui/WhyChooseSNT.tsx` | Swap lime `<p>` size ↔ white `SplitHeadline` size |
| `frontend/src/app/about/page.tsx` | Swap lime `<p>` size ↔ white `SplitHeadline` size in 3 sections |

---

## Task 1: Remove About Teaser from Homepage

**Files:**
- Modify: `frontend/src/app/page.tsx`

- [ ] **Step 1: Delete the About teaser section**

In `frontend/src/app/page.tsx`, find and delete the entire block labeled `About teaser` — the `<section>` that starts immediately after `<CapabilitiesMarquee />`. The block to remove is:

```tsx
{/* ── About teaser ──────────────────────────────────────────── */}
<section
  className="py-24 md:py-32 border-b border-pewter/20"
  style={{ paddingLeft: 'var(--headline-padding-x)', paddingRight: 'var(--headline-padding-x)' }}
>
  <ScrollReveal>
    <p className="text-caption text-electric-lime tracking-widest uppercase mb-6">About Us</p>
  </ScrollReveal>
  <SplitHeadline
    text="We build nights worth remembering."
    as="h2"
    className="text-ghost-white font-light mb-10 max-w-4xl"
    style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)' }}
  />
  <ScrollReveal delay={0.2}>
    <p className="text-body text-pewter max-w-2xl mb-12 leading-relaxed">
      SNT is Sri Lanka&apos;s premier live music event company. We partner with the
      island&apos;s top-tier bands and international acts to deliver electrifying
      experiences at iconic venues nationwide.
    </p>
    <GhostButton href="/about" variant="pill">
      Learn More
    </GhostButton>
  </ScrollReveal>
</section>
```

After deleting, `<CapabilitiesMarquee />` is immediately followed by the hidden Past Events section comment.

- [ ] **Step 2: TypeScript check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/page.tsx
git commit -m "feat: remove About teaser from homepage — content lives on /about"
```

---

## Task 2: Swap Heading Sizes in WhyChooseSNT

**Files:**
- Modify: `frontend/src/components/ui/WhyChooseSNT.tsx`

**Current state:**
- Lime `<p>`: `text-caption` (11px), `mb-6`
- White `SplitHeadline`: `fontSize: 'clamp(2rem, 6vw, 3.5rem)'`, `font-light`, `mb-10`

**Target state:**
- Lime `<p>`: `fontSize: 'clamp(2rem, 6vw, 3.5rem)'`, remove `text-caption`, keep all other classes, `mb-3`
- White: replace `SplitHeadline` with plain `<p>`, `text-caption text-ghost-white font-light`, `fontFamily: 'var(--font-display, var(--font-body))'`, `mb-10`

- [ ] **Step 1: Replace the lime label and white heading**

Replace the entire content of `frontend/src/components/ui/WhyChooseSNT.tsx` with:

```tsx
import ScrollReveal from '@/components/ui/ScrollReveal'

const items = [
  'End-to-end event planning and production solutions.',
  'Experienced team with a proven record of successful event execution.',
  'Professional coordination of concerts, corporate events, and entertainment programs.',
  'High-quality production standards, including stage, sound, lighting, and event logistics.',
  "Creative concepts tailored to each client's requirements.",
  'Reliable project management with attention to every detail.',
  'Strong industry relationships with artists, entertainers, suppliers, and venues.',
  'Commitment to delivering memorable experiences on time and within budget.',
]

export default function WhyChooseSNT() {
  return (
    <>
      <ScrollReveal>
        <p
          className="text-electric-lime tracking-widest uppercase mb-3"
          style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: 300 }}
        >
          Why Choose SNT
        </p>
      </ScrollReveal>
      <ScrollReveal delay={0.05}>
        <p
          className="text-ghost-white font-light mb-10"
          style={{
            fontSize: 'var(--text-caption)',
            fontFamily: 'var(--font-display, var(--font-body))',
            letterSpacing: '0.01em',
          }}
        >
          Built to deliver.
        </p>
      </ScrollReveal>
      <ScrollReveal delay={0.1}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 max-w-4xl">
          {items.map((item, i) => (
            <div key={i} className="flex gap-5 py-5 border-t border-pewter/20 items-start">
              <span
                className="shrink-0 text-electric-lime font-mono tracking-wider"
                style={{ fontSize: '10px', paddingTop: '3px' }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="text-body-sm text-ghost-white leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </ScrollReveal>
    </>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ui/WhyChooseSNT.tsx
git commit -m "feat: swap lime/white heading sizes in WhyChooseSNT"
```

---

## Task 3: Swap Heading Sizes in About Page (3 Sections)

**Files:**
- Modify: `frontend/src/app/about/page.tsx`

**Rule for each section:**
- Lime `<p>`: remove `text-caption` → add `style={{ fontSize: 'var(--text-heading-sm)', fontWeight: 300 }}`, change `mb-6` → `mb-3`
- White `SplitHeadline`: replace with `<p className="text-ghost-white font-light mb-10" style={{ fontSize: 'var(--text-caption)', fontFamily: 'var(--font-display, var(--font-body))', letterSpacing: '0.01em' }}>` with same text

Three sections to update:

**Section A — Company History** (has `h1` SplitHeadline + `mb-12`)

Find:
```tsx
<ScrollReveal>
  <p className="text-caption text-electric-lime tracking-widest uppercase mb-6">Company History</p>
</ScrollReveal>
<SplitHeadline
  text="We build nights worth remembering."
  as="h1"
  className="text-ghost-white font-light mb-12 max-w-4xl"
  style={{ fontSize: 'var(--text-heading-sm)' }}
/>
```

Replace with:
```tsx
<ScrollReveal>
  <p
    className="text-electric-lime tracking-widest uppercase mb-3"
    style={{ fontSize: 'var(--text-heading-sm)', fontWeight: 300 }}
  >
    Company History
  </p>
</ScrollReveal>
<p
  className="text-ghost-white font-light mb-12 max-w-4xl"
  style={{
    fontSize: 'var(--text-caption)',
    fontFamily: 'var(--font-display, var(--font-body))',
    letterSpacing: '0.01em',
  }}
>
  We build nights worth remembering.
</p>
```

**Section B — Mission & Vision** (has `h2` SplitHeadline + `mb-12`)

Find:
```tsx
<ScrollReveal>
  <p className="text-caption text-electric-lime tracking-widest uppercase mb-6">Mission &amp; Vision</p>
</ScrollReveal>
<SplitHeadline
  text="What we stand for."
  as="h2"
  className="text-ghost-white font-light mb-12"
  style={{ fontSize: 'var(--text-heading-sm)' }}
/>
```

Replace with:
```tsx
<ScrollReveal>
  <p
    className="text-electric-lime tracking-widest uppercase mb-3"
    style={{ fontSize: 'var(--text-heading-sm)', fontWeight: 300 }}
  >
    Mission &amp; Vision
  </p>
</ScrollReveal>
<p
  className="text-ghost-white font-light mb-12"
  style={{
    fontSize: 'var(--text-caption)',
    fontFamily: 'var(--font-display, var(--font-body))',
    letterSpacing: '0.01em',
  }}
>
  What we stand for.
</p>
```

**Section C — Core Values** (has `h2` SplitHeadline + `mb-12`)

Find:
```tsx
<ScrollReveal>
  <p className="text-caption text-electric-lime tracking-widest uppercase mb-6">Core Values</p>
</ScrollReveal>
<SplitHeadline
  text="What drives us."
  as="h2"
  className="text-ghost-white font-light mb-12"
  style={{ fontSize: 'var(--text-heading-sm)' }}
/>
```

Replace with:
```tsx
<ScrollReveal>
  <p
    className="text-electric-lime tracking-widest uppercase mb-3"
    style={{ fontSize: 'var(--text-heading-sm)', fontWeight: 300 }}
  >
    Core Values
  </p>
</ScrollReveal>
<p
  className="text-ghost-white font-light mb-12"
  style={{
    fontSize: 'var(--text-caption)',
    fontFamily: 'var(--font-display, var(--font-body))',
    letterSpacing: '0.01em',
  }}
>
  What drives us.
</p>
```

- [ ] **Step 1: Apply all three section replacements** as described above in `frontend/src/app/about/page.tsx`.

- [ ] **Step 2: Remove unused SplitHeadline import** if no other SplitHeadline remains on the page.

Check whether `SplitHeadline` is used anywhere else in `about/page.tsx` (e.g. in the Team section). If the import is now unused, remove it:

```tsx
// Remove this line if no SplitHeadline remains:
import SplitHeadline from '@/components/ui/SplitHeadline'
```

- [ ] **Step 3: TypeScript check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/about/page.tsx
git commit -m "feat: swap lime/white heading sizes across About page sections"
```

---

## Self-Review

**Spec coverage:**
- ✓ Remove About teaser from homepage → Task 1
- ✓ WhyChooseSNT size swap → Task 2
- ✓ About page 3 sections swapped → Task 3
- ✓ Excluded sections (Upcoming Events, Mission/Vision inner boxes, Core Values numbered items) → not touched by any task

**Placeholder scan:** None found.

**Type consistency:** No new types introduced. All className/style patterns follow existing conventions in the codebase.
