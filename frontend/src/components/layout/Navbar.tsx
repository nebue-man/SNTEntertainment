'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import PersistentLogo, {
  LOGO_REST_TOP,
  LOGO_REST_LEFT,
} from '@/components/layout/PersistentLogo'
import { useLogoSettled } from '@/components/layout/LogoContext'
import GooeyNav from '@/components/layout/GooeyNav'
import TargetCursor from '@/components/layout/TargetCursor'

const NAV_ROUTES = [
  { label: 'Home',        href: '/' },
  { label: 'Upcoming',    href: '/events/upcoming' },
  { label: 'Past Events', href: '/events/past' },
  { label: 'About',       href: '/about' },
]

function getActiveIndex(pathname: string): number {
  if (pathname === '/') return 0
  if (pathname.startsWith('/events/upcoming')) return 1
  if (pathname.startsWith('/events/past')) return 2
  if (pathname.startsWith('/about')) return 3
  return 0
}

export default function Navbar() {
  const pathname    = usePathname()
  const router      = useRouter()
  const isHome      = pathname === '/'
  const { settled } = useLogoSettled()

  const [glowActive,  setGlowActive]  = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)

  const activeIndex = useMemo(() => getActiveIndex(pathname), [pathname])

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

  // Close mobile overlay on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  const showGlow   = isHome ? settled : glowActive
  const navVisible = !isHome || settled

  // Items include onClick for client-side routing (prevents full-page reload)
  const navItems = useMemo(
    () => NAV_ROUTES.map(r => ({ ...r, onClick: () => router.push(r.href) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

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

      {/* ── Fixed header ──────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-between"
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

        {/* Desktop nav — top-right (hidden on mobile) */}
        <div
          className="nav-desktop"
          style={{
            opacity:    navVisible ? 1 : 0,
            transition: 'opacity 0.5s ease',
          }}
        >
          <GooeyNav
            items={navItems}
            activeIndex={activeIndex}
          />
        </div>

        {/* Mobile hamburger (visible on mobile only) */}
        <button
          className="nav-mobile"
          aria-label="Open navigation"
          onClick={() => setMobileOpen(true)}
          style={{
            opacity:    navVisible ? 1 : 0,
            transition: 'opacity 0.5s ease',
            alignItems: 'center',
            padding:    '8px',
            color:      'rgba(255,255,255,0.8)',
          }}
        >
          <HamburgerIcon />
        </button>

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

      {/* ── Mobile full-screen overlay ─────────────────────────────── */}
      {mobileOpen && (
        <MobileMenu
          activeIndex={activeIndex}
          onClose={() => setMobileOpen(false)}
          onNavigate={(href) => router.push(href)}
        />
      )}
    </>
  )
}

// ── Sub-components ────────────────────────────────────────────────

function HamburgerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
      <line x1="3" y1="6"  x2="21" y2="6"  />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
      <line x1="4" y1="4"   x2="20" y2="20" />
      <line x1="20" y1="4"  x2="4"  y2="20" />
    </svg>
  )
}

function MobileMenuItem({
  label, href, active, onClick,
}: {
  label: string; href: string; active: boolean; onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily:     'var(--font-body)',
        fontSize:       'clamp(2rem, 9vw, 3.5rem)',
        fontWeight:     300,
        letterSpacing:  '-0.01em',
        lineHeight:     1.1,
        color:          (active || hovered) ? 'var(--color-electric-lime)' : 'rgba(255,255,255,0.65)',
        transition:     'color 0.2s ease',
        background:     'none',
        cursor:         'pointer',
        textAlign:      'center',
      }}
    >
      {label}
    </button>
  )
}

function MobileMenu({
  activeIndex,
  onClose,
  onNavigate,
}: {
  activeIndex: number
  onClose: () => void
  onNavigate: (href: string) => void
}) {
  return (
    <div
      className="fixed inset-0 z-[300] flex flex-col"
      style={{
        background: 'var(--color-absolute-zero)',
        animation:  'nav-fade-in 0.25s ease both',
      }}
    >
      {/* Top bar — mirrors header layout */}
      <div
        className="flex items-center justify-between"
        style={{
          paddingTop:    `${LOGO_REST_TOP}px`,
          paddingBottom: `${LOGO_REST_TOP}px`,
          paddingLeft:   `${LOGO_REST_LEFT}px`,
          paddingRight:  `${LOGO_REST_LEFT}px`,
        }}
      >
        <PersistentLogo />
        <button
          aria-label="Close navigation"
          onClick={onClose}
          style={{ color: 'rgba(255,255,255,0.8)', display: 'flex', padding: '8px' }}
        >
          <CloseIcon />
        </button>
      </div>

      {/* Lime rule */}
      <div style={{ height: 1, background: 'rgba(211,253,80,0.18)', margin: '0 24px' }} />

      {/* Nav items — vertically centred */}
      <nav className="flex-1 flex flex-col items-center justify-center gap-6">
        {NAV_ROUTES.map((item, i) => (
          <MobileMenuItem
            key={item.href}
            label={item.label}
            href={item.href}
            active={i === activeIndex}
            onClick={() => onNavigate(item.href)}
          />
        ))}
      </nav>

      {/* Bottom copyright */}
      <p
        style={{
          textAlign:     'center',
          fontSize:      '10px',
          letterSpacing: '0.05em',
          color:         'rgba(255,255,255,0.18)',
          padding:       `${LOGO_REST_LEFT}px`,
        }}
      >
        © {new Date().getFullYear()} SNT Entertainments and Management (Pvt) Ltd.
      </p>
    </div>
  )
}
