'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { LogoBreak } from '@/lib/logo-break'

const STORAGE_KEY = 'snt-intro-seen'

// How many virtual CSS pixels of scroll = progress 1.0.
// 60% of viewport height feels natural on both trackpad and mouse wheel.
const SCROLL_TRAVEL_FACTOR = 0.6

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

// Normalize across deltaMode (pixels / lines / pages)
function wheelPx(e: WheelEvent): number {
  if (e.deltaMode === 0) return e.deltaY
  if (e.deltaMode === 1) return e.deltaY * 16
  return e.deltaY * 600
}

export default function LogoIntro() {
  const overlayRef = useRef<HTMLDivElement>(null)
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const [visible, setVisible] = useState(true)
  const [ready, setReady]     = useState(false)

  // Before first paint: skip overlay for return visits
  useIsomorphicLayoutEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) setVisible(false)
  }, [])

  useEffect(() => {
    if (!visible) return

    const overlay = overlayRef.current
    const canvas  = canvasRef.current
    if (!overlay || !canvas) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // ── Canvas — DPR-aware, capped at 2× for performance ───────────────
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const W   = window.innerWidth
    const H   = window.innerHeight

    // Physical buffer: W*dpr × H*dpr for sharp rendering
    canvas.width  = W * dpr
    canvas.height = H * dpr
    // CSS display: W × H (logical pixels)
    canvas.style.width  = W + 'px'
    canvas.style.height = H + 'px'

    const ctx = canvas.getContext('2d')!
    // Scale so all drawing commands are in CSS-pixel coordinates
    ctx.scale(dpr, dpr)

    // ── Scroll lock ────────────────────────────────────────────────────
    const savedBodyOverflow = document.body.style.overflow
    const savedHtmlOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow             = 'hidden'

    let lb: InstanceType<typeof LogoBreak> | null = null
    let done = false

    // ── Init particle engine ───────────────────────────────────────────
    ;(async () => {
      // Desktop gets a 28% larger logo; mobile stays at the natural contain size
      // so the logo never clips horizontally on narrow viewports.
      const drawScale = W >= 768 ? 1.28 : 1.0

      // The logo image is square (1080×1080). Under `contain` fit the rendered
      // height equals min(W, H). Scaling by drawScale may push dh > H on
      // landscape, clipping top/bottom symmetrically — that's fine.
      const dh        = Math.min(W, H) * drawScale   // logo render height on canvas
      const vertOff   = (H - dh) / 2                 // vertical offset (may be negative)

      // Tagline starts at ~68% down the image. Convert to canvas-space fraction.
      const taglineYStart = Math.min((vertOff + dh * 0.68) / H, 0.95)

      // Particle counts scale linearly with drawScale (visible logo area grows
      // with the larger dimension that is not yet clipped by the canvas edge).
      const logoCount    = Math.round(2000 * drawScale)  // ~2560 at 1.28×
      const taglineCount = Math.round(1800 * drawScale)  // ~2304 at 1.28×

      const instance = new LogoBreak(canvas!, {
        // Logical display dimensions — keeps all coordinates in CSS-pixel space
        displayWidth:  W,
        displayHeight: H,
        count:          logoCount,
        color:          '#ffffff',
        particleRadius: 2.0,
        repelOnHover:   true,
        repelRadius:    70,
        repelStrength:  4,
        homeEase:       0.12,
        // Physics-break params kept for back-compat (not used in scrub mode)
        explodeSpeedMin: 5,
        explodeSpeedMax: 16,
        explodeDrag:     0.95,
        returnDelayMs:   60_000,
        springStrength:  0.025,
        springDamping:   0.84,
      })
      lb = instance
      await instance.loadFromImage('/logo-white.png', { sampleStride: 1, drawScale })
      // Extra particle budget for the tagline region at smaller radius so the
      // letterforms resolve at their rendered size.
      await instance.loadFromImageAppend('/logo-white.png', {
        sampleStride:   1,
        count:          taglineCount,
        yStartFraction: taglineYStart,
        radius:         1.3,
        drawScale,
      })
      instance.start()
      setReady(true)
    })()

    // ── Virtual-scroll accumulator (replaces fire-and-forget) ──────────
    let virtualScroll = 0
    const MAX_VIRTUAL = H * SCROLL_TRAVEL_FACTOR

    function applyProgress(progress: number) {
      if (done || !overlay) return
      progress = Math.max(0, Math.min(progress, 1))

      if (reducedMotion) {
        // Reduced motion: crossfade overlay without particle explosion
        overlay.style.opacity = (1 - progress).toString()
      } else {
        if (lb) lb.breakScrub(progress)
        overlay.style.backgroundColor = `rgba(0,0,0,${(1 - progress).toFixed(4)})`
      }

      if (progress >= 1) {
        done = true
        removeListeners()
        sessionStorage.setItem(STORAGE_KEY, '1')
        // One extra frame so the final state paints before we unmount
        requestAnimationFrame(cleanup)
      }
    }

    function cleanup() {
      if (lb) { lb.stop(); lb = null }
      document.documentElement.style.overflow = savedHtmlOverflow
      document.body.style.overflow             = savedBodyOverflow
      setVisible(false)
    }

    // ── Input listeners ────────────────────────────────────────────────

    function onWheel(e: WheelEvent) {
      virtualScroll = Math.max(0, Math.min(virtualScroll + wheelPx(e), MAX_VIRTUAL))
      applyProgress(virtualScroll / MAX_VIRTUAL)
    }

    let touchPrevY = 0
    function onTouchStart(e: TouchEvent) {
      touchPrevY = e.touches[0].clientY
    }
    function onTouchMove(e: TouchEvent) {
      const dy = touchPrevY - e.touches[0].clientY
      touchPrevY = e.touches[0].clientY
      virtualScroll = Math.max(0, Math.min(virtualScroll + dy, MAX_VIRTUAL))
      applyProgress(virtualScroll / MAX_VIRTUAL)
    }

    function removeListeners() {
      window.removeEventListener('wheel',      onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove',  onTouchMove)
    }

    window.addEventListener('wheel',      onWheel,      { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove',  onTouchMove,  { passive: true })

    return () => {
      removeListeners()
      if (lb) lb.stop()
      document.documentElement.style.overflow = savedHtmlOverflow
      document.body.style.overflow             = savedBodyOverflow
    }
  }, [visible])

  if (!visible) return null

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      style={{
        position:        'fixed',
        inset:           0,
        zIndex:          9999,
        backgroundColor: '#000000',
        // Block pointer events on page beneath; wheel/touch handled on window
        pointerEvents:   'auto',
      }}
    >
      {/* Canvas receives pointermove for idle cursor-repulsion effect */}
      <canvas
        ref={canvasRef}
        style={{
          position:      'absolute',
          top:           0,
          left:          0,
          display:       'block',
          pointerEvents: 'auto',
        }}
      />

      {/* Scroll hint — fades in once particles finish assembling */}
      <p
        style={{
          position:      'absolute',
          bottom:        '2.5rem',
          left:          '50%',
          transform:     'translateX(-50%)',
          fontSize:      '11px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color:         '#ffffff',
          opacity:       ready ? 0.35 : 0,
          transition:    'opacity 1.2s ease',
          whiteSpace:    'nowrap',
          userSelect:    'none',
          fontFamily:    'inherit',
          fontWeight:    300,
          pointerEvents: 'none',
        }}
      >
        Scroll to enter
      </p>
    </div>
  )
}
