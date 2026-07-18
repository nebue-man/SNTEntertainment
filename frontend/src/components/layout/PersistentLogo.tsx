import Link from 'next/link'
import Image from 'next/image'

// ── Shared settled-state constants ─────────────────────────────────────────────
// These are the authoritative values for the logo's resting position and size.
// HeroIntro imports them so its animation endpoint matches exactly, preventing
// visual drift between the animated and static versions.

export const LOGO_REST_TOP = 16   // px from top of viewport — py-4 grid unit
export const LOGO_REST_H   = 112  // px — h-28; the logo's rendered size at rest
export const LOGO_FILTER   =
  'drop-shadow(0 2px 10px rgba(0,0,0,0.9)) drop-shadow(0 0 32px rgba(0,0,0,0.55))'

interface Props {
  // Pass href="/" on non-home pages to make the logo a home link.
  // Omit (or pass undefined) on the homepage — no navigation needed.
  href?: string
}

// Renders the SNT logo in its settled top-center position.
// On the homepage this appears once the scroll animation completes.
// On all other pages it appears immediately and is always visible.
export default function PersistentLogo({ href }: Props) {
  const image = (
    <Image
      src="/logo-white.png"
      alt="SNT Events"
      width={LOGO_REST_H}
      height={LOGO_REST_H}
      className="h-28 w-auto object-contain"
      style={{ filter: LOGO_FILTER }}
      priority
    />
  )

  return (
    <div
      style={{
        position:       'fixed',
        top:            0,
        left:           0,
        right:          0,
        display:        'flex',
        justifyContent: 'center',
        paddingTop:     LOGO_REST_TOP,
        zIndex:         205,
        pointerEvents:  'none',
      }}
    >
      {href ? (
        <Link
          href={href}
          aria-label="SNT home"
          style={{ pointerEvents: 'auto' }}
        >
          {image}
        </Link>
      ) : (
        image
      )}
    </div>
  )
}
