'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, type TargetAndTransition, type Transition } from 'framer-motion'
import Image from 'next/image'
import type { PastApiEvent } from '@/lib/types'

// ── Constants ──────────────────────────────────────────────────────────────────

const CARD_W = 240
const CARD_H = 320
const SPACING = 260
const TILT_DEG = 30
const Z_RECESSION = 130
const VISIBLE_RANGE = 3.5
const TICK_MS = 80
const ROTATION_PER_TICK = 0.032

// ── Gallery overlay ────────────────────────────────────────────────────────────

function GalleryOverlay({
  event,
  onClose,
}: {
  event: PastApiEvent
  onClose: () => void
}) {
  const photos = event.media.filter((m) => m.type === 'PHOTO')
  const [idx, setIdx] = useState(0)
  const touchStartX = useRef<number | null>(null)

  const prev = useCallback(() => setIdx((i) => Math.max(0, i - 1)), [])
  const next = useCallback(
    () => setIdx((i) => Math.min(photos.length - 1, i + 1)),
    [photos.length]
  )

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prev, next, onClose])

  const photo = photos[idx] ?? null

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
        <div>
          <p className="text-ghost-white font-light text-[15px] leading-snug">{event.title}</p>
          <p className="text-pewter text-[11px] mt-0.5 tracking-wide">
            {event.venue}&nbsp;&middot;&nbsp;{new Date(event.eventDate).getFullYear()}
          </p>
        </div>
        <div className="flex items-center gap-5">
          {photos.length > 0 && (
            <span className="text-pewter/50 text-[11px] tabular-nums">
              {idx + 1} / {photos.length}
            </span>
          )}
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors"
            aria-label="Close gallery"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Photo */}
      <div
        className="flex-1 relative select-none"
        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return
          const dx = e.changedTouches[0].clientX - touchStartX.current
          if (dx < -50) next()
          if (dx > 50) prev()
          touchStartX.current = null
        }}
      >
        {photo ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={photo.id}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Image
                src={photo.url}
                alt={`${event.title} — photo ${idx + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-pewter/50 text-[13px]">No photos for this event.</p>
          </div>
        )}

        {/* Arrow buttons */}
        {photos.length > 1 && (
          <>
            <button
              onClick={prev}
              disabled={idx === 0}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-black/80 disabled:opacity-20 rounded-full transition-all"
              aria-label="Previous photo"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={next}
              disabled={idx === photos.length - 1}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-black/80 disabled:opacity-20 rounded-full transition-all"
              aria-label="Next photo"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Dot indicators */}
      {photos.length > 1 && (
        <div className="flex items-center justify-center gap-2 py-4 shrink-0">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`rounded-full transition-all duration-200 ${
                i === idx
                  ? 'w-4 h-1.5 bg-electric-lime'
                  : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Photo ${i + 1}`}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}

// ── Coverflow ──────────────────────────────────────────────────────────────────

export default function PastEventsCoverflow({ events }: { events: PastApiEvent[] }) {
  const N = events.length

  // Rotation state — float that increases monotonically
  const centerRef = useRef(0)
  const [displayCenter, setDisplayCenter] = useState(0)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pausedRef = useRef(false)

  // Interaction state
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [clickingId, setClickingId] = useState<string | null>(null)
  const [activeEvent, setActiveEvent] = useState<PastApiEvent | null>(null)

  // Auto-rotation
  useEffect(() => {
    if (N === 0) return
    tickRef.current = setInterval(() => {
      if (!pausedRef.current) {
        centerRef.current += ROTATION_PER_TICK
        setDisplayCenter(centerRef.current)
      }
    }, TICK_MS)
    return () => { if (tickRef.current) clearInterval(tickRef.current) }
  }, [N])

  const pause = useCallback(() => { pausedRef.current = true }, [])
  const resume = useCallback(() => { pausedRef.current = false }, [])

  // Compute shortest-path offset from current center to card at index i
  function getOffset(i: number): number {
    if (N === 0) return 0
    const eff = ((displayCenter % N) + N) % N
    let d = i - eff
    if (d > N / 2) d -= N
    if (d < -N / 2) d += N
    return d
  }

  function handleCardClick(event: PastApiEvent) {
    if (clickingId) return
    pause()
    setClickingId(event.id)
    // Launch gallery after warp animation completes
    setTimeout(() => setActiveEvent(event), 580)
  }

  const handleGalleryClose = useCallback(() => {
    setActiveEvent(null)
    setTimeout(() => {
      setClickingId(null)
      resume()
    }, 350)
  }, [resume])

  if (N === 0) {
    return (
      <div
        className="min-h-[60vh] flex items-center"
        style={{ paddingLeft: 'var(--headline-padding-x)', paddingRight: 'var(--headline-padding-x)' }}
      >
        <p className="text-pewter/50 text-[13px]">No past events yet.</p>
      </div>
    )
  }

  return (
    <div className="relative bg-black overflow-hidden" style={{ minHeight: '80vh' }}>
      {/* Page header */}
      <div
        className="pt-36 pb-10"
        style={{ paddingLeft: 'var(--headline-padding-x)', paddingRight: 'var(--headline-padding-x)' }}
      >
        <p className="text-[11px] text-electric-lime tracking-[0.25em] uppercase mb-4">Portfolio</p>
        <h1
          className="text-ghost-white font-light"
          style={{ fontSize: 'var(--text-heading-sm)' }}
        >
          Past Events
        </h1>
      </div>

      {/* Coverflow stage */}
      <div
        className="relative w-full"
        style={{
          height: CARD_H + 100,
          perspective: '1400px',
          perspectiveOrigin: '50% 50%',
        }}
        onMouseLeave={() => {
          setHoveredId(null)
          if (!clickingId) resume()
        }}
      >
        {events.map((event, i) => {
          const d = getOffset(i)
          if (Math.abs(d) > VISIBLE_RANGE) return null

          const isHovered = hoveredId === event.id
          const isSelected = clickingId === event.id
          const isWarping = !!clickingId

          const coverPhoto = event.media.find((m) => m.type === 'PHOTO') ?? null

          // Base transform values
          const baseX = d * SPACING - CARD_W / 2
          const baseRotY = d * -TILT_DEG
          const baseZ = -Math.abs(d) * Z_RECESSION
          const baseScale = Math.max(0.58, 1 - Math.abs(d) * 0.13)
          const baseOpacity = Math.max(0, 1 - Math.abs(d) * 0.32)

          // Animate props for each state
          let anim: TargetAndTransition
          let trans: Transition

          if (isWarping && isSelected) {
            anim = { x: baseX, rotateY: 0, z: 900, scale: 7, opacity: 0 }
            trans = { duration: 0.55, ease: [0.55, 0, 1, 0.45] }
          } else if (isWarping) {
            anim = { x: baseX, rotateY: baseRotY, z: baseZ - 40, scale: baseScale * 0.55, opacity: 0 }
            trans = { duration: 0.4, ease: 'easeIn' }
          } else if (isHovered) {
            anim = { x: baseX, rotateY: 0, z: baseZ + 90, scale: baseScale * 1.1, opacity: 1 }
            trans = { duration: 0.25, ease: [0.22, 1, 0.36, 1] }
          } else {
            anim = { x: baseX, rotateY: baseRotY, z: baseZ, scale: baseScale, opacity: baseOpacity }
            trans = { duration: 0.12, ease: 'linear' }
          }

          return (
            <motion.div
              key={event.id}
              className="absolute cursor-pointer"
              style={{
                left: '50%',
                top: '50%',
                width: CARD_W,
                height: CARD_H,
                marginTop: -CARD_H / 2,
                transformStyle: 'preserve-3d',
                zIndex: Math.round(10 - Math.abs(d) * 2),
              }}
              animate={anim}
              transition={trans}
              onClick={() => handleCardClick(event)}
              onHoverStart={() => {
                if (clickingId) return
                setHoveredId(event.id)
                pause()
              }}
              onHoverEnd={() => {
                setHoveredId(null)
                if (!clickingId) resume()
              }}
              onTouchStart={pause}
              onTouchEnd={() => { if (!clickingId) resume() }}
            >
              <div className="relative w-full h-full rounded-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
                {coverPhoto ? (
                  <Image
                    src={coverPhoto.url}
                    alt={event.title}
                    fill
                    sizes="240px"
                    className="object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-[#161616] flex items-center justify-center">
                    <span className="text-pewter/40 text-[10px] tracking-widest uppercase">No Photos</span>
                  </div>
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                {/* Caption */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-ghost-white font-light text-[13px] leading-snug line-clamp-2">
                    {event.title}
                  </p>
                  <p className="text-pewter/70 text-[10px] mt-1 tracking-wider">
                    {new Date(event.eventDate).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Hint text */}
      <AnimatePresence>
        {!clickingId && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-pewter/30 text-[10px] tracking-[0.25em] uppercase mt-8 pb-16 select-none"
          >
            Click any event to explore photos
          </motion.p>
        )}
      </AnimatePresence>

      {/* Gallery overlay */}
      <AnimatePresence>
        {activeEvent && (
          <GalleryOverlay event={activeEvent} onClose={handleGalleryClose} />
        )}
      </AnimatePresence>
    </div>
  )
}
