'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

// ── Shared settled-state constants ─────────────────────────────────────────────
// These are the authoritative values for the logo's resting position and size.
// HeroIntro imports them so its animation endpoint matches exactly, preventing
// visual drift between the animated and static versions.

// ── Shared settled-state constants ─────────────────────────────────────────────
// LOGO_REST_TOP: matches the header's py-4 top padding (16px), so fixedLogoRef
//   in HeroIntro perfectly overlaps the in-header logo during the crossfade.
// LOGO_REST_H: the logo's rendered height inside the unified header row.
//   At 80px it is visually prominent (1.8× the hamburger button height) while
//   fitting cleanly within the 112px header (80 + 2×16px py-4 padding).
export const LOGO_REST_TOP = 16   // px — must equal the header's top padding
export const LOGO_REST_H   = 80   // px — prominent in-header logo size
export const LOGO_FILTER   =
  'drop-shadow(0 2px 10px rgba(0,0,0,0.9)) drop-shadow(0 0 32px rgba(0,0,0,0.55))'

// Renders the SNT logo as a link — used inside the unified header's center column.
// The parent (Navbar header) handles all positioning; this component is just content.
export default function PersistentLogo() {
  const pathname = usePathname()

  function handleClick() {
    // Set a one-shot sessionStorage flag so HeroIntro skips its large-to-small
    // intro animation on the next homepage mount, landing directly in the settled
    // state. Only written when navigating AWAY from "/" — clicking while already
    // on the homepage is a Next.js no-op (no remount), so writing the flag there
    // would leave it stranded and wrongly skip the intro on the next direct visit.
    if (pathname !== '/') {
      sessionStorage.setItem('snt-skip-intro', '1')
    }
  }

  return (
    <Link href="/" aria-label="SNT home" onClick={handleClick}>
      <Image
        src="/logo-white.png"
        alt="SNT Events"
        width={LOGO_REST_H}
        height={LOGO_REST_H}
        style={{ height: LOGO_REST_H, width: 'auto', objectFit: 'contain', filter: LOGO_FILTER }}
        priority
      />
    </Link>
  )
}
