'use client'

import { useRef, useCallback, useEffect } from 'react'
import { useReducedMotion } from 'framer-motion'

const COLORS  = ['#c8ff3f', '#a8e02f', '#8fae2c', '#dfff8a', '#6f8f22', '#b6f050']
const COUNT   = 36
const DURATION = 700 // ms
const CW = 320
const CH = 240

function easeOut(t: number): number {
  // cubic-bezier(.15, .8, .3, 1)
  return 1 - Math.pow(1 - t, 2.2)
}

interface Dot {
  angle: number
  dist:  number
  drift: number
  r:     number
  color: string
}

function makeDots(): Dot[] {
  return Array.from({ length: COUNT }, () => ({
    angle: Math.random() * Math.PI * 2,
    dist:  40 + Math.random() * 60,
    drift: 20 + Math.random() * 30,
    r:     1 + Math.random() * 1.75, // radius 1–2.75px → diameter 2–5.5px
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }))
}

export default function GetInTouchButton({ onClick }: { onClick?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef<number | null>(null)
  const startRef  = useRef<number | null>(null)
  const dotsRef   = useRef<Dot[]>([])
  const reduce    = useReducedMotion()

  // HiDPI canvas sizing — run once on mount
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    canvas.width        = CW * dpr
    canvas.height       = CH * dpr
    canvas.style.width  = `${CW}px`
    canvas.style.height = `${CH}px`
  }, [])

  // Cleanup rAF on unmount
  useEffect(() => () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
  }, [])

  const draw = useCallback((ts: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (startRef.current === null) startRef.current = ts
    const t        = Math.min((ts - startRef.current) / DURATION, 1)
    const progress = easeOut(t)
    const alpha    = 1 - t  // linear fade to 0

    const dpr = window.devicePixelRatio || 1
    const hw  = (CW / 2) * dpr
    const hh  = (CH / 2) * dpr

    ctx.clearRect(0, 0, CW * dpr, CH * dpr)
    ctx.globalAlpha = alpha

    for (const d of dotsRef.current) {
      const x = hw + Math.cos(d.angle) * d.dist  * progress * dpr
      // downward drift added as a squared term (gravity feel)
      const y = hh + Math.sin(d.angle) * d.dist  * progress * dpr
                   + d.drift           * progress * progress * dpr
      ctx.beginPath()
      ctx.arc(x, y, d.r * dpr, 0, Math.PI * 2)
      ctx.fillStyle = d.color
      ctx.fill()
    }

    ctx.globalAlpha = 1

    if (t < 1) {
      rafRef.current = requestAnimationFrame(draw)
    } else {
      ctx.clearRect(0, 0, CW * dpr, CH * dpr)
      rafRef.current = null
    }
  }, [])

  const burst = useCallback(() => {
    if (reduce) return

    // Cancel any in-progress burst — prevents DOM / rAF accumulation
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }

    startRef.current = null
    dotsRef.current  = makeDots()

    // Clear canvas from previous burst before starting
    const canvas = canvasRef.current
    if (canvas) {
      const dpr = window.devicePixelRatio || 1
      const ctx = canvas.getContext('2d')
      ctx?.clearRect(0, 0, CW * dpr, CH * dpr)
    }

    rafRef.current = requestAnimationFrame(draw)
  }, [reduce, draw])

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Particle canvas — centered behind button text, pointer-events off */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position:      'absolute',
          top:           '50%',
          left:          '50%',
          transform:     'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex:        0,
        }}
      />

      <button
        onClick={onClick}
        onMouseEnter={burst}
        aria-label="Get In Touch — send us an email"
        style={{
          position:      'relative',
          zIndex:        1,
          fontFamily:    'var(--font-body)',
          fontSize:      'var(--text-body-sm)',
          fontWeight:    500,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color:         'var(--color-electric-lime)',
          cursor:        'pointer',
          padding:       '10px 6px',
          lineHeight:    1,
        }}
      >
        GET IN TOUCH
      </button>
    </div>
  )
}
