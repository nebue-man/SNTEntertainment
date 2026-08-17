'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import VisitorClock from '@/components/layout/VisitorClock'
import PersistentLogo, { LOGO_REST_LEFT } from '@/components/layout/PersistentLogo'
import BottomNav from '@/components/layout/BottomNav'
import { useLogoSettled } from '@/components/layout/LogoContext'

const NAV_LINKS = [
  { label: 'Home',            href: '/' },
  { label: 'Upcoming Events', href: '/events/upcoming' },
  { label: 'Past Events',     href: '/events/past' },
  { label: 'About Us',        href: '/about' },
]

export default function Navbar() {
  const pathname    = usePathname()
  const isHome      = pathname === '/'
  const { settled } = useLogoSettled()
  const [mounted,   setMounted]   = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Close overlay on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  function isActive(href: string) {
    return href === '/' ? pathname === '/' : pathname.startsWith(href)
  }

  return (
    <>
      {/* ── Unified fixed header bar ────────────────────────────────────
          Three elements in one row: logo (left), clock + menu button (right).
          Gradient scrim fades from opaque black at the top edge to transparent
          at the bottom so scrolling content doesn't clash with the header. */}
      <header
        className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-between py-4"
        style={{
          paddingLeft:  LOGO_REST_LEFT,
          paddingRight: 'var(--headline-padding-x)',
          background:   'linear-gradient(to bottom, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0) 100%)',
        }}
      >
        {/* Logo — hidden on home until the intro animation settles */}
        <div style={{ visibility: (isHome && !settled) ? 'hidden' : 'visible', alignSelf: 'flex-start' }}>
          <PersistentLogo />
        </div>

        {/* Right cluster: ambient clock + menu toggle */}
        <div className="flex items-center gap-5">
          <VisitorClock />
          <button
            onClick={() => setMenuOpen(prev => !prev)}
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            className="text-caption tracking-widest uppercase font-light transition-colors duration-200"
            style={{ color: menuOpen ? 'var(--color-ghost-white)' : 'rgba(255,255,255,0.45)' }}
          >
            {menuOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </header>

      {/* ── Full-screen nav overlay ────────────────────────────────────
          z-[199]: sits below the header (z-200) so the Close button
          always renders on top of the overlay. */}
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
