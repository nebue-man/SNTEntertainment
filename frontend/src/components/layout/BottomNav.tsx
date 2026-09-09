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
    label: 'Past Events',
    href:  '/events/past',
    icon:  (
      <>
        <span style={labelStyle} className="hidden lg:inline">PAST EVENTS</span>
        <span style={labelStyle} className="lg:hidden">PAST</span>
      </>
    ),
  },
  {
    label: 'About',
    href:  '/about',
    icon:  <span style={labelStyle}>ABOUT</span>,
  },
]

export default function BottomNav() {
  const pathname      = usePathname()
  const router        = useRouter()
  const [mounted, setMounted] = useState(false)
  const { settled }   = useLogoSettled()

  useEffect(() => { setMounted(true) }, [])

  function isActive(href: string) {
    return href === '/' ? pathname === '/' : pathname.startsWith(href)
  }

  if (!mounted) return null

  const dockItems = NAV_ITEMS.map(({ label, href, icon }) => ({
    icon,
    label,
    className: isActive(href) ? 'active' : '',
    onClick:   () => router.push(href),
  }))

  // On the home page the dock is hidden until the logo settles into the
  // header (scrollProgress >= 1). On all other pages it's always visible.
  const isHome  = pathname === '/'
  const visible = !isHome || settled

  return (
    <div
      style={{
        opacity:       visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition:    'opacity 0.5s ease-out',
      }}
    >
      <Dock
        items={dockItems}
        panelHeight={48}
        baseItemSize={40}
        magnification={54}
        distance={150}
        dockHeight={160}
        textMode
        showTooltips={false}
      />
    </div>
  )
}
