'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { Ticket } from 'lucide-react'

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1]

const MAX_PUFFS = 60

// Desktop: tight, controlled — "Geometric Silence" prestige direction
const D = { count: 9, minSize: 15, maxSize: 31, minDist: 24, maxDist: 54, stagger: 180, dur: 1800 }
// Mobile: ~65% scale of desktop values
const M = { count: 6, minSize: 10, maxSize: 20, minDist: 16, maxDist: 35, stagger: 120, dur: 1500 }

function rnd(min: number, max: number) { return min + Math.random() * (max - min) }

export default function AllEventsButton({ href = '/events/upcoming' }: { href?: string }) {
  const reduce   = useReducedMotion()
  const stageRef = useRef<HTMLDivElement>(null)
  const countRef = useRef(0)
  const touchRef = useRef(false)
  const [hovered, setHovered] = useState(false)

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

      if (countRef.current + cfg.count > MAX_PUFFS) return

      const rect = stage.getBoundingClientRect()
      const ox   = clientX - rect.left
      const oy   = clientY - rect.top

      for (let i = 0; i < cfg.count; i++) {
        const size  = rnd(cfg.minSize, cfg.maxSize)
        const dist  = rnd(cfg.minDist, cfg.maxDist)
        // Narrow ~68° cone (±0.6 rad) centred on Math.PI — leftward from cursor
        const angle = Math.PI + (Math.random() * 1.2 - 0.6)
        const dx    = Math.cos(angle) * dist
        const dy    = Math.sin(angle) * dist
        const delay = Math.random() * cfg.stagger

        const puff = document.createElement('div')
        Object.assign(puff.style, {
          position:     'absolute',
          width:        `${size}px`,
          height:       `${size}px`,
          borderRadius: '50%',
          background:   'radial-gradient(circle, rgba(200,255,63,0.42) 0%, rgba(200,255,63,0.11) 55%, rgba(200,255,63,0) 75%)',
          pointerEvents:'none',
          left:         `${ox - size / 2}px`,
          top:          `${oy - size / 2}px`,
          willChange:   'transform, opacity',
        })

        stage.appendChild(puff)
        countRef.current++

        // 3 keyframes: opacity holds at peak (0.58) until offset 0.5 (=0.9s),
        // then fades to 0. Transform/scale runs the full 1.8s with a snappy
        // cubic-bezier so puffs feel placed, not drifting.
        const anim = puff.animate(
          [
            { transform: 'translate(0,0) scale(0.4)', opacity: 0.58 },
            { opacity: 0.58, offset: 0.5 },
            { transform: `translate(${dx}px,${dy}px) scale(1.65)`, opacity: 0 },
          ],
          { duration: cfg.dur, delay, easing: 'cubic-bezier(0.16,1,0.3,1)', fill: 'forwards' }
        )

        let done = false
        const cleanup = () => {
          if (done) return
          done = true
          puff.remove()
          countRef.current = Math.max(0, countRef.current - 1)
        }
        anim.onfinish = cleanup
        setTimeout(cleanup, 3000)
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
      // No preventDefault — lets touchend → click fire so Link navigation works on same tap
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
        Stage: -80px inset covers max puff travel (54px) + max puff radius (15.5px)
        with ~10px margin. Reduced from -260px (old 230px travel max).
      */}
      <div
        ref={stageRef}
        aria-hidden="true"
        style={{
          position:      'absolute',
          inset:         '-80px',
          pointerEvents: 'none',
          zIndex:        0,
        }}
      />

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
        }}
      >
        <span>All Events</span>

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
