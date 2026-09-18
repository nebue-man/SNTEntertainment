'use client'

import { useEffect, useRef, useState } from 'react'

export default function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) {
      setIsTouch(true)
      return
    }

    document.documentElement.classList.add('custom-cursor')

    let x = 0, y = 0
    let ringX = 0, ringY = 0
    let rafId: number

    function onMove(e: MouseEvent) {
      x = e.clientX
      y = e.clientY
    }

    document.addEventListener('mousemove', onMove)

    function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

    function tick() {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${x - 4}px, ${y - 4}px)`
      }
      ringX = lerp(ringX, x, 0.12)
      ringY = lerp(ringY, y, 0.12)
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringX - 16}px, ${ringY - 16}px)`
      }
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)

    return () => {
      document.documentElement.classList.remove('custom-cursor')
      document.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  if (isTouch) return null

  return (
    <>
      {/* mix-blend-mode: difference inverts the cursor against whatever content is beneath —
          white on dark backgrounds, dark on light backgrounds, automatically. */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 z-[9999] w-2 h-2 rounded-full pointer-events-none"
        style={{
          backgroundColor: 'white',
          mixBlendMode: 'difference',
        }}
      />
      <div
        ref={ringRef}
        className="fixed top-0 left-0 z-[9998] w-8 h-8 rounded-full border pointer-events-none"
        style={{
          borderColor: 'white',
          mixBlendMode: 'difference',
        }}
      />
    </>
  )
}
