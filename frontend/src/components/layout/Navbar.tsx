'use client'

import { usePathname } from 'next/navigation'
import AmbientClock from '@/components/layout/AmbientClock'
import PersistentLogo from '@/components/layout/PersistentLogo'
import { useLogoSettled } from '@/components/layout/LogoContext'
import BottomNav from '@/components/layout/BottomNav'

export default function Navbar() {
  const pathname = usePathname()
  const isHome   = pathname === '/'
  const { settled } = useLogoSettled()

  return (
    <>
      {/* ── Header — ambient clock left, logo centered ────────────────
          Three-column grid keeps the logo truly centered on the full
          viewport width regardless of clock text length. The right cell
          is intentionally empty to mirror the left cell's 1fr weight. */}
      <header
        className="fixed top-0 left-0 right-0 z-[200] grid items-center py-4"
        style={{ gridTemplateColumns: '1fr auto 1fr' }}
      >
        {/* Left — ambient timestamp */}
        <div style={{ paddingLeft: 'var(--headline-padding-x)' }}>
          <AmbientClock />
        </div>

        {/* Center — logo (hidden on homepage while intro animation is active) */}
        <div className="flex justify-center">
          {(!isHome || settled) && <PersistentLogo />}
        </div>

        {/* Right — empty mirror cell keeps logo centered */}
        <div />
      </header>

      {/* ── Bottom floating navigation bar ────────────────────────── */}
      <BottomNav />
    </>
  )
}
