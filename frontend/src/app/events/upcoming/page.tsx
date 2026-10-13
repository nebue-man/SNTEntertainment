'use client'

import { useEffect, useState, useCallback } from 'react'
import SplitHeadline from '@/components/ui/SplitHeadline'
import ScrollReveal from '@/components/ui/ScrollReveal'
import FlyerCard from '@/components/events/FlyerCard'
import UpcomingEmptyState from '@/components/events/UpcomingEmptyState'
import LoadingGate from '@/components/ui/LoadingGate'
import { getUpcomingEvents } from '@/lib/api'
import type { Event } from '@/lib/types'

export default function UpcomingEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [eventsIsEmpty, setEventsIsEmpty] = useState(false)
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
        setEvents(data)
        setEventsIsEmpty(data.length === 0)
        setLoading(false)
      })
      .catch(() => {
        setEvents([])
        setEventsIsEmpty(true)
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
          <p className="text-caption text-electric-lime tracking-widest uppercase mb-4 font-bold">Upcoming Event</p>
        </ScrollReveal>
        <SplitHeadline
          text="What's next."
          as="h1"
          className="text-ghost-white font-bold mb-14"
          style={{ fontSize: 'var(--text-heading-sm)' }}
        />

        {eventsIsEmpty ? (
          <UpcomingEmptyState />
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
