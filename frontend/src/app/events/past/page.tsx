'use client'

import { Suspense, useEffect, useState, useCallback, useMemo } from 'react'
import { getPastEventsWithMedia } from '@/lib/api'
import DepthCarousel from '@/components/media/DepthCarousel'
import LoadingGate from '@/components/ui/LoadingGate'
import { resolveMediaUrl } from '@/lib/mediaUrl'
import type { PastApiEvent } from '@/lib/types'

function collectItems(events: PastApiEvent[]): { image: string; alt: string }[] {
  const items: { image: string; alt: string }[] = []
  for (const ev of events) {
    if (ev.flyerUrl) {
      items.push({ image: resolveMediaUrl(ev.flyerUrl), alt: ev.title })
    }
    for (const m of ev.media) {
      if (m.type === 'PHOTO') {
        items.push({ image: resolveMediaUrl(m.url), alt: ev.title })
      }
    }
  }
  return items
}

function PastEventsContent() {
  const [events, setEvents] = useState<PastApiEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)

  const fetchData = useCallback(() => {
    setLoading(true)
    setError(false)
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 12000)
    )
    Promise.race([getPastEventsWithMedia(), timeout])
      .then(data => { setEvents(data); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [])

  useEffect(() => {
    document.title = 'Past Events | SNT Live Events'
    fetchData()
  }, [fetchData])

  const items = useMemo(() => collectItems(events), [events])

  return (
    <>
      <LoadingGate loading={loading} error={error} onRetry={fetchData} />

      {!loading && !error && (
        <section
          style={{
            paddingLeft:   'var(--headline-padding-x)',
            paddingRight:  'var(--headline-padding-x)',
            paddingTop:    '1.5rem',
            paddingBottom: '4rem',
          }}
        >
          {/* ── Page heading ─────────────────────────────────────── */}
          <div style={{ marginBottom: '2rem' }}>
            <p
              style={{
                fontSize:      '11px',
                fontWeight:    400,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color:         'var(--color-electric-lime)',
                fontFamily:    'var(--font-body)',
                marginBottom:  '0.75rem',
              }}
            >
              Our Work
            </p>
            <h1
              style={{
                fontSize:      'var(--text-heading-sm)',
                fontWeight:    200,
                letterSpacing: '-0.01em',
                lineHeight:    1.1,
                color:         'var(--color-ghost-white)',
                fontFamily:    'var(--font-body)',
              }}
            >
              Past Events.
            </h1>
          </div>

          {/* ── Depth carousel ───────────────────────────────────── */}
          <div style={{ height: 'min(65vh, 620px)', position: 'relative' }}>
            <DepthCarousel
              items={items}
              cardWidth={320}
              cardHeight={420}
              radius={10}
              tint="#000000"
              depth={240}
              spread={105}
              tilt={22}
              tiltDirection="right"
              perspective={1200}
              visibleCards={4}
              falloff={0.27}
              blur={8}
              autoplay
              loop
              autoplayDelay={4000}
              showControls
              showIndicators
            />
          </div>
        </section>
      )}
    </>
  )
}

export default function PastEventsPage() {
  return (
    <Suspense fallback={<div className="bg-black" />}>
      <PastEventsContent />
    </Suspense>
  )
}
