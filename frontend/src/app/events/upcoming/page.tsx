'use client'

import { useEffect, useState, useCallback } from 'react'
import SplitHeadline from '@/components/ui/SplitHeadline'
import ScrollReveal from '@/components/ui/ScrollReveal'
import FlyerCard from '@/components/events/FlyerCard'
import LoadingGate from '@/components/ui/LoadingGate'
import { upcomingEventsPlaceholder } from '@/lib/eventsConfig'
import { getUpcomingEvents } from '@/lib/api'
import type { Event } from '@/lib/types'

export default function UpcomingEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchData = useCallback(() => {
    setLoading(true)
    setError(false)

    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 12000)
    )

    Promise.race([getUpcomingEvents(), timeout])
      .then((data) => {
        setEvents(data.length > 0 ? data : upcomingEventsPlaceholder)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    document.title = 'Upcoming Events | SNT Live Events'
    fetchData()
  }, [fetchData])

  return (
    <>
      <LoadingGate loading={loading} error={error} onRetry={fetchData} />

      <div className="pb-12" style={{ paddingLeft: 'var(--headline-padding-x)', paddingRight: 'var(--headline-padding-x)' }}>
        <ScrollReveal>
          <p className="text-caption text-electric-lime tracking-widest uppercase mb-6">What&apos;s on</p>
        </ScrollReveal>
        <SplitHeadline
          text="UPCOMING EVENT"
          as="h1"
          className="text-ghost-white font-light mb-16"
          style={{ fontSize: 'var(--text-heading-sm)' }}
        />

        {events.length === 0 ? (
          <p className="text-body text-pewter">No upcoming events at this time. Check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {events.map((event, i) => (
              <ScrollReveal key={event.id} delay={i * 0.06}>
                <FlyerCard event={event} />
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
