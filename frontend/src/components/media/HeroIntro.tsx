'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import type { HeroSlide } from '@/lib/types'
import PlaceholderMedia from '@/components/ui/PlaceholderMedia'
import SplitHeadline from '@/components/ui/SplitHeadline'
import { useLenis } from '@/components/layout/SmoothScrollProvider'
import { LOGO_REST_TOP, LOGO_REST_H, LOGO_FILTER } from '@/components/layout/PersistentLogo'
import { useLogoSettled } from '@/components/layout/LogoContext'

interface Props {
  slides: HeroSlide[]
  heading: string
  tagline: string
}

const AUTOPLAY_MS = 4500
// The stage logo element is rendered at its natural CSS size (LOGO_H px square)
// so the browser never needs to upscale — it scales DOWN as progress increases.
const LOGO_H      = 400  // natural CSS size of the stage logo element in px
const SCALE_START = 1.0  // element is already at hero size; no upscaling needed
// LOGO_REST_TOP and LOGO_REST_H are imported from PersistentLogo — single source
// of truth so the animation endpoint matches the static settled version exactly.

export default function HeroIntro({ slides, heading, tagline }: Props) {
  const wrapperRef    = useRef<HTMLDivElement>(null)
  const stageLogoRef  = useRef<HTMLDivElement>(null)
  const fixedLogoRef  = useRef<HTMLDivElement>(null)
  const videoRef      = useRef<HTMLDivElement>(null)
  const textRef       = useRef<HTMLDivElement>(null)

  const [index, setIndex] = useState(0)
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null)
  // One-way lock: set to true once p reaches 1. After that, scroll events
  // no longer drive the animation — the logo stays at its resting state
  // permanently, even if the user scrolls back to the top.
  const settledRef = useRef(false)

  const lenis = useLenis()
  const { settled, setSettled } = useLogoSettled()

  // Once the context-settled flag becomes true, PersistentLogo (rendered by
  // Navbar) has already appeared in the same React commit. Hide the animated
  // fixedLogoRef so there's no invisible duplicate in the paint tree.
  useEffect(() => {
    if (settled && fixedLogoRef.current) {
      fixedLogoRef.current.style.display = 'none'
    }
  }, [settled])

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

  // ── Scroll-driven animation ───────────────────────────────────────
  // All transform/opacity values are written directly to DOM refs to
  // avoid React re-renders on every scroll event.
  useEffect(() => {
    let H = window.innerHeight

    let prevP = -1  // tracks last p value to detect per-frame jumps

    function applyProgress(p: number) {
      const stageLogo = stageLogoRef.current
      const fixedLogo = fixedLogoRef.current
      const video     = videoRef.current
      const text      = textRef.current
      if (!stageLogo || !fixedLogo || !video) return

      // ── Logo: large + centered (p=0) → small + top-center (p=1) ──
      // The element is anchored at top:LOGO_REST_TOP, left:50%.
      // At p=0 we push it down via translateY so it visually lands at
      // the vertical centre of the viewport, then release it to top as
      // p→1. Scale shrinks from SCALE_START to 1.
      const centerY = H / 2 - LOGO_REST_TOP - (LOGO_H * SCALE_START) / 2
      const ty      = (1 - p) * centerY
      const scale   = SCALE_START + (LOGO_REST_H / LOGO_H - SCALE_START) * p
      stageLogo.style.transform = `translate(-50%, ${ty}px) scale(${scale})`

      // Cross-fade between stage logo and fixed-position persistent logo.
      // The stage logo lives inside the sticky element and would scroll
      // away once the wrapper unpins; the fixed logo takes over so the
      // brand mark never disappears.
      const cross = Math.max(0, Math.min((p - 0.75) / 0.25, 1))
      stageLogo.style.opacity = String(1 - cross)
      fixedLogo.style.opacity = String(cross)

      // ── Diagnostic logging (p > 0.9) ─────────────────────────────
      if (p > 0.9) {
        const delta = prevP >= 0 ? p - prevP : 0
        console.log(
          `[HeroIntro] p=${p.toFixed(5)}  Δp=${delta.toFixed(5)}  ty=${ty.toFixed(2)}  scale=${scale.toFixed(5)}` +
          `  stageOp=${(1-cross).toFixed(4)}  fixedOp=${cross.toFixed(4)}` +
          `  settled=${settledRef.current}  path=live-interpolation`
        )
      }
      prevP = p

      // ── Video: reveal as logo moves away ──────────────────────────
      // Starts at p=0.15 so there's a beat before the video appears,
      // with a subtle scale-up for a cinematic entrance feel.
      const vp = Math.max(0, Math.min((p - 0.15) / 0.7, 1))
      video.style.opacity   = String(vp)
      video.style.transform = `scale(${0.94 + 0.06 * vp})`

      // ── Text: heading + tagline, trails the video reveal ──────────
      if (text) {
        const tp = Math.max(0, Math.min((p - 0.5) / 0.4, 1))
        text.style.opacity   = String(tp)
        text.style.transform = `translateY(${(1 - tp) * 20}px)`
      }
    }

    // Compute current scroll progress and apply, so the visual state is
    // always correct whether Lenis has initialised yet or not.
    function computeAndApply(scrollY: number) {
      if (settledRef.current) return  // one-way: never un-settle
      const wrapper    = wrapperRef.current
      const scrollable = wrapper ? wrapper.offsetHeight - H : 0
      const rawP = scrollable > 0 ? scrollY / scrollable : 0
      const p    = Math.max(0, Math.min(rawP, 1))
      applyProgress(p)
      if (p >= 1) {
        console.log(
          `[HeroIntro] SETTLING — locking at p=1` +
          `  scrollY=${scrollY.toFixed(2)}  scrollable=${scrollable.toFixed(2)}  rawP=${rawP.toFixed(5)}` +
          `  finalScale=${(LOGO_REST_H / LOGO_H).toFixed(5)}  finalTy=0  stageOp=0  fixedOp=1`
        )
        settledRef.current = true
        setSettled(true)
      }
    }

    computeAndApply(window.scrollY)

    function onResize() {
      H = window.innerHeight
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
  }, [lenis])

  const slide = slides[index] ?? null

  return (
    <>
      {/* ── Fixed persistent logo ─────────────────────────────────────
          Sits at top-centre at z-[205] (above Navbar z-[200]).
          Opacity is driven by the scroll effect above (starts at 0,
          fades in during the p=0.75→1 crossover so it seamlessly
          replaces the stage logo when the sticky section unpins). */}
      {/* Full-viewport-width container + flexbox centering is more robust than
          left:50%/translateX(-50%), which can drift by a subpixel depending on
          element intrinsic width calculation. */}
      <div
        ref={fixedLogoRef}
        style={{
          position:       'fixed',
          top:            0,
          left:           0,
          right:          0,
          display:        'flex',
          justifyContent: 'center',
          paddingTop:     LOGO_REST_TOP,
          zIndex:         205,
          opacity:        0,
          pointerEvents:  'none',
          willChange:     'opacity',
        }}
      >
        <Image
          src="/logo-white.png"
          alt="SNT Events"
          width={112}
          height={112}
          className="h-28 w-auto object-contain"
          style={{ filter: LOGO_FILTER }}
          priority
        />
      </div>

      {/* ── Scroll wrapper ────────────────────────────────────────────
          200vh total height gives 100vh of scroll travel (wrapper
          height − viewport height) to drive progress 0→1. */}
      <div ref={wrapperRef} style={{ height: '200vh', position: 'relative' }}>

        {/* ── Pinned stage ──────────────────────────────────────────
            Sticky at top:0 for the full 100vh scroll range.
            After the user scrolls past the wrapper the stage
            unsticks and the fixed logo (above) takes over. */}
        <div
          className="bg-absolute-zero"
          style={{
            position: 'sticky',
            top:      0,
            height:   '100vh',
            overflow: 'hidden',
          }}
        >
          {/* ── Video carousel layer ──────────────────────────────── */}
          <div
            ref={videoRef}
            style={{
              position:        'absolute',
              inset:           0,
              opacity:         0,
              transform:       'scale(0.94)',
              transformOrigin: 'center',
              willChange:      'transform, opacity',
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
                        <img
                          src={slide.src}
                          alt={slide.alt}
                          className="w-full h-full object-cover"
                        />
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

          {/* ── Top gradient scrim ───────────────────────────────────
              Ensures the navbar (timestamp, hamburger) and the resting
              logo mark stay legible against any video frame. Sits above
              the video layer (z:2) but below text (z:5) and logo (z:10).
              Painted once — no JS involvement — so it fades in naturally
              as the video fades in behind it. */}
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

          {/* ── Text + slide dots layer ───────────────────────────── */}
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
            <div
              style={{
                paddingLeft:  'var(--headline-padding-x)',
                paddingRight: 'var(--headline-padding-x)',
              }}
            >
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

          {/* ── Stage logo ────────────────────────────────────────────
              Anchored at top:LOGO_REST_TOP, left:50%.
              applyProgress() pushes it down via translateY so it
              appears centered at p=0, then releases it to its natural
              top-centre position as p→1. transform-origin:top center
              ensures the scale grows/shrinks from the top-centre
              anchor point, keeping horizontal alignment stable. */}
          <div
            ref={stageLogoRef}
            style={{
              position:        'absolute',
              top:             LOGO_REST_TOP,
              left:            '50%',
              transformOrigin: 'top center',
              zIndex:          10,
              willChange:      'transform, opacity',
              pointerEvents:   'none',
            }}
          >
            {/* Element is natively 400×400 so the browser renders at full size
                and the CSS transform scales DOWN — no upscaling blurriness. */}
            <Image
              src="/logo-white.png"
              alt="SNT Events"
              width={400}
              height={400}
              className="w-[400px] h-[400px] object-contain"
              style={{ filter: LOGO_FILTER }}
              priority
            />
          </div>
        </div>
      </div>
    </>
  )
}
