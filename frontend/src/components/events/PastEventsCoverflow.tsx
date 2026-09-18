'use client'
import { memo, startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence, type TargetAndTransition, type Transition } from 'framer-motion'
import type { PastApiEvent } from '@/lib/types'
import { resolveMediaUrl } from '@/lib/mediaUrl'

// ── Constants ──────────────────────────────────────────────────────────────────

const CARD_W = 240
const CARD_H = 320
const SPACING = 260
const TILT_DEG = 30
const Z_RECESSION = 130
const VISIBLE_RANGE = 3.5
const TICK_MS = 80
const ROTATION_PER_TICK = 0.032

// ── Touch-drag tuning ──────────────────────────────────────────────────────────
// Touch slop before a touch is treated as a horizontal drag rather than a tap
// or vertical scroll (matches typical iOS/Android touch-slop conventions).
const DRAG_AXIS_THRESHOLD = 8
// Minimum net horizontal travel (px) required on release to flip rotation
// direction — below this, a barely-moved touch keeps the current direction.
const SWIPE_DIRECTION_MIN = 4
const SNAP_DURATION_MS = 280
const SNAP_EASE = [0.22, 1, 0.36, 1] as const
const IDLE_RESET_MS = 3000

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
      className="fixed inset-0 z-[10000] bg-black flex flex-col"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeIn' }}
    >
      {/* Close button — fixed to gallery top-right, isolated from nav */}
      <button
        onClick={onClose}
        className="absolute top-4 right-6 z-10 w-11 h-11 flex items-center justify-center text-white/40 hover:text-white transition-colors"
        aria-label="Close gallery"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      {/* Header */}
      <div className="flex items-center justify-between pl-6 pr-20 py-5 border-b border-white/10 shrink-0">
        <div>
          <p className="text-ghost-white font-light text-[17px] leading-tight">{event.title}</p>
          <p className="text-pewter text-[13px] mt-2 tracking-wide">
            {event.venue}&nbsp;&middot;&nbsp;{new Date(event.eventDate).getFullYear()}
          </p>
        </div>
        {photos.length > 0 && (
          <span className="text-pewter/50 text-[13px] tabular-nums">
            {idx + 1} / {photos.length}
          </span>
        )}
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
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveMediaUrl(photo.url)}
                alt={`${event.title} — photo ${idx + 1}`}
                className="absolute inset-0 w-full h-full object-contain"
              />
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-pewter/50 text-[15px]">No photos for this event.</p>
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

// ── Card ───────────────────────────────────────────────────────────────────────

type DragPhase = 'idle' | 'dragging' | 'snapping'

interface CoverflowCardProps {
  event: PastApiEvent
  d: number
  isHovered: boolean
  isWarping: boolean
  isSelected: boolean
  dragPhase: DragPhase
  onHoverStart: () => void
  onHoverEnd: () => void
  onClick: () => void
}

const CoverflowCard = memo(function CoverflowCard({
  event,
  d,
  isHovered,
  isWarping,
  isSelected,
  dragPhase,
  onHoverStart,
  onHoverEnd,
  onClick,
}: CoverflowCardProps) {
  const coverPhoto = event.media.find((m) => m.type === 'PHOTO') ?? null

  const baseX       = d * SPACING - CARD_W / 2
  const baseRotY    = d * -TILT_DEG
  const baseZ       = -Math.abs(d) * Z_RECESSION
  const baseScale   = Math.max(0.58, 1 - Math.abs(d) * 0.13)
  const baseOpacity = Math.max(0, 1 - Math.abs(d) * 0.32)

  const anim = useMemo<TargetAndTransition>(() => {
    if (isWarping && isSelected)
      return { x: baseX, rotateY: 0, z: 900, scale: 7, opacity: 0 }
    if (isWarping)
      return { x: baseX, rotateY: baseRotY, z: baseZ - 40, scale: baseScale * 0.55, opacity: 0 }
    if (isHovered)
      return { x: baseX, rotateY: 0, z: baseZ + 90, scale: baseScale * 1.1, opacity: 1 }
    return { x: baseX, rotateY: baseRotY, z: baseZ, scale: baseScale, opacity: baseOpacity }
  }, [baseX, baseRotY, baseZ, baseScale, baseOpacity, isHovered, isWarping, isSelected])

  const trans = useMemo<Transition>(() => {
    if (isWarping && isSelected)   return { duration: 0.55, ease: [0.55, 0, 1, 0.45] as const }
    if (isWarping)                 return { duration: 0.4,  ease: 'easeIn' }
    if (isHovered)                 return { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const }
    // Dragging: zero-duration so the track teleports to each touchmove
    // position instead of easing toward it — this is what makes it track
    // the finger 1:1 with no perceptible lag.
    if (dragPhase === 'dragging')  return { duration: 0 }
    // Snapping: eases from wherever the finger let go to the nearest card
    // boundary, reusing the same deceleration curve as the hover transition
    // so the drag-release motion reads as part of the same motion language.
    if (dragPhase === 'snapping')  return { duration: SNAP_DURATION_MS / 1000, ease: SNAP_EASE }
    return                                { duration: 0.12, ease: 'linear' }
  }, [isHovered, isWarping, isSelected, dragPhase])

  const cardStyle = useMemo(() => ({
    left: '50%' as const,
    top: '50%' as const,
    width: CARD_W,
    height: CARD_H,
    marginTop: -CARD_H / 2,
    transformStyle: 'preserve-3d' as const,
    zIndex: Math.round(10 - Math.abs(d) * 2),
    willChange: (isHovered || isWarping) ? 'transform' : 'auto',
  }), [d, isHovered, isWarping])

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={cardStyle}
      animate={anim}
      transition={trans}
      onClick={onClick}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
    >
      <div className="relative w-full h-full rounded-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
        {coverPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolveMediaUrl(coverPhoto.url)}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-[#161616] flex items-center justify-center">
            <span className="text-pewter/40 text-[10px] tracking-widest uppercase">No Photos</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-ghost-white font-light text-[15px] leading-snug line-clamp-2">
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
})

// ── Coverflow ──────────────────────────────────────────────────────────────────

export default function PastEventsCoverflow({ events, initialSlug }: { events: PastApiEvent[]; initialSlug?: string }) {
  const N = events.length

  // Rotation state — float that increases (or decreases) monotonically
  const centerRef = useRef(0)
  const [displayCenter, setDisplayCenter] = useState(0)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pausedRef = useRef(false)
  // Snapshot of displayCenter taken at hover-start so pending transitions
  // can't shift d mid-hover and cause a Framer Motion re-target snap.
  const frozenCenter = useRef(0)
  // +1 = original default direction, -1 = reversed by the user's last drag.
  const directionRef = useRef<1 | -1>(1)
  const idleResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)

  // Interaction state
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [clickingId, setClickingId] = useState<string | null>(null)
  const [activeEvent, setActiveEvent] = useState<PastApiEvent | null>(null)
  const [dragPhase, setDragPhase] = useState<DragPhase>('idle')

  // Auto-rotation
  useEffect(() => {
    if (N === 0) return
    tickRef.current = setInterval(() => {
      if (!pausedRef.current) {
        centerRef.current += directionRef.current * ROTATION_PER_TICK
        startTransition(() => setDisplayCenter(centerRef.current))
      }
    }, TICK_MS)
    return () => { if (tickRef.current) clearInterval(tickRef.current) }
  }, [N])

  const pause = useCallback(() => { pausedRef.current = true }, [])
  const resume = useCallback(() => { pausedRef.current = false }, [])

  // Touch drag — mobile/touch only. Deliberately wired via native listeners
  // (not React's onTouchMove) because React attaches touch handlers as
  // passive by default, so preventDefault() there can't stop page scroll.
  // Mouse/pointer events are never bound here, so desktop behavior
  // (hover-pause via Framer's onHoverStart/onHoverEnd) is untouched.
  useEffect(() => {
    const el = stageRef.current
    if (!el || N === 0) return

    type DragState = { active: boolean; startX: number; startY: number; startCenter: number; lastX: number }
    let drag: DragState | null = null

    function clearIdleTimer() {
      if (idleResetTimerRef.current) {
        clearTimeout(idleResetTimerRef.current)
        idleResetTimerRef.current = null
      }
    }

    function onTouchStart(e: TouchEvent) {
      if (clickingId) return // don't hijack the click-to-gallery warp animation
      clearIdleTimer() // a new interaction cancels the pending reset-to-default
      const t = e.touches[0]
      drag = { active: false, startX: t.clientX, startY: t.clientY, startCenter: centerRef.current, lastX: t.clientX }
      pause()
    }

    function onTouchMove(e: TouchEvent) {
      if (!drag) return
      const t = e.touches[0]
      const dx = t.clientX - drag.startX
      const dy = t.clientY - drag.startY

      if (!drag.active) {
        if (Math.abs(dx) < DRAG_AXIS_THRESHOLD && Math.abs(dy) < DRAG_AXIS_THRESHOLD) return
        if (Math.abs(dy) > Math.abs(dx)) {
          // Vertical intent — this is a page scroll, not a carousel drag.
          drag = null
          if (!clickingId) resume()
          return
        }
        drag.active = true
        setDragPhase('dragging')
      }

      // Horizontal drag confirmed — stop the page from scrolling under the finger.
      e.preventDefault()
      drag.lastX = t.clientX
      // 1:1 with the finger: pixels moved right shift the track right by the
      // same pixel amount (baseX = d * SPACING, so dividing by SPACING here
      // converts the pixel delta into the matching offset in "d" units).
      const newCenter = drag.startCenter - dx / SPACING
      centerRef.current = newCenter
      setDisplayCenter(newCenter)
    }

    function onTouchEnd() {
      const finished = drag
      drag = null

      if (!finished || !finished.active) {
        // Tap or aborted vertical scroll — nothing moved, just resume.
        if (!clickingId) resume()
        return
      }

      const dx = finished.lastX - finished.startX
      if (Math.abs(dx) > SWIPE_DIRECTION_MIN) {
        // Dragged right (finger moved toward positive x) reveals the
        // "previous" side, so rotation resumes reversed; dragged left
        // continues in the original forward direction.
        directionRef.current = dx > 0 ? -1 : 1
      }

      // Snap to the nearest card boundary with a smooth eased transition.
      const target = Math.round(centerRef.current)
      centerRef.current = target
      setDragPhase('snapping')
      setDisplayCenter(target)

      window.setTimeout(() => {
        setDragPhase('idle')
        if (!clickingId) resume()
      }, SNAP_DURATION_MS)

      // 3s of no further touch interaction resets direction to default.
      idleResetTimerRef.current = setTimeout(() => {
        directionRef.current = 1
        idleResetTimerRef.current = null
      }, IDLE_RESET_MS)
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
    el.addEventListener('touchcancel', onTouchEnd, { passive: true })

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
      el.removeEventListener('touchcancel', onTouchEnd)
      clearIdleTimer()
    }
  }, [N, clickingId, pause, resume])

  // Deep-link support: when ?event=<slug> is present (e.g., navigated from
  // the homepage "Our work speaks" strip), auto-open that event's gallery.
  useEffect(() => {
    if (!initialSlug || events.length === 0) return
    const targetIdx = events.findIndex((e) => e.slug === initialSlug)
    if (targetIdx < 0) return
    const target = events[targetIdx]
    // Center the carousel on this event so the coverflow is in the right
    // position when the gallery is later closed.
    centerRef.current = targetIdx
    setDisplayCenter(targetIdx)
    pause()
    setActiveEvent(target)
  }, [initialSlug, events, pause])

  function getOffset(i: number): number {
    if (N === 0) return 0
    const center = hoveredId !== null ? frozenCenter.current : displayCenter
    const eff = ((center % N) + N) % N
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
        <p className="text-pewter/50 text-[15px]">No past events yet.</p>
      </div>
    )
  }

  return (
    <div className="relative bg-black overflow-hidden">
      {/* Page header */}
      <div
        className="pb-10"
        style={{ paddingLeft: 'var(--headline-padding-x)', paddingRight: 'var(--headline-padding-x)' }}
      >
        <h1
          className="text-ghost-white font-light"
          style={{ fontSize: 'var(--text-heading-sm)' }}
        >
          PAST EVENTS
        </h1>
      </div>

      {/* Coverflow stage */}
      <div
        ref={stageRef}
        className="relative w-full touch-pan-y"
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

          const isHovered  = hoveredId === event.id
          const isSelected = clickingId === event.id
          const isWarping  = !!clickingId

          return (
            <CoverflowCard
              key={event.id}
              event={event}
              d={d}
              isHovered={isHovered}
              isWarping={isWarping}
              isSelected={isSelected}
              dragPhase={dragPhase}
              onHoverStart={() => {
                if (clickingId) return
                frozenCenter.current = displayCenter
                setHoveredId(event.id)
                pause()
              }}
              onHoverEnd={() => {
                setHoveredId(null)
                if (!clickingId) resume()
              }}
              onClick={() => handleCardClick(event)}
            />
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
            className="text-center text-pewter/30 text-[10px] tracking-[0.25em] uppercase mt-8 pb-[96px] select-none"
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
