'use client'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import type { HeroSlide } from '@/lib/types'
import PlaceholderMedia from '@/components/ui/PlaceholderMedia'
import SplitHeadline from '@/components/ui/SplitHeadline'
import { useLenis } from '@/components/layout/SmoothScrollProvider'
import {
  LOGO_STAGE_H,
  LOGO_REST_SCALE,
  LOGO_REST_H,
  LOGO_REST_TOP,
  LOGO_REST_LEFT,
  LOGO_FILTER,
} from '@/components/layout/PersistentLogo'
import { useLogoScrollProgress } from '@/components/layout/LogoContext'

const AUTOPLAY_MS  = 4500
// scaleFactor: how many times larger the logo appears at p=0 vs p=1
const SCALE_FACTOR = LOGO_STAGE_H / LOGO_REST_H  // 400/180 ≈ 2.22

interface Props {
  slides:  HeroSlide[]
  heading: string
  tagline: string
}

export default function HeroIntro({ slides, heading, tagline }: Props) {
  const wrapperRef   = useRef<HTMLDivElement>(null)
  const logoRef      = useRef<HTMLDivElement>(null)   // outer fixed div — scroll animation target
  const spinRef      = useRef<HTMLDivElement>(null)   // inner rotating div — GSAP spin target
  const videoRef     = useRef<HTMLDivElement>(null)
  const textRef      = useRef<HTMLDivElement>(null)

  const [index, setIndex] = useState(0)
  const timerRef      = useRef<ReturnType<typeof setInterval> | null>(null)
  // One-shot: set when arriving via logo click (skip-intro sessionStorage signal).
  // Prevents the intro animation from playing; logo jumps straight to settled state.
  const skipIntroRef  = useRef(false)

  const lenis = useLenis()
  const { setScrollProgress } = useLogoScrollProgress()

  // Runs synchronously before first paint so the large-logo frame is never seen
  // when arriving via a logo click from another page.
  useLayoutEffect(() => {
    // Always reset progress on mount so stale settled=true from a previous
    // session doesn't bleed through when navigating back to the homepage.
    setScrollProgress(0)

    if (sessionStorage.getItem('snt-skip-intro') === '1') {
      sessionStorage.removeItem('snt-skip-intro')
      skipIntroRef.current = true
    }
  }, [setScrollProgress])

  // ── Carousel autoplay ─────────────────────────────────────────────
  useEffect(() => {
    if (slides.length <= 1) return
    timerRef.current = setInterval(() => {
      setIndex(i => (i + 1) % slides.length)
    }, AUTOPLAY_MS)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [slides.length])

  function goTo(i: number) {
    if (timerRef.current) clearInterval(timerRef.current)
    setIndex(i)
    timerRef.current = setInterval(() => {
      setIndex(n => (n + 1) % slides.length)
    }, AUTOPLAY_MS)
  }

  // ── Continuous logo spin (independent of scroll position) ────────
  useEffect(() => {
    if (!spinRef.current) return
    const tween = gsap.to(spinRef.current, {
      rotateY: 360,
      duration: 7,
      repeat: -1,
      ease: 'none',
    })
    return () => { tween.kill() }
  }, [])

  // ── Scroll-driven animation ───────────────────────────────────────
  // All DOM mutations are written directly to refs to avoid per-scroll re-renders.
  useEffect(() => {
    let H = window.innerHeight
    let W = window.innerWidth

    function applyProgress(p: number) {
      const logo  = logoRef.current
      const video = videoRef.current
      const text  = textRef.current
      if (!logo || !video) return

      // ── Logo: diagonal center-screen (p=0) → top-left (p=1) ──────
      // Element is fixed at (LOGO_REST_LEFT, LOGO_REST_TOP) with
      // transformOrigin:'top left'. At rest (p=1) scale=1 → LOGO_REST_H px.
      // At start (p=0) scale=SCALE_FACTOR → LOGO_STAGE_H px, centered via translate.
      const visualSizeAtStart = LOGO_REST_H * SCALE_FACTOR  // = LOGO_STAGE_H
      const tx_start = W / 2 - visualSizeAtStart / 2 - LOGO_REST_LEFT
      const ty_start = H * 0.45 - visualSizeAtStart / 2 - LOGO_REST_TOP
      const tx    = tx_start * (1 - p)
      const ty    = ty_start * (1 - p)
      const scale = SCALE_FACTOR + (1 - SCALE_FACTOR) * p  // SCALE_FACTOR → 1

      logo.style.transform      = `translate(${tx}px, ${ty}px) scale(${scale})`
      // Enable pointer events (click to home) only when settled at top-left
      logo.style.pointerEvents  = p >= 1 ? 'auto' : 'none'

      // ── Video: subtle push-in scale ───────────────────────────────
      video.style.transform = `scale(${0.94 + 0.06 * p})`

      // ── Text: trails the video reveal ────────────────────────────
      if (text) {
        const tp = Math.max(0, Math.min((p - 0.5) / 0.4, 1))
        text.style.opacity   = String(tp)
        text.style.transform = `translateY(${(1 - tp) * 20}px)`
      }
    }

    function computeAndApply(scrollY: number) {
      const wrapper    = wrapperRef.current
      const scrollable = wrapper ? wrapper.offsetHeight - H : 0
      const rawP = scrollable > 0 ? scrollY / scrollable : 0
      const p    = Math.max(0, Math.min(rawP, 1))
      applyProgress(p)
      setScrollProgress(p)
    }

    // skip-intro: jump to settled visual state immediately; no scroll listeners
    // attached so the logo stays locked at rest (arriving via logo click from
    // another page — no reason to play the intro again).
    if (skipIntroRef.current) {
      skipIntroRef.current = false
      applyProgress(1)
      setScrollProgress(1)
      return
    }

    // Apply state for current scroll position (handles refresh-while-scrolled).
    computeAndApply(window.scrollY)

    function onResize() {
      H = window.innerHeight
      W = window.innerWidth
      computeAndApply(window.scrollY)
    }
    window.addEventListener('resize', onResize, { passive: true })

    if (!lenis) {
      return () => window.removeEventListener('resize', onResize)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function handleScroll(e: any) {
      computeAndApply(e.scroll as number)
    }
    lenis.on('scroll', handleScroll)

    return () => {
      lenis.off('scroll', handleScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [lenis, setScrollProgress])

  const slide = slides[index] ?? null

  return (
    <>
      {/* ── Fixed logo — animates from center-screen to top-left ──────
          Single element drives the full animation (no crossfade needed).
          transformOrigin:'top left' ensures scale grows from the resting
          anchor point rather than from the element center.               */}
      {/* Outer fixed div — position/scale controlled by applyProgress (scroll animation).
          Must remain the direct target of logoRef; nothing inside it should override
          the `transform` or `pointerEvents` that applyProgress writes here. */}
      <div
        ref={logoRef}
        style={{
          position:        'fixed',
          top:             LOGO_REST_TOP,
          left:            LOGO_REST_LEFT,
          zIndex:          205,
          transformOrigin: 'top left',
          willChange:      'transform',
          pointerEvents:   'none',
        }}
      >
        <Link href="/" aria-label="SNT home" tabIndex={-1}>
          {/* Perspective container — provides 3D depth for the rotateX spin */}
          <div style={{ perspective: '900px', width: LOGO_REST_H, height: LOGO_REST_H }}>
            {/* Rotating inner — GSAP drives rotateX; outer logoRef gets scroll translate/scale */}
            <div
              ref={spinRef}
              style={{
                position:       'relative',
                width:          '100%',
                height:         '100%',
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Front face */}
              <Image
                src="/logo-white.png"
                alt="SNT Events"
                width={LOGO_REST_H}
                height={LOGO_REST_H}
                style={{
                  height:                   LOGO_REST_H,
                  width:                    'auto',
                  objectFit:                'contain',
                  filter:                   LOGO_FILTER,
                  backfaceVisibility:       'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                } as React.CSSProperties}
                priority
              />
              {/* Back face — rotateX(180deg) places it on the reverse side.
                  Combined with parent at 180deg = identity: appears right-side-up. */}
              <Image
                src="/logo-white.png"
                alt=""
                width={LOGO_REST_H}
                height={LOGO_REST_H}
                style={{
                  position:                 'absolute',
                  top:                      0,
                  left:                     0,
                  height:                   LOGO_REST_H,
                  width:                    'auto',
                  objectFit:                'contain',
                  filter:                   LOGO_FILTER,
                  backfaceVisibility:       'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform:                'rotateY(180deg)',
                } as React.CSSProperties}
              />
            </div>
          </div>
        </Link>
      </div>

      {/* ── Scroll wrapper — 200vh gives 100vh of scroll travel ──── */}
      <div ref={wrapperRef} style={{ height: '200vh', position: 'relative' }}>

        {/* ── Pinned stage — sticky for the full 100vh scroll range ── */}
        <div
          className="bg-absolute-zero"
          style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}
        >
          {/* ── Video carousel layer ──────────────────────────────── */}
          <div
            ref={videoRef}
            style={{
              position:        'absolute',
              inset:           0,
              transform:       'scale(0.94)',
              transformOrigin: 'center',
              willChange:      'transform',
            }}
          >
            {slide ? (
              <>
                <AnimatePresence mode="sync">
                  <motion.div
                    key={slide.id}
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: 'easeInOut' }}
                  >
                    {slide.src ? (
                      slide.type === 'video' ? (
                        <video
                          src={slide.src}
                          autoPlay muted loop playsInline
                          className="w-full h-full object-cover"
                          aria-label={slide.alt}
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={slide.src} alt={slide.alt} className="w-full h-full object-cover" />
                      )
                    ) : (
                      <div className="w-full h-full flex">
                        <PlaceholderMedia
                          label={slide.label}
                          aspectRatio="16/9"
                          type={slide.type}
                          className="flex-1"
                        />
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
                <div className="absolute inset-0 bg-absolute-zero/50" />
              </>
            ) : (
              <div className="absolute inset-0 bg-absolute-zero" />
            )}
          </div>

          {/* ── Top gradient scrim — keeps header row legible ──────── */}
          <div
            style={{
              position:      'absolute',
              top:           0,
              left:          0,
              right:         0,
              height:        220,
              background:    'linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.28) 50%, transparent 100%)',
              zIndex:        2,
              pointerEvents: 'none',
            }}
          />

          {/* ── Text + slide dots ─────────────────────────────────── */}
          <div
            ref={textRef}
            className="absolute inset-0 flex flex-col justify-end z-[5]"
            style={{
              opacity:       0,
              transform:     'translateY(20px)',
              willChange:    'transform, opacity',
              paddingBottom: '4rem',
            }}
          >
            <div style={{ paddingLeft: 'var(--headline-padding-x)', paddingRight: 'var(--headline-padding-x)' }}>
              <SplitHeadline
                text={heading}
                as="h1"
                className="text-ghost-white font-light leading-none mb-6"
                style={{ fontSize: 'var(--text-display-sm)' }}
                once={false}
              />
              <p className="text-body-lg text-ghost-white/80 font-light max-w-lg mb-10">
                {tagline}
              </p>
              {slides.length > 1 && (
                <div className="flex gap-3" role="tablist" aria-label="Carousel slides">
                  {slides.map((s, i) => (
                    <button
                      key={s.id}
                      role="tab"
                      aria-selected={i === index}
                      aria-label={`Slide ${i + 1}`}
                      onClick={() => goTo(i)}
                      className="h-[1.5px] w-10 transition-all duration-300"
                      style={{
                        backgroundColor: i === index
                          ? 'var(--color-ghost-white)'
                          : 'var(--color-pewter)',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
