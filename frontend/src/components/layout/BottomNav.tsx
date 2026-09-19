'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useLogoSettled } from './LogoContext'
import JellyRadio from './JellyRadio'

const NAV_VALUES = [
  { value: '/',                label: 'HOME'     },
  { value: '/events/upcoming', label: 'UPCOMING' },
  { value: '/events/past',     labelFull: 'PAST EVENTS', labelShort: 'PAST' },
  { value: '/about',           label: 'ABOUT'    },
]

export default function BottomNav() {
  const pathname  = usePathname()
  const router    = useRouter()
  const { settled } = useLogoSettled()

  const [mounted,  setMounted]  = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    setMounted(true)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (!mounted) return null

  const isHome  = pathname === '/'
  const visible = !isHome || settled

  const activeValue =
    NAV_VALUES.find(item =>
      item.value === '/' ? pathname === '/' : pathname.startsWith(item.value)
    )?.value ?? '/'

  const labelStyle: React.CSSProperties = {
    fontSize:      isMobile ? 9 : 10,
    fontWeight:    700,
    letterSpacing: isMobile ? '0.09em' : '0.13em',
    textTransform: 'uppercase',
    fontFamily:    'var(--font-body)',
  }

  const navItems = NAV_VALUES.map(item => ({
    value: item.value,
    label: 'labelFull' in item ? (
      <>
        <span style={labelStyle} className="hidden lg:inline">{item.labelFull}</span>
        <span style={labelStyle} className="lg:hidden">{item.labelShort}</span>
      </>
    ) : (
      <span style={labelStyle}>{item.label}</span>
    ),
  }))

  return (
    <div
      className="cursor-target"
      style={{
        position:             'fixed',
        bottom:               isMobile
          ? 'calc(1.25rem + env(safe-area-inset-bottom, 0px))'
          : '2rem',
        left:                 '50%',
        transform:            'translateX(-50%)',
        zIndex:               150,
        opacity:              visible ? 1 : 0,
        pointerEvents:        visible ? 'auto' : 'none',
        transition:           'opacity 0.5s ease-out',
        background:           'rgba(8, 8, 8, 0.72)',
        border:               '1px solid rgba(255, 255, 255, 0.13)',
        backdropFilter:       'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderRadius:         9999,
        boxShadow:            '0 4px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08), 0 -6px 24px rgba(211,253,80,0.07), 0 -2px 10px rgba(211,253,80,0.10)',
      }}
    >
      <JellyRadio
        items={navItems}
        value={activeValue}
        onChange={(val: string) => router.push(val)}
        chipColor="transparent"
        activeColor="#d3fd50"
        textColor="rgba(255,255,255,0.5)"
        activeTextColor="#000000"
        size={isMobile ? 'sm' : 'md'}
        gap={isMobile ? 3 : 6}
        radius={999}
        swell={0.15}
        barge={isMobile ? 2 : 3}
        shrink={0.03}
        jelly={1}
        bounce={0.18}
        stiffness={600}
        stagger={18}
        ariaLabel="Main navigation"
      />
    </div>
  )
}
