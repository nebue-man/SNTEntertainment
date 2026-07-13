'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { HeroSlide } from '@/lib/types'
import PlaceholderMedia from '@/components/ui/PlaceholderMedia'
import SplitHeadline from '@/components/ui/SplitHeadline'

interface Props {
  slides: HeroSlide[]
  heading: string
  tagline: string
}

const AUTOPLAY_MS = 4500

export default function HeroCarousel({ slides, heading, tagline }: Props) {
  const [index, setIndex] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function advance() {
    setIndex((i) => (i + 1) % slides.length)
  }

  useEffect(() => {
    timerRef.current = setInterval(advance, AUTOPLAY_MS)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [slides.length])

  function goTo(i: number) {
    if (timerRef.current) clearInterval(timerRef.current)
    setIndex(i)
    timerRef.current = setInterval(advance, AUTOPLAY_MS)
  }

  const slide = slides[index]

  return (
    <section className="relative w-full h-screen overflow-hidden" aria-label="Hero carousel">
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
                autoPlay
                muted
                loop
                playsInline
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
          <div className="absolute inset-0 bg-absolute-zero/50" />
        </motion.div>
      </AnimatePresence>

      <div
        className="relative z-10 flex flex-col justify-end h-full pb-16 md:pb-24"
        style={{ paddingLeft: 'var(--headline-padding-x)', paddingRight: 'var(--headline-padding-x)' }}
      >
        <SplitHeadline
          text={heading}
          as="h1"
          className="text-ghost-white font-light leading-none mb-4"
          style={{ fontSize: 'var(--text-display-sm)' }}
          once={false}
        />
        <motion.p
          className="text-body-lg text-ghost-white/80 font-light max-w-lg"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {tagline}
        </motion.p>

        <div className="flex gap-2 mt-8" role="tablist" aria-label="Carousel slides">
          {slides.map((s, i) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={i === index}
              aria-label={`Slide ${i + 1}`}
              onClick={() => goTo(i)}
              className="h-px w-8 transition-all duration-300"
              style={{ backgroundColor: i === index ? 'var(--color-ghost-white)' : 'var(--color-pewter)' }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
