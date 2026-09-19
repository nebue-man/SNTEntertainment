# Footer — Design Spec

Portable reference for reimplementing the SNT site footer elsewhere. Source: `frontend/src/components/layout/Footer.tsx`.

## 1. Structure

```
──────────────────── (top lime glow line) ────────────────────

                        CONTACT US                    ← eyebrow label

              [📞] Hotline: +94 70 554 2542           ← hotline row

   [IG] [FB] [TikTok] [WhatsApp]  [Mail]               ← icon badge row

─ ─ ─ ─ ─ ─ ─ ─ ─ (dashed divider, full width) ─ ─ ─ ─ ─ ─ ─ ─ ─

        © 2026 SNT Entertainments and Management       ← copyright
              (Pvt) Ltd. All rights reserved.
```

Everything is centered (`flex-col items-center`).

## 2. Icons

Two different sources:

**Social icons — [react-icons](https://react-icons.github.io/react-icons/) `react-icons/fa`** (`npm install react-icons`):

| Platform | Icon name |
|---|---|
| Instagram | `FaInstagram` |
| Facebook | `FaFacebookF` |
| TikTok | `FaTiktok` |
| WhatsApp | `FaWhatsapp` |

**Phone & Mail — custom inline SVGs** (not from a library; portable as raw SVG paths):

```html
<!-- Phone -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.03z" />
</svg>

<!-- Mail -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
  <rect x="2" y="4" width="20" height="16" rx="2" />
  <path d="m2 7 10 7 10-7" />
</svg>
```

## 3. Icon Styling

### Phone icon (in the hotline row)
- Size: `18×18px`
- Color: always `#d3fd50` (lime) — not hover-dependent, unlike everything else in the footer
- `flex-shrink: 0`

### Social icon badges (Instagram / Facebook / TikTok / WhatsApp)
- Badge: `44×44px`, `border-radius: 10px`, `display: flex; align-items: center; justify-content: center`
- Badge background: `rgba(255,255,255,0.06)` default → `{hoverColor}1A` on hover (the platform's brand color at ~10% alpha, hex+alpha syntax)
- Icon: `18px`, color `rgba(255,255,255,0.75)` default → `hoverColor` (platform brand color, solid) on hover
- Hover adds `filter: drop-shadow(0 0 8px {glowColor})` — a soft colored glow behind the icon
- Transition: `color 0.2s ease, background 0.2s ease, filter 0.2s ease`

| Platform | Hover color | Glow (drop-shadow) |
|---|---|---|
| Instagram | `#E1306C` | `rgba(225,48,108,0.4)` |
| Facebook | `#1877F2` | `rgba(24,119,242,0.4)` |
| TikTok | `#ffffff` | `rgba(255,255,255,0.25)` |
| WhatsApp | `#25D366` | `rgba(37,211,102,0.4)` |

### Mail icon badge
Same `44×44px` / `border-radius: 10px` badge treatment as social icons, but uses the site's lime accent instead of a brand color:
- Background: `rgba(255,255,255,0.06)` default → `rgba(211,253,80,0.1)` on hover
- Icon: `18px`, color `rgba(255,255,255,0.75)` default → `#d3fd50` on hover
- Hover glow: `drop-shadow(0 0 8px rgba(211,253,80,0.4))`

## 4. Typography

Font family throughout: **Montserrat** (`--font-body` in the source project — see `design2.md` for the full font-loading setup). Fallback: `ui-sans-serif, system-ui, sans-serif`.

| Element | Font size | Font weight | Letter spacing | Text transform | Color (default → hover) |
|---|---|---|---|---|---|
| "CONTACT US" eyebrow | `0.68rem` (~11px) | `700` | `0.28em` | uppercase | `rgba(255,255,255,0.55)` (static, no hover) |
| "Hotline:" label | `0.68rem` (~11px) | `400` | `0.22em` | uppercase | `rgba(255,255,255,0.45)` → `#d3fd50` |
| Phone number | `0.8rem` (~13px) | `300` | `0.08em` | none | `rgba(255,255,255,0.82)` → `#d3fd50` |
| Copyright line | `10px` | `400` (inherited) | `0.05em` | none | `rgba(255,255,255,0.25)` (static, no hover) |

The whole hotline row also gets `filter: drop-shadow(0 0 10px rgba(211,253,80,0.35))` on hover.

## 5. Colors

| Role | Value |
|---|---|
| Accent (lime) | `#d3fd50` |
| Top glow line | `rgba(211,253,80,0.7)` core, with a 3-layer soft `box-shadow` glow (`0 0 16px 4px rgba(211,253,80,0.35)`, `0 0 48px 16px rgba(211,253,80,0.12)`, `0 0 80px 32px rgba(211,253,80,0.05)`) |
| Dashed divider | `rgba(255,255,255,0.11)`, `1px dashed` |
| Icon badge background (idle) | `rgba(255,255,255,0.06)` |
| Icon color (idle) | `rgba(255,255,255,0.75)` |
| Section background | `#000000` |

## 6. Layout & Spacing

- Outer padding: `padding: 3rem` (48px) top/bottom, `var(--headline-padding-x)` (responsive, `clamp(1.5rem, 8vw, 9rem)` → 24px–144px) left/right
- Vertical rhythm: `gap: 1.25rem` (20px) between eyebrow / contact block / divider / copyright
- Contact block: `gap: 0.75rem` (12px) between hotline row and icon row
- Hotline row: `gap: 0.6rem` (~9.6px) between icon, "Hotline:" label, and number; `min-height: 44px`
- Icon row: `gap: 1.75rem` (28px) between all 5 badges (4 social + mail)
- Top glow line: `width: min(600px, 100vw)`, `height: 1px`, centered, with a mask gradient that fades it out at the 15%/85% edges (`linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)`) so it fades rather than hard-cuts

## 7. Portable CSS

```css
.footer {
  background: #000000;
  padding: 3rem clamp(1.5rem, 8vw, 9rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  font-family: 'Montserrat', ui-sans-serif, system-ui, sans-serif;
}

.footer__glow-line {
  position: absolute;
  width: min(600px, 100vw);
  height: 1px;
  background: rgba(211, 253, 80, 0.7);
  box-shadow:
    0 0 16px 4px rgba(211, 253, 80, 0.35),
    0 0 48px 16px rgba(211, 253, 80, 0.12),
    0 0 80px 32px rgba(211, 253, 80, 0.05);
  mask-image: linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%);
}

.footer__eyebrow {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
}

.footer__contact-block { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }

.footer__hotline {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-height: 44px;
  color: rgba(255, 255, 255, 0.82); /* base; label/number below override */
  transition: color 0.2s ease, filter 0.2s ease;
}
.footer__hotline:hover { filter: drop-shadow(0 0 10px rgba(211, 253, 80, 0.35)); }
.footer__hotline-icon { width: 18px; height: 18px; color: #d3fd50; flex-shrink: 0; }
.footer__hotline-label {
  font-size: 0.68rem; font-weight: 400; letter-spacing: 0.22em;
  text-transform: uppercase; color: rgba(255, 255, 255, 0.45);
  transition: color 0.2s ease;
}
.footer__hotline:hover .footer__hotline-label { color: #d3fd50; }
.footer__hotline-number {
  font-size: 0.8rem; font-weight: 300; letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.82); transition: color 0.2s ease;
}
.footer__hotline:hover .footer__hotline-number { color: #d3fd50; }

.footer__icons { display: flex; align-items: center; justify-content: center; gap: 1.75rem; }

.footer__icon-badge {
  display: flex; align-items: center; justify-content: center;
  width: 44px; height: 44px; border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.75);
  transition: color 0.2s ease, background 0.2s ease, filter 0.2s ease;
}
.footer__icon-badge svg { width: 18px; height: 18px; }
/* Per-platform hover — set --hover-color and --hover-glow per badge */
.footer__icon-badge:hover {
  background: color-mix(in srgb, var(--hover-color) 10%, transparent);
  color: var(--hover-color);
  filter: drop-shadow(0 0 8px var(--hover-glow));
}

.footer__divider { width: 100%; border-top: 1px dashed rgba(255, 255, 255, 0.11); }

.footer__copyright {
  font-size: 10px; letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.25); text-align: center;
}
```

```html
<!-- Per-badge hover color, e.g. Instagram -->
<a class="footer__icon-badge" style="--hover-color:#E1306C; --hover-glow:rgba(225,48,108,0.4)">
  <!-- FaInstagram svg -->
</a>
```

## 8. Original React source (for reference)

See `frontend/src/components/layout/Footer.tsx` in the source project — `SocialIcon`, `HotlineRow`, and `ContactItem` sub-components implement exactly the styling documented above, using inline `style` objects (hover state via local `useState`) rather than the `:hover`/CSS-variable approach shown in §7, which is provided as a framework-agnostic equivalent.
