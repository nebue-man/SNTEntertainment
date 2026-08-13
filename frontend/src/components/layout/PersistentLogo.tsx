'use client'

import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import Link from 'next/link'
import LogoSvg from '@/components/ui/LogoSvg'
import { usePathname } from 'next/navigation'

// ── Shared logo geometry constants ──────────────────────────────────────────
// LOGO_STAGE_H/W: Native CSS dimensions of the hero logo in HeroIntro (p=0).
//   Sized natively so the SVG rasterises at full resolution — no scale-up blurring.
// LOGO_REST_H/W:  Settled header logo dimensions (independent of STAGE values).
// LOGO_REST_TOP/LEFT: Fixed header offset — TOP matches header py-4 (16px).
export const LOGO_STAGE_H    = 300
export const LOGO_STAGE_W    = Math.round(LOGO_STAGE_H * (383 / 421))  // 273
export const LOGO_REST_H     = 50
export const LOGO_REST_W     = Math.round(LOGO_REST_H  * (383 / 421))  // 36
export const LOGO_REST_TOP   = 16
export const LOGO_REST_LEFT  = 24

// Settled state (40px native element, no transform scale in effect)
export const LOGO_FILTER =
  'drop-shadow(0 1px 2px rgba(0,0,0,0.9)) drop-shadow(0 0 3px rgba(0,0,0,0.55))'

// Hero state (300px native element). At p=1 (×LOGO_REST_H/LOGO_STAGE_H ≈ 0.133)
// the filter visually collapses to ≈2px/3px — matching LOGO_FILTER at handoff.
export const LOGO_FILTER_HERO =
  'drop-shadow(0 6px 15px rgba(0,0,0,0.9)) drop-shadow(0 0 22px rgba(0,0,0,0.55))'

// Renders the SNT logo as a clickable link at its resting size.
// Used by Navbar on non-home pages (home page uses HeroIntro's animated logo).
// Shared GSAP spin parameters — identical values used in HeroIntro so both
// states animate at the same speed and range, preventing any visible jump at
// the homepage settled-state handoff.
export const SPIN_RANGE    = 30    // ±30° — cos(30°)×36px = 31px min width, never a sliver
export const SPIN_DURATION = 2.5   // seconds per half-cycle (5s full oscillation)

export default function PersistentLogo() {
  const pathname = usePathname()
  const spinRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!spinRef.current) return
    const tween = gsap.fromTo(
      spinRef.current,
      { rotateY: -SPIN_RANGE },
      { rotateY: SPIN_RANGE, duration: SPIN_DURATION, repeat: -1, yoyo: true, ease: 'sine.inOut' },
    )
    return () => { tween.kill() }
  }, [])

  function handleClick() {
    // Write a skip-intro flag so HeroIntro jumps straight to settled state
    // when the homepage remounts, rather than playing the full intro animation.
    // Only relevant when navigating away from "/".
    if (pathname !== '/') {
      sessionStorage.setItem('snt-skip-intro', '1')
    }
  }

  return (
    <Link href="/" aria-label="SNT home" onClick={handleClick}>
      {/* Perspective container — sized to exact SVG aspect ratio so rotation axis is centred */}
      <div style={{ perspective: '900px', width: LOGO_REST_W, height: LOGO_REST_H }}>
        {/* Rotating inner — GSAP oscillates rotateY; outer wrapper holds position/size */}
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
              height:                   LOGO_REST_H,
              width:                    'auto',
              color:                    'white',
              filter:                   LOGO_FILTER,
              backfaceVisibility:       'hidden',
              WebkitBackfaceVisibility: 'hidden',
              display:                  'block',
            } as React.CSSProperties}
          />
          {/* Back face — rotateY(180deg) places it on the reverse side.
              At parent=180deg the combined transform = identity so it appears
              right-side-up with no additional mirror needed. */}
          <LogoSvg
            aria-hidden
            style={{
              position:                 'absolute',
              top:                      0,
              left:                     0,
              height:                   LOGO_REST_H,
              width:                    'auto',
              color:                    'white',
              filter:                   LOGO_FILTER,
              backfaceVisibility:       'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform:                'rotateY(180deg)',
              display:                  'block',
            } as React.CSSProperties}
          />
        </div>
      </div>
    </Link>
  )
}
