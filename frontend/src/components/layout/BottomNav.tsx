'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Dock from './Dock'
import { useLogoSettled } from './LogoContext'

const labelStyle: React.CSSProperties = {
  fontSize:        10,
  fontWeight:      400,
  letterSpacing:   '0.13em',
  textTransform:   'uppercase',
  fontFamily:      'var(--font-body)',
  whiteSpace:      'nowrap',
  color:           'inherit',
}

const NAV_ITEMS = [
  {
    label: 'Home',
    href:  '/',
    icon:  <span style={labelStyle}>HOME</span>,
  },
  {
    label: 'Upcoming',
    href:  '/events/upcoming',
    icon:  <span style={labelStyle}>UPCOMING</span>,
  },
  {
    label: 'Past',
    href:  '/events/past',
    icon:  <span style={labelStyle}>PAST</span>,
  },
  {
    label: 'About',
    href:  '/about',
    icon:  <span style={labelStyle}>ABOUT</span>,
  },
]

// Floating pill nav, fixed to the bottom of the viewport — overlays whatever
// content (hero or otherwise) is beneath it rather than sitting in normal
// document flow. Active tab is driven by the current route.
//
// Visibility is synced to the same `settled` state (LogoContext) that drives
// the hero logo's move-to-top-left scroll animation, rather than an
// independent scroll threshold — so the nav appears at exactly the moment
// the logo finishes settling into the header, and hides again if the user
// scrolls back up past that point. On non-home pages there's no hero/logo
// animation to sync to, so the nav is simply always visible there (mirrors
// how Navbar shows the settled header logo on those pages).
export default function BottomNav() {
  const pathname    = usePathname()
  const router      = useRouter()
  const { settled } = useLogoSettled()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  function isActive(href: string) {
    return href === '/' ? pathname === '/' : pathname.startsWith(href)
  }

  if (!mounted) return null

  const isHome  = pathname === '/'
  const visible = !isHome || settled

  const dockItems = NAV_ITEMS.map(({ label, href, icon }) => ({
    icon,
    label,
    className: isActive(href) ? 'active' : '',
    onClick:   () => router.push(href),
  }))

  return (
    <Dock
      items={dockItems}
      panelHeight={44}
      baseItemSize={40}
      magnification={54}
      distance={150}
      dockHeight={160}
      textMode
      showTooltips={false}
      style={{
        opacity:       visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition:    'opacity 0.4s ease',
      }}
    />
  )
}
