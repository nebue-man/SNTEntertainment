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
  { label: 'Upcoming Event', href: '/events/upcoming' },
  { label: 'Past Event',     href: '/events/past' },
  { label: 'About Us',        href: '/about' },
]

export default function Navbar() {
  const pathname    = usePathname()
  const isHome      = pathname === '/'
  const { settled } = useLogoSettled()
  const [mounted,   setMounted]  = useState(false)
  const [menuOpen,  setMenuOpen] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { setMenuOpen(false) }, [pathname])

  function isActive(href: string) {
    return href === '/' ? pathname === '/' : pathname.startsWith(href)
  }

  return (
    <>
      {/* ── Unified fixed header bar ────────────────────────────────────
          Logo left, ambient clock right. Solid black bar, same on every
          page — homepage hero video begins cleanly below it. */}
      <header
        className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-between py-4"
        style={{
          paddingLeft:  LOGO_REST_LEFT,
          paddingRight: 'var(--headline-padding-x)',
          background:   'var(--color-absolute-zero)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {/* Logo — hidden on home until the intro animation settles */}
        <div style={{ visibility: (isHome && !settled) ? 'hidden' : 'visible', alignSelf: 'flex-start' }}>
          <PersistentLogo />
        </div>

        {/* Ambient clock — sole right-side element */}
        <VisitorClock />
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
