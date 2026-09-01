'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { Ticket } from 'lucide-react'

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1]

// How many puff DOM nodes may exist simultaneously across all active bursts
const MAX_PUFFS = 60

// Desktop smoke config
const D = { count: 10, minSize: 30, maxSize: 74, minDist: 90,  maxDist: 230, stagger: 220, dur: 1800 }
// Mobile smoke config — ~65% scale, lighter puff count
const M = { count:  7, minSize: 18, maxSize: 50, minDist: 55,  maxDist: 155, stagger: 180, dur: 1500 }

function rnd(min: number, max: number) { return min + Math.random() * (max - min) }

export default function AllEventsButton({ href = '/events/upcoming' }: { href?: string }) {
  const reduce   = useReducedMotion()
  const stageRef = useRef<HTMLDivElement>(null)
  const countRef = useRef(0)   // total live puff elements right now
  const touchRef = useRef(false)
  const [hovered, setHovered] = useState(false)

  // Detect touch-primary device once on mount (avoids SSR mismatch)
  useEffect(() => {
    touchRef.current =
      'ontouchstart' in window || window.matchMedia('(hover: none)').matches
  }, [])

  const spawnBurst = useCallback(
    (clientX: number, clientY: number) => {
      if (reduce) return
      const stage = stageRef.current
      if (!stage) return

      const cfg = touchRef.current ? M : D

      // Drop the whole burst if we'd exceed the cap — prevents unbounded growth
      // from rapid repeated hovers. Existing bursts continue their own fade-out.
      if (countRef.current + cfg.count > MAX_PUFFS) return

      const rect = stage.getBoundingClientRect()
      const ox   = clientX - rect.left   // cursor x in stage coordinate space
      const oy   = clientY - rect.top    // cursor y in stage coordinate space

      for (let i = 0; i < cfg.count; i++) {
        const size  = rnd(cfg.minSize, cfg.maxSize)
        const dist  = rnd(cfg.minDist, cfg.maxDist)
        // Upward/outward bias: angles span the upper semicircle (-20° to -160°
        // from horizontal), so smoke rises and fans sideways without going downward.
        const angleDeg = -20 - Math.random() * 140
        const rad      = (angleDeg * Math.PI) / 180
        const dx       = Math.cos(rad) * dist
        const dy       = Math.sin(rad) * dist
        const delay    = Math.random() * cfg.stagger

        const puff = document.createElement('div')
        Object.assign(puff.style, {
          position:     'absolute',
          width:        `${size}px`,
          height:       `${size}px`,
          borderRadius: '50%',
          background:   'radial-gradient(circle, rgba(200,255,63,0.45) 0%, rgba(200,255,63,0.12) 55%, rgba(200,255,63,0) 75%)',
          pointerEvents:'none',
          left:         `${ox - size / 2}px`,
          top:          `${oy - size / 2}px`,
          willChange:   'transform, opacity',
        })

        stage.appendChild(puff)
        countRef.current++

        const anim = puff.animate(
          [
            { transform: 'translate(0,0) scale(0.4)', opacity: 0.9 },
            { transform: `translate(${dx}px,${dy}px) scale(2.6)`, opacity: 0 },
          ],
          { duration: cfg.dur, delay, easing: 'cubic-bezier(0.1,0.9,0.3,1)', fill: 'forwards' }
        )

        // Guard against double-cleanup (onfinish + setTimeout both firing)
        let done = false
        const cleanup = () => {
          if (done) return
          done = true
          puff.remove()
          countRef.current = Math.max(0, countRef.current - 1)
        }
        anim.onfinish = cleanup
        // Safety fallback — cleans up even if the Web Animations API fires no finish event
        setTimeout(cleanup, delay + cfg.dur + 250)
      }
    },
    [reduce]
  )

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent) => {
      setHovered(true)
      spawnBurst(e.clientX, e.clientY)
    },
    [spawnBurst]
  )

  const handleMouseLeave = useCallback(() => setHovered(false), [])

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      touchRef.current = true
      const t = e.touches[0]
      if (t) spawnBurst(t.clientX, t.clientY)
      // Do NOT call preventDefault() — lets touchend → click fire naturally so
      // Link navigation works on the same tap (avoids iOS "first-tap hover" trap)
    },
    [spawnBurst]
  )

  return (
    <motion.div
      whileTap={{ scale: reduce ? 1 : 0.97 }}
      transition={{ type: 'spring', duration: 0.3, bounce: 0.15 }}
      style={{ position: 'relative', display: 'inline-block', isolation: 'isolate' }}
    >
      {/*
        Smoke stage — extends 260px beyond the button on every side so puffs
        (max travel 230px) never clip against the button's own bounding box.
        position:absolute taken out of flow, so it won't push page layout.
        overflow:visible (default) lets puffs spill outside this div's rect
        without needing a full-viewport overlay.
      */}
      <div
        ref={stageRef}
        aria-hidden="true"
        style={{
          position:      'absolute',
          inset:         '-260px',
          pointerEvents: 'none',
          zIndex:        0,
        }}
      />

      {/* Button sits above the smoke stage in the same stacking context */}
      <Link
        href={href}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        className="inline-flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d3fd50] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        style={{
          position:      'relative',
          zIndex:        1,
          fontFamily:    'var(--font-body)',
          fontSize:      'var(--text-body-sm)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color:         'var(--color-electric-lime)',
          // 16px vertical × 2 + 13px font = 45px — meets 44px minimum touch target
          padding:       '16px 20px',
          // No border, no background — floating text + icon only
        }}
      >
        <span>All Events</span>

        {/* Ticket icon slides 4px right on desktop hover — preserved from original */}
        <motion.span
          animate={{ x: hovered && !reduce ? 4 : 0 }}
          transition={{ duration: 0.15, ease: EASE_OUT }}
          style={{ display: 'flex', alignItems: 'center', lineHeight: 0 }}
          aria-hidden="true"
        >
          <Ticket size={15} strokeWidth={1.5} />
        </motion.span>
      </Link>
    </motion.div>
  )
}
