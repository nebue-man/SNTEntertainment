'use client'

import { usePathname } from 'next/navigation'
import VisitorClock from '@/components/layout/VisitorClock'
import PersistentLogo, { LOGO_REST_LEFT } from '@/components/layout/PersistentLogo'
import BottomNav from '@/components/layout/BottomNav'
import { useLogoSettled } from '@/components/layout/LogoContext'

export default function Navbar() {
  const pathname      = usePathname()
  const isHome        = pathname === '/'
  const { settled }   = useLogoSettled()

  return (
    <>
      {/* ── Unified header row — logo left, timestamp right ───────────
          Both elements share the same flex row so they are always
          vertically aligned at the same height.
          On the home page the logo slot is hidden while HeroIntro's
          scroll animation is active (settled=false); once the logo
          reaches its resting position (settled=true) the header logo
          appears at exactly the same coordinates for a seamless
          handoff.  py-4 matches LOGO_REST_TOP so the logo's top edge
          sits at 16px from the viewport top.                          */}
      <header
        className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-between py-4"
        style={{ paddingLeft: LOGO_REST_LEFT, paddingRight: 'var(--headline-padding-x)' }}
      >
        <div style={{ visibility: (isHome && !settled) ? 'hidden' : 'visible', alignSelf: 'flex-start' }}>
          <PersistentLogo />
        </div>
        <VisitorClock />
      </header>

      {/* ── Bottom floating navigation bar ─────────────────────────── */}
      <BottomNav />
    </>
  )
}
