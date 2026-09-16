'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import PersistentLogo from '@/components/layout/PersistentLogo'
import BottomNav from '@/components/layout/BottomNav'
import { useLogoSettled } from '@/components/layout/LogoContext'

export default function Navbar() {
  const pathname    = usePathname()
  const isHome      = pathname === '/'
  const { settled } = useLogoSettled()
  const [glowActive, setGlowActive] = useState(false)

  // Glow activates on first scroll past 16 px — one-shot, never reverses.
  // On the homepage the glow is additionally gated on `settled` (logo has
  // reached its top-centre resting position); on other pages the scroll
  // threshold alone is sufficient.
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

  const showGlow = isHome ? settled : glowActive

  return (
    <>
      {/* ── Fixed header — logo centred, floating pill nav below ───── */}
      <header
        className="fixed top-0 left-0 right-0 z-[200] flex flex-col items-center pt-4 pb-3"
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

        {/* Floating pill nav — inline variant of BottomNav sits directly
            under the logo; fades in once the logo settles (home) or
            immediately (all other pages).                              */}
        <div style={{ marginTop: '0.875rem' }}>
          <BottomNav inline />
        </div>

        {/* Lime under-glow — anchors the header, reflects up through
            the pill nav and into the settled logo above.              */}
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
    </>
  )
}
