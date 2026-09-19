'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useLogoSettled } from './LogoContext'
import JellyRadio from './JellyRadio'

const labelStyle: React.CSSProperties = {
  fontSize:      10,
  fontWeight:    400,
  letterSpacing: '0.13em',
  textTransform: 'uppercase',
  fontFamily:    'var(--font-body)',
}

const NAV_ITEMS = [
  {
    value: '/',
    label: <span style={labelStyle}>HOME</span>,
  },
  {
    value: '/events/upcoming',
    label: <span style={labelStyle}>UPCOMING</span>,
  },
  {
    value: '/events/past',
    label: (
      <>
        <span style={labelStyle} className="hidden lg:inline">PAST EVENTS</span>
        <span style={labelStyle} className="lg:hidden">PAST</span>
      </>
    ),
  },
  {
    value: '/about',
    label: <span style={labelStyle}>ABOUT</span>,
  },
]

export default function BottomNav() {
  const pathname        = usePathname()
  const router          = useRouter()
  const { settled }     = useLogoSettled()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  const isHome  = pathname === '/'
  const visible = !isHome || settled

  const activeValue =
    NAV_ITEMS.find(item =>
      item.value === '/' ? pathname === '/' : pathname.startsWith(item.value)
    )?.value ?? '/'

  return (
    <div
      className="cursor-target"
      style={{
        position:             'fixed',
        bottom:               '2rem',
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
        items={NAV_ITEMS}
        value={activeValue}
        onChange={(val: string) => router.push(val)}
        chipColor="transparent"
        activeColor="#d3fd50"
        textColor="rgba(255,255,255,0.5)"
        activeTextColor="#000000"
        size="md"
        gap={6}
        radius={999}
        swell={0.15}
        barge={3}
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
