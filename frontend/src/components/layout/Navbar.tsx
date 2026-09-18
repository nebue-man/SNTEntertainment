'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import PersistentLogo, {
  LOGO_REST_TOP,
  LOGO_REST_LEFT,
} from '@/components/layout/PersistentLogo'
import { useLogoSettled } from '@/components/layout/LogoContext'
import BottomNav from '@/components/layout/BottomNav'
import TargetCursor from '@/components/layout/TargetCursor'

export default function Navbar() {
  const pathname    = usePathname()
  const isHome      = pathname === '/'
  const { settled } = useLogoSettled()

  const [glowActive, setGlowActive] = useState(false)

  // One-shot glow once the user scrolls past 16 px
  useEffect(() => {
    if (window.scrollY > 16) { setGlowActive(true); return }
    function onScroll() {
      if (window.scrollY > 16) {
        setGlowActive(true)
        window.removeEventListener('scroll', onScroll)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const showGlow   = isHome ? settled : glowActive
  const navVisible = !isHome || settled

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

      {/* ── Fixed header — logo only. Primary nav lives in the floating
          bottom pill (BottomNav) below, not in the header. ─────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-[200] flex items-center"
        style={{
          paddingTop:    `${LOGO_REST_TOP}px`,
          paddingBottom: `${LOGO_REST_TOP}px`,
          paddingLeft:   `${LOGO_REST_LEFT}px`,
          paddingRight:  `${LOGO_REST_LEFT}px`,
          background:    (isHome && !settled) ? 'transparent' : 'var(--color-absolute-zero)',
          transition:    'background 0.5s ease',
        }}
      >
        {/* Logo — top-left */}
        <div style={{ visibility: navVisible ? 'visible' : 'hidden' }}>
          <PersistentLogo />
        </div>

        {/* Lime under-glow */}
        <div
          aria-hidden="true"
          style={{
            position:        'absolute',
            bottom:          0,
            left:            '50%',
            transform:       'translateX(-50%)',
            width:           'min(520px, 90vw)',
            height:          1,
            background:      'rgba(211,253,80,0.85)',
            boxShadow:       '0 0 12px 3px rgba(211,253,80,0.4), 0 0 36px 12px rgba(211,253,80,0.15), 0 0 72px 28px rgba(211,253,80,0.06)',
            maskImage:       'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
            opacity:         showGlow ? 1 : 0,
            transition:      'opacity 0.9s ease',
            pointerEvents:   'none',
          }}
        />
      </header>

      {/* ── Floating bottom pill nav — overlays hero/page content,
          fixed to the viewport, responsive at every breakpoint. ────── */}
      <BottomNav />
    </>
  )
}
