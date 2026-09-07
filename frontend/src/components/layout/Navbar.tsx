'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import PersistentLogo from '@/components/layout/PersistentLogo'
import BottomNav from '@/components/layout/BottomNav'
import { useLogoSettled } from '@/components/layout/LogoContext'

const NAV_LINKS = [
  { label: 'Home',            href: '/' },
  { label: 'Upcoming Event', href: '/events/upcoming' },
  { label: 'Past Event',     href: '/events/past' },
  { label: 'About Us',        href: '/about' },
]

export default function Navbar() {
  const pathname    = usePathname()
  const isHome      = pathname === '/'
  const { settled } = useLogoSettled()
  const [mounted,    setMounted]    = useState(false)
  const [menuOpen,   setMenuOpen]   = useState(false)
  const [glowActive, setGlowActive] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { setMenuOpen(false) }, [pathname])

  // Glow activates on first scroll past 16 px — one-shot, never reverses.
  // On the homepage the glow is additionally gated on `settled` (logo has
  // reached its top-centre resting position); on other pages the logo is
  // already at rest so the scroll threshold alone is sufficient.
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

  // Homepage: glow only once the hero scroll animation has fully settled
  // so the underglow and the resting logo arrive at the same moment.
  // Other pages: show as soon as the user has scrolled at all.
  const showGlow = isHome ? settled : glowActive

  function isActive(href: string) {
    return href === '/' ? pathname === '/' : pathname.startsWith(href)
  }

  return (
    <>
      {/* ── Unified fixed header — logo centred, no flanking elements ─ */}
      <header
        className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-center py-4"
        style={{ background: 'var(--color-absolute-zero)' }}
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

        {/* Lime under-glow — soft radial light beneath the settled logo.
            Fades in once the logo reaches its top-centre resting position. */}
        <div
          aria-hidden="true"
          style={{
            position:      'absolute',
            bottom:        0,
            left:          '50%',
            transform:     'translateX(-50%)',
            width:           300,
            height:          1,
            background:      'rgba(211,253,80,0.85)',
            boxShadow:       '0 0 12px 3px rgba(211,253,80,0.4), 0 0 32px 10px rgba(211,253,80,0.15), 0 0 64px 24px rgba(211,253,80,0.06)',
            maskImage:       'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)',
            opacity:       showGlow ? 1 : 0,
            transition:    'opacity 0.9s ease',
            pointerEvents: 'none',
          }}
        />
      </header>

      {/* ── Full-screen nav overlay (untriggered — reserved for future use) ──
          Navigation is handled by the BottomNav pill. This overlay and its
          state are kept in place for potential reactivation. */}
      {mounted && menuOpen && createPortal(
        <nav
          aria-label="Site navigation"
          className="fixed inset-0 z-[199] flex flex-col items-center justify-center gap-10"
          style={{ background: 'rgba(0,0,0,0.97)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
        >
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={[
                'text-body-lg font-light tracking-[0.18em] uppercase transition-colors duration-200',
                isActive(href)
                  ? 'text-electric-lime'
                  : 'text-ghost-white/50 hover:text-ghost-white',
              ].join(' ')}
            >
              {label}
            </Link>
          ))}
        </nav>,
        document.body
      )}

      {/* ── Bottom floating navigation pill ──────────────────────────── */}
      <BottomNav />
    </>
  )
}
