'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { label: 'Home',            short: 'Home',     href: '/' },
  { label: 'Upcoming Events', short: 'Upcoming', href: '/events/upcoming' },
  { label: 'Past Events',     short: 'Past',     href: '/events/past' },
  { label: 'About Us',        short: 'About',    href: '/about' },
]

export default function BottomNav() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  function isActive(href: string) {
    return href === '/' ? pathname === '/' : pathname.startsWith(href)
  }

  const nav = (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[150] flex items-center gap-0.5 p-1.5"
      style={{
        background:           'rgba(8, 8, 8, 0.72)',
        backdropFilter:       'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border:               '1px solid rgba(255, 255, 255, 0.09)',
        borderRadius:         '9999px',
        whiteSpace:           'nowrap',
        boxShadow:            '0 4px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      {NAV_LINKS.map(({ label, short, href }) => {
        const active = isActive(href)
        return (
          <Link
            key={href}
            href={href}
            className={[
              'rounded-full transition-colors duration-200',
              'text-[12px] tracking-[0.09em] uppercase font-normal',
              'px-3 py-2 sm:px-4 sm:py-2',
              active
                ? 'text-electric-lime'
                : 'text-white/40 hover:text-white/75',
            ].join(' ')}
            style={active
              ? { background: 'rgba(211, 253, 80, 0.07)' }
              : undefined
            }
          >
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{short}</span>
          </Link>
        )
      })}
    </nav>
  )

  if (!mounted) return null
  return createPortal(nav, document.body)
}
