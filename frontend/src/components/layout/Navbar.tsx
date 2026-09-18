'use client'

import { usePathname } from 'next/navigation'
import PersistentLogo from '@/components/layout/PersistentLogo'
import { useLogoSettled } from '@/components/layout/LogoContext'
import BottomNav from '@/components/layout/BottomNav'
import TargetCursor from '@/components/layout/TargetCursor'

export default function Navbar() {
  const pathname    = usePathname()
  const isHome      = pathname === '/'
  const { settled } = useLogoSettled()

  return (
    <>
      {/* ── Site-wide targeting cursor ─────────────────────────────── */}
      <TargetCursor
        targetSelector=".cursor-target"
        cursorColor="#d3fd50"
        cursorColorOnTarget="#ffffff"
        spinDuration={2}
        hoverDuration={0.2}
        hideDefaultCursor={true}
        parallaxOn={true}
      />

      {/* ── Fixed header — logo only, single row ─────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-center pt-4 pb-3"
        style={{
          background: (isHome && !settled) ? 'transparent' : 'var(--color-absolute-zero)',
          transition: 'background 0.5s ease',
        }}
      >
        {/* Logo — hidden on home until the intro animation settles */}
        <div
          style={{
            visibility: (isHome && !settled) ? 'hidden' : 'visible',
            position:   'relative',
            zIndex:     2,
          }}
        >
          <PersistentLogo />
        </div>
      </header>

      {/* ── Floating bottom-center pill nav ───────────────────────── */}
      <BottomNav />
    </>
  )
}
