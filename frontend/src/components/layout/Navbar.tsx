'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import GhostButton from '@/components/ui/GhostButton'
import AmbientClock from '@/components/layout/AmbientClock'
import { getUpcomingEvents, getPastEventsWithMedia } from '@/lib/api'
import { resolveMediaUrl } from '@/lib/mediaUrl'
import PersistentLogo from '@/components/layout/PersistentLogo'
import { useLogoSettled } from '@/components/layout/LogoContext'

// ── Two-line hamburger / × icon ───────────────────────────────────────────────
function MenuIcon({ asX }: { asX: boolean }) {
  const LINE_GAP = 10  // px between lines
  const LINE_H   = 2   // px line thickness
  const offset   = (LINE_GAP + LINE_H) / 2

  const lineStyle = (top: boolean): React.CSSProperties => ({
    display:         'block',
    width:           '26px',
    height:          `${LINE_H}px`,
    backgroundColor: 'currentColor',
    transformOrigin: 'center',
    transition:      'transform 0.28s cubic-bezier(0.22,1,0.36,1)',
    transform: asX
      ? `translateY(${top ? offset : -offset}px) rotate(${top ? 45 : -45}deg)`
      : 'none',
  })

  return (
    <span
      aria-hidden="true"
      style={{ display: 'flex', flexDirection: 'column', gap: `${LINE_GAP}px`, width: '26px' }}
    >
      <span style={lineStyle(true)} />
      <span style={lineStyle(false)} />
    </span>
  )
}

// ── Menu section config ───────────────────────────────────────────────────────
// Swap `src` from `null` to a real path when assets are available;
// the color placeholder block disappears automatically once src is set.
type PreviewImg  = { src: string | null; color: string; label: string }
type PreviewData = {
  type:      'single' | 'gallery' | 'event' | 'logo'
  images:    PreviewImg[]
  eventName?: string
  eventDate?: string
}

const menuSections: { label: string; href: string; preview: PreviewData }[] = [
  {
    label: 'Home',
    href:  '/',
    preview: {
      type:   'logo',
      images: [{ src: null, color: '#181818', label: 'Homepage preview' }],
    },
  },
  {
    label: 'Upcoming Events',
    href:  '/events/upcoming',
    preview: {
      type:      'event',
      eventName: 'Sound of Colombo 2026',
      eventDate: '20 Sep 2026',
      images:    [{ src: null, color: '#0f0f0f', label: 'Event image' }],
    },
  },
  {
    label: 'Past Events',
    href:  '/events/past',
    preview: {
      type:   'gallery',
      images: [
        { src: null, color: '#111111', label: 'Past event 1' },
        { src: null, color: '#161616', label: 'Past event 2' },
        { src: null, color: '#1c1c1c', label: 'Past event 3' },
      ],
    },
  },
  {
    label: 'About Us',
    href:  '/about',
    preview: {
      type:   'single',
      images: [{ src: null, color: '#141414', label: 'Team photo' }],
    },
  },
]

// ── Auto-advancing carousel index ─────────────────────────────────────────────
function useCarousel(count: number, ms = 3000) {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    if (count <= 1) return
    const id = setInterval(() => setIdx(i => (i + 1) % count), ms)
    return () => clearInterval(id)
  }, [count, ms])
  return idx
}

// ── Colored placeholder block (swap for <img> when real assets arrive) ────────
function PreviewBlock({
  img,
  style,
}: {
  img: PreviewImg
  style?: React.CSSProperties
}) {
  if (img.src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={img.src} alt={img.label} style={{ objectFit: 'cover', ...style }} />
  }
  return (
    <div
      style={{
        backgroundColor: img.color,
        border:          '1px solid rgba(211,253,80,0.07)',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        ...style,
      }}
    >
      <span style={{
        fontSize:      '9px',
        color:         'rgba(255,255,255,0.12)',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
      }}>
        {img.label}
      </span>
    </div>
  )
}

// ── Right-panel section preview ───────────────────────────────────────────────
function SectionPreview({ preview }: { preview: PreviewData }) {
  const idx = useCarousel(preview.images.length)
  const img = preview.images[idx]

  // Spinning logo — mounts when Home is active, unmounts when another item is
  // hovered. Because AnimatePresence re-mounts this subtree on every activeIdx
  // change (key={activeIdx} + mode="wait"), the rotation restarts fresh each
  // time Home becomes active — matching the other previews' reset-on-re-hover
  // behaviour.
  if (preview.type === 'logo') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <motion.img
          src="/logo-white.png"
          alt="SNT"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear', repeatType: 'loop' }}
          style={{ width: '72%', display: 'block', userSelect: 'none', pointerEvents: 'none' }}
        />
        <p style={{
          fontSize:      '11px',
          color:         '#6b6b6b',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}>
          SNT Live Events
        </p>
      </div>
    )
  }

  if (preview.type === 'event') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <p style={{
          fontSize:      'clamp(1.75rem, 3.5vw, 3rem)',
          fontWeight:    300,
          lineHeight:    1.05,
          letterSpacing: '-0.01em',
          color:         '#ffffff',
        }}>
          {preview.eventName}
        </p>
        <p style={{
          fontSize:      '11px',
          color:         '#4d4d4d',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}>
          {preview.eventDate}
        </p>
        <PreviewBlock img={img} style={{ width: '100%', aspectRatio: '3 / 2' }} />
      </div>
    )
  }

  if (preview.type === 'gallery') {
    return (
      <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
        {preview.images.map((im, i) => (
          <div key={i} style={{ flex: 1, aspectRatio: '2 / 3' }}>
            <PreviewBlock
              img={im}
              style={{
                width:      '100%',
                height:     '100%',
                opacity:    i === idx ? 1 : 0.3,
                transition: 'opacity 0.6s ease',
              }}
            />
          </div>
        ))}
      </div>
    )
  }

  // 'single'
  return <PreviewBlock img={img} style={{ width: '100%', aspectRatio: '3 / 4' }} />
}

// ── Animation variants ────────────────────────────────────────────────────────
const overlayVars: Variants = {
  closed: { opacity: 0 },
  open:   { opacity: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
}

const listVars: Variants = {
  closed: {},
  open:   { transition: { staggerChildren: 0.055, delayChildren: 0.12 } },
}

const itemVars: Variants = {
  closed: { opacity: 0, x: 40 },
  open:   { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

const previewVars: Variants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -10, transition: { duration: 0.22 } },
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Navbar() {
  const [open, setOpen]         = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const pathname = usePathname()
  const isHome   = pathname === '/'
  const { settled } = useLogoSettled()

  // Live preview data — fetched once on mount; falls back to static config until resolved
  const [upcomingLive, setUpcomingLive] = useState<{
    name: string; date: string; flyer: string | null
  } | null>(null)
  const [pastCoverSrcs, setPastCoverSrcs] = useState<(string | null)[]>([null, null, null])

  useEffect(() => {
    getUpcomingEvents()
      .then(events => {
        const e = events[0]
        if (!e) return
        setUpcomingLive({
          name:  e.title,
          date:  new Date(e.date).toLocaleDateString('en-US', {
            day: 'numeric', month: 'short', year: 'numeric',
          }),
          flyer: e.flyerUrl ?? null,
        })
      })
      .catch(() => {})

    getPastEventsWithMedia()
      .then(events => {
        const top3 = events
          .slice()
          .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime())
          .slice(0, 3)
        setPastCoverSrcs(
          top3.map(e => {
            const photo = e.media
              .filter(m => m.type === 'PHOTO')
              .sort((a, b) => a.sortOrder - b.sortOrder)[0]
            return photo ? resolveMediaUrl(photo.url) : null
          })
        )
      })
      .catch(() => {})
  }, [])

  // Merge static config with live data for a given section index.
  // Sections 1 (Upcoming) and 2 (Past Events) get real images; others pass through unchanged.
  function getLivePreview(i: number): PreviewData {
    const base = menuSections[i].preview
    if (i === 1) {
      return {
        ...base,
        eventName: upcomingLive?.name  ?? base.eventName,
        eventDate: upcomingLive?.date  ?? base.eventDate,
        images:    [{ ...base.images[0], src: upcomingLive?.flyer ?? null }],
      }
    }
    if (i === 2) {
      return {
        ...base,
        images: base.images.map((img, j) => ({ ...img, src: pastCoverSrcs[j] ?? null })),
      }
    }
    return base
  }

  // Escape key closes menu
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  // Reset active preview when menu opens
  useEffect(() => { if (open) setActiveIdx(0) }, [open])

  const close = () => setOpen(false)

  return (
    <>
      {/* ── Persistent top-center logo ────────────────────────────────────────
          Shown immediately on every non-home page.
          On the homepage it appears once the scroll animation settles (settled=true),
          at which point it replaces the animated fixedLogoRef in HeroIntro. */}
      {(!isHome || settled) && (
        <PersistentLogo href={isHome ? undefined : '/'} />
      )}

      {/* ── Persistent header — sits ABOVE the menu overlay (z-[200]) ─────── */}
      <header
        className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-end py-5 md:py-6"
        style={{ paddingLeft: 'var(--headline-padding-x)', paddingRight: 'var(--headline-padding-x)' }}
      >
        <div className="flex items-center gap-4">
          <AmbientClock />
          {/* Single toggle button — hamburger ↔ × with animated morph.
               min-h/w-[44px] ensures a WCAG-compliant tap target even
               though the icon is visually smaller; items-center on the
               button base class keeps the icon centred inside. */}
          <GhostButton
            variant="thin"
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={open}
            aria-controls="nav-menu"
            className="!py-[14px] !px-[16px] min-h-[44px] min-w-[44px]"
          >
            <MenuIcon asX={open} />
          </GhostButton>
        </div>
      </header>

      {/* ── Full-screen menu overlay ──────────────────────────────────────────*/}
      <AnimatePresence>
        {open && (
          <motion.div
            id="nav-menu"
            className="fixed inset-0 z-[100] bg-absolute-zero flex flex-col"
            variants={overlayVars}
            initial="closed"
            animate="open"
            exit="closed"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            {/* Content area starts below the persistent header */}
            <div
              className="flex-1 flex flex-col md:flex-row items-stretch pt-[88px] md:pt-[96px] pb-6 gap-8 overflow-hidden"
              style={{ paddingLeft: 'var(--headline-padding-x)', paddingRight: 'var(--headline-padding-x)' }}
            >

              {/* Left — large nav links */}
              <nav className="flex-1 flex flex-col justify-center">
                <motion.ul
                  className="list-none flex flex-col"
                  variants={listVars}
                  initial="closed"
                  animate="open"
                >
                  {menuSections.map(({ label, href }, i) => {
                    const livePreview = getLivePreview(i)
                    return (
                      <motion.li key={href} variants={itemVars}>
                        <Link
                          href={href}
                          className="group flex items-center justify-between py-3 border-b border-pewter/10 text-ghost-white font-light hover:text-electric-lime transition-colors duration-200"
                          style={{ fontSize: 'clamp(2rem, 5.5vw, 4rem)', lineHeight: 1.15 }}
                          onClick={close}
                          onMouseEnter={() => setActiveIdx(i)}
                          onFocus={() => setActiveIdx(i)}
                          prefetch={false}
                        >
                          <span>{label}</span>

                          {/* Inline thumbnail — always shown on mobile, hover-reveal on desktop.
                              Skipped for logo-type items (Home) — the right panel handles that preview. */}
                          {livePreview.type !== 'logo' && (
                            <span
                              className="ml-5 flex-shrink-0 transition-opacity duration-300 opacity-100 md:opacity-0 md:group-hover:opacity-100"
                              style={{
                                width:       'clamp(44px, 7vw, 72px)',
                                aspectRatio: '3 / 4',
                                display:     'block',
                                overflow:    'hidden',
                              }}
                            >
                              <PreviewBlock
                                img={livePreview.images[0]}
                                style={{ width: '100%', height: '100%' }}
                              />
                            </span>
                          )}
                        </Link>
                      </motion.li>
                    )
                  })}
                </motion.ul>
              </nav>

              {/* Right — animated preview panel (desktop only) */}
              <div
                className="hidden md:flex items-center justify-center flex-shrink-0"
                style={{ width: 'clamp(220px, 28vw, 360px)' }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIdx}
                    variants={previewVars}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    style={{ width: '100%' }}
                  >
                    <SectionPreview preview={getLivePreview(activeIdx)} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Footer */}
            <div className="pb-5" style={{ paddingLeft: 'var(--headline-padding-x)', paddingRight: 'var(--headline-padding-x)' }}>
              <p className="text-caption text-pewter/60">
                © {new Date().getFullYear()} SNT Live Events. All rights reserved.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
