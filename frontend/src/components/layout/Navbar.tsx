'use client'

import { usePathname } from 'next/navigation'
import VisitorClock from '@/components/layout/VisitorClock'
import PersistentLogo, { LOGO_REST_TOP, LOGO_REST_LEFT } from '@/components/layout/PersistentLogo'
import BottomNav from '@/components/layout/BottomNav'

export default function Navbar() {
  const pathname = usePathname()
  const isHome   = pathname === '/'

  return (
    <>
      {/* ── Fixed logo — non-home pages only ──────────────────────────
          On the home page HeroIntro owns and animates the logo.
          On every other route PersistentLogo sits at the same resting
          coordinates so the brand mark is always at top-left.         */}
      {!isHome && (
        <div
          style={{
            position:      'fixed',
            top:           LOGO_REST_TOP,
            left:          LOGO_REST_LEFT,
            zIndex:        201,
            pointerEvents: 'auto',
          }}
        >
          <PersistentLogo />
        </div>
      )}

      {/* ── Header — visitor clock pinned to top-right ────────────────
          justify-end pushes the single label to the right edge.
          paddingRight mirrors the design system's headline rhythm.    */}
      <header
        className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-end py-4"
        style={{ paddingRight: 'var(--headline-padding-x)' }}
      >
        <VisitorClock />
      </header>

      {/* ── Bottom floating navigation bar ─────────────────────────── */}
      <BottomNav />
    </>
  )
}
