'use client'
import { ReactLenis, useLenis } from 'lenis/react'
import gsap from 'gsap'
import { useEffect, type ReactNode } from 'react'

function GsapSync() {
  const lenis = useLenis()
  useEffect(() => {
    if (!lenis) return
    gsap.ticker.lagSmoothing(0)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [lenis])
  return null
}

export default function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={{ anchors: true, allowNestedScroll: true, autoRaf: false }}>
      <GsapSync />
      {children}
    </ReactLenis>
  )
}
