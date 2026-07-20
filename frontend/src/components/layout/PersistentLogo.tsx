'use client'

import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

// ── Shared logo geometry constants ──────────────────────────────────────────
// LOGO_STAGE_H:   Natural render size of the large hero logo element (px).
// LOGO_REST_SCALE: Scale of the resting logo relative to LOGO_STAGE_H. Tune here.
// LOGO_REST_H:    Resting logo display size derived from the above.
// LOGO_REST_TOP:  Fixed top offset — matches header py-4 (16 px).
// LOGO_REST_LEFT: Fixed left offset — left-anchored resting position.
export const LOGO_STAGE_H    = 400
export const LOGO_REST_SCALE = 0.45
export const LOGO_REST_H     = Math.round(LOGO_STAGE_H * LOGO_REST_SCALE)  // 180
export const LOGO_REST_TOP   = 16
export const LOGO_REST_LEFT  = 32

export const LOGO_FILTER =
  'drop-shadow(0 2px 10px rgba(0,0,0,0.9)) drop-shadow(0 0 32px rgba(0,0,0,0.55))'

// Renders the SNT logo as a clickable link at its resting size.
// Used by Navbar on non-home pages (home page uses HeroIntro's animated logo).
export default function PersistentLogo() {
  const pathname = usePathname()
  const spinRef = useRef<HTMLDivElement>(null)

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
      {/* Perspective container — depth for the rotateX spin */}
      <div style={{ perspective: '900px', width: LOGO_REST_H, height: LOGO_REST_H }}>
        {/* Rotating inner — GSAP drives rotateX; outer wrapper gets position/scale */}
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
              At parent=180deg the combined transform = identity so it appears
              right-side-up with no additional mirror needed. */}
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
  )
}
