'use client'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import Link from 'next/link'
import LogoSvg from '@/components/ui/LogoSvg'
import type { HeroSlide } from '@/lib/types'
import RippleDistortion from './RippleDistortion'
import { useLenis } from '@/components/layout/SmoothScrollProvider'
import {
  LOGO_STAGE_H,
  LOGO_STAGE_H_MOBILE,
  LG_BREAKPOINT,
  LOGO_REST_H,
  LOGO_REST_TOP,
  LOGO_FILTER_HERO,
  SPIN_RANGE,
  SPIN_DURATION,
} from '@/components/layout/PersistentLogo'
import { useSetLogoScrollProgress } from '@/components/layout/LogoContext'

interface Props {
  slides: HeroSlide[]
}

export default function HeroIntro({ slides }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const logoRef    = useRef<HTMLDivElement>(null)   // outer fixed div — scroll animation target
  const spinRef    = useRef<HTMLDivElement>(null)   // inner rotating div — GSAP spin target
  const videoRef   = useRef<HTMLDivElement>(null)
  const textRef    = useRef<HTMLDivElement>(null)

  // One-shot: set when arriving via logo click (skip-intro sessionStorage signal).
  // Prevents the intro animation from playing; logo jumps straight to settled state.
  const skipIntroRef  = useRef(false)

  // Responsive stage height — 300px on desktop (≥ lg/1024px), 180px on mobile.
  // Dual ref+state: ref is read inside effect closures for scroll math;
  // state triggers a re-render so the DOM layout (perspective + SVG) matches.
  const [stageH, setStageH] = useState(LOGO_STAGE_H)
  const stageHRef = useRef(LOGO_STAGE_H)

  const lenis = useLenis()
  const setScrollProgress = useSetLogoScrollProgress()

  // Runs synchronously before first paint so the large-logo frame is never seen
  // when arriving via a logo click from another page.
  useLayoutEffect(() => {
    // Always reset progress on mount so stale settled=true from a previous
    // session doesn't bleed through when navigating back to the homepage.
    setScrollProgress(0)

    // Initialise responsive stage size before first paint — avoids any visible
    // flash of the desktop 300px size on mobile viewports.
    const h = window.innerWidth < LG_BREAKPOINT ? LOGO_STAGE_H_MOBILE : LOGO_STAGE_H
    stageHRef.current = h
    setStageH(h)

    if (sessionStorage.getItem('snt-skip-intro') === '1') {
      sessionStorage.removeItem('snt-skip-intro')
      skipIntroRef.current = true
    }
  }, [setScrollProgress])

  // ── Continuous logo spin — same parameters as PersistentLogo for seamless handoff ──
  useEffect(() => {
    if (!spinRef.current) return
    const tween = gsap.fromTo(
      spinRef.current,
      { rotateY: -SPIN_RANGE },
      { rotateY: SPIN_RANGE, duration: SPIN_DURATION, repeat: -1, yoyo: true, ease: 'sine.inOut' },
    )
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

      // Read responsive stage dimensions from ref — always current after resize.
      const sh = stageHRef.current
      const sw = Math.round(sh * (383 / 421))
      const scaleDown = LOGO_REST_H / sh

      // ── Logo: center-screen (p=0) → top-center (p=1) ─────────────
      // Element is fixed at (left:0, LOGO_REST_TOP) with transformOrigin:'top left'.
      // At p=0: scale=1, element is native stage size, centred via translate.
      // At p=1: scale=scaleDown, element is horizontally centred at the top.
      // Scaling down from native size keeps SVG crisp at p=0 (no scale-up blurring).
      const restW    = sw * scaleDown                      // visual width at rest ≈ LOGO_REST_W
      const tx_start = W / 2 - sw / 2                     // p=0: centre screen
      const ty_start = H * 0.45 - sh / 2 - LOGO_REST_TOP // p=0: 45 % down
      const tx_end   = W / 2 - restW / 2                  // p=1: centre header

      const tx    = tx_start + (tx_end - tx_start) * p
      const ty    = ty_start * (1 - p)
      const scale = 1 + (scaleDown - 1) * p

      logo.style.transform     = `translate(${tx}px, ${ty}px) scale(${scale})`
      // Hide hero logo once settled — PersistentLogo takes over at that point.
      // Keeping both visible causes a double-logo overlap at p=1.
      logo.style.opacity       = p >= 1 ? '0' : '1'
      logo.style.pointerEvents = 'none'

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
      // Keep stage size in sync when the window crosses the lg breakpoint.
      const newH = W < LG_BREAKPOINT ? LOGO_STAGE_H_MOBILE : LOGO_STAGE_H
      if (newH !== stageHRef.current) {
        stageHRef.current = newH
        setStageH(newH)
      }
      computeAndApply(window.scrollY)
    }
    window.addEventListener('resize', onResize, { passive: true })

    // Lenis v1 with smoothTouch:false (default) does not intercept touch events,
    // so its scroll events never fire on mobile. Use a native listener instead
    // so scrollProgress is always updated by real touch scroll.
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0

    if (isTouch || !lenis) {
      const handleNativeScroll = () => computeAndApply(window.scrollY)
      window.addEventListener('scroll', handleNativeScroll, { passive: true })
      return () => {
        window.removeEventListener('scroll', handleNativeScroll)
        window.removeEventListener('resize', onResize)
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleLenisScroll = (e: any) => computeAndApply(e.scroll as number)
    lenis.on('scroll', handleLenisScroll)

    return () => {
      lenis.off('scroll', handleLenisScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [lenis, setScrollProgress])

  const heroSrc = slides[0]?.src ?? ''
  const stageW = Math.round(stageH * (383 / 421))

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
          left:            0,
          zIndex:          205,
          transformOrigin: 'top left',
          willChange:      'transform',
          pointerEvents:   'none',
        }}
      >
        <Link href="/" aria-label="SNT home" tabIndex={-1}>
          {/* Perspective container — native hero size (responsive) so SVG rasterises at full resolution */}
          <div style={{ perspective: '1200px', width: stageW, height: stageH }}>
            {/* Rotating inner — GSAP drives rotateY; outer logoRef gets scroll translate/scale */}
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
              <LogoSvg
                aria-label="SNT Events"
                style={{
                  height:                   stageH,
                  width:                    'auto',
                  color:                    'white',
                  filter:                   LOGO_FILTER_HERO,
                  backfaceVisibility:       'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  display:                  'block',
                } as React.CSSProperties}
              />
              {/* Back face — rotateY(180deg) places it on the reverse side.
                  Combined with parent at 180deg = identity: appears right-side-up. */}
              <LogoSvg
                aria-hidden
                style={{
                  position:                 'absolute',
                  top:                      0,
                  left:                     0,
                  height:                   stageH,
                  width:                    'auto',
                  color:                    'white',
                  filter:                   LOGO_FILTER_HERO,
                  backfaceVisibility:       'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform:                'rotateY(180deg)',
                  display:                  'block',
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
          {/* ── Hero image — RippleDistortion WebGL layer ─────────── */}
          <div
            ref={videoRef}
            style={{
              position:        'absolute',
              inset:           '-4%',
              transform:       'scale(0.94)',
              transformOrigin: 'center',
              willChange:      'transform',
            }}
          >
            <RippleDistortion
              src={heroSrc}
              brushSize={130}
              strength={0.18}
              swirl={1}
              rings={3}
              spread={5}
              fade={4}
              spacing={12}
              grayscale
              tint="#d3fd50"
              tintAmount={0.07}
              quality="medium"
              trigger="hover"
            />
          </div>

          {/* Dim overlay — keeps scrims and text legible over the bright image */}
          <div
            style={{
              position:      'absolute',
              inset:         0,
              background:    'rgba(0,0,0,0.28)',
              zIndex:        1,
              pointerEvents: 'none',
            }}
          />

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
          {/* ── Bottom gradient scrim — anchors text legibility ──────── */}
          <div
            style={{
              position:      'absolute',
              bottom:        0,
              left:          0,
              right:         0,
              height:        '65%',
              background:    'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.48) 35%, transparent 70%)',
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
              paddingBottom: '6rem',
            }}
          >
            <div style={{ paddingLeft: 'var(--headline-padding-x)', paddingRight: 'var(--headline-padding-x)' }}>
              {/* ── Three-line hero text block ─────────────────────── */}
              {/* text-center on mobile creates a cinematic full-width statement;
                  sm:text-left restores editorial left-alignment on wider screens */}
              <div className="mb-10 text-center sm:text-left">
                {/* Line 1 — dominant brand mark, ultra-light wide tracking for prestige */}
                <h1
                  style={{
                    fontSize:      'clamp(1.15rem, 5.5vw, 3.75rem)',
                    fontWeight:    200,
                    letterSpacing: '0.22em',
                    lineHeight:    1.15,
                    color:         'var(--color-ghost-white)',
                    marginBottom:  '0.35em',
                    fontFamily:    'var(--font-body)',
                    wordBreak:     'break-word',
                  }}
                >
                  S N T ENTERTAINMENTS
                </h1>

                {/* Line 2 — full legal name, fluid size, wraps naturally on small screens */}
                <p
                  style={{
                    fontSize:      'clamp(0.5rem, 3.2vw, 1rem)',
                    fontWeight:    300,
                    letterSpacing: '0.1em',
                    lineHeight:    1.6,
                    color:         'rgba(255,255,255,0.4)',
                    marginBottom:  '0.85rem',
                    fontFamily:    'var(--font-body)',
                  }}
                >
                  SNT ENTERTAINMENTS AND MANAGEMENT (Pvt) Ltd
                </p>

                {/* Line 3 — refined prestige note */}
                <p
                  style={{
                    fontSize:      'clamp(1rem, 1.6vw, 1.25rem)',
                    fontWeight:    300,
                    letterSpacing: '0.08em',
                    lineHeight:    1.4,
                    color:         'rgba(255,255,255,0.72)',
                    fontFamily:    'var(--font-body)',
                  }}
                >
                  Designed for prestige
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
