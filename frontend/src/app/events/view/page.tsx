'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import SplitHeadline from '@/components/ui/SplitHeadline'
import ScrollReveal from '@/components/ui/ScrollReveal'
import PlaceholderMedia from '@/components/ui/PlaceholderMedia'
import EventTicketSection from '@/components/events/EventTicketSection'
import LoadingGate from '@/components/ui/LoadingGate'
import { getEvent } from '@/lib/api'
import type { Event } from '@/lib/types'

function formatDate(iso: string) {
  if (!iso) return 'Date TBA'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return 'Date TBA'
  return d.toLocaleDateString('en-LK', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })
}

function EventDetail() {
  const searchParams = useSearchParams()
  const slug = searchParams.get('slug') ?? ''
  const [event, setEvent] = useState<Event | null>(null)
  const [fetchStatus, setFetchStatus] = useState<'loading' | 'found' | 'not-found' | 'error'>('loading')

  const fetchData = useCallback(() => {
    if (!slug) {
      setFetchStatus('not-found')
      return
    }

    setFetchStatus('loading')

    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 12000)
    )

    Promise.race([getEvent(slug), timeout])
      .then((e) => {
        setEvent(e)
        document.title = `${e.title} | SNT Live Events`
        setFetchStatus('found')
      })
      .catch((err: unknown) => {
        const status = (err as { status?: number }).status
        if (status === 404) {
          setFetchStatus('not-found')
        } else {
          setFetchStatus('error')
        }
      })
  }, [slug])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (fetchStatus === 'not-found') {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="text-center">
          <p className="text-caption text-electric-lime tracking-widest uppercase mb-4">Not found</p>
          <p className="text-body text-pewter">This event doesn&apos;t exist or has been removed.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <LoadingGate
        loading={fetchStatus === 'loading'}
        error={fetchStatus === 'error'}
        onRetry={fetchData}
      />

      {fetchStatus === 'found' && event && (
        <article className="pb-24">
          <div style={{ paddingLeft: 'var(--headline-padding-x)', paddingRight: 'var(--headline-padding-x)' }}>

            {/* Flyer + info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
              <div className="relative border border-pewter/20">
                {event.flyerUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={event.flyerUrl}
                    alt={`${event.title} flyer`}
                    className="w-full aspect-[3/4] object-contain"
                  />
                ) : (
                  <PlaceholderMedia
                    label={`${event.title} — flyer image (replace with client asset)`}
                    aspectRatio="3/4"
                    type="image"
                  />
                )}
              </div>

              <div className="flex flex-col justify-end gap-6">
                <ScrollReveal>
                  <p className="text-caption text-electric-lime tracking-widest uppercase">
                    {event.status === 'UPCOMING' ? 'Upcoming Event' : 'Past Event'}
                  </p>
                </ScrollReveal>
                <SplitHeadline
                  text={event.title}
                  as="h1"
                  className="text-ghost-white font-light"
                  style={{ fontSize: 'var(--text-heading-sm)' }}
                />
                <ScrollReveal delay={0.1}>
                  <div className="flex flex-col gap-2">
                    <p className="text-body text-pewter">
                      <span className="text-ghost-white">Date: </span>
                      {formatDate(event.eventDate)}
                    </p>
                    <p className="text-body text-pewter">
                      <span className="text-ghost-white">Venue: </span>
                      {event.venue}
                    </p>
                  </div>
                </ScrollReveal>
                {event.status === 'UPCOMING' && (
                  <ScrollReveal delay={0.15}>
                    {event.ticketUrl ? (
                      <a
                        href={event.ticketUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-electric-lime text-absolute-zero text-[11px] tracking-[0.2em] uppercase font-medium hover:opacity-85 transition-opacity"
                      >
                        Buy Tickets
                      </a>
                    ) : (
                      <span className="inline-flex items-center px-8 py-3 border border-pewter/25 text-pewter/50 text-[11px] tracking-[0.2em] uppercase cursor-not-allowed select-none">
                        Coming Soon
                      </span>
                    )}
                  </ScrollReveal>
                )}
                {(event.lineup?.length ?? 0) > 0 && (
                  <ScrollReveal delay={0.15}>
                    <div>
                      <p className="text-body-sm text-pewter mb-2 tracking-widest uppercase">Lineup</p>
                      <ul className="flex flex-col gap-1">
                        {event.lineup?.map((artist) => (
                          <li key={artist} className="text-body-lg text-ghost-white font-light">
                            {artist}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </ScrollReveal>
                )}
              </div>
            </div>

            {/* Description */}
            <ScrollReveal>
              <div className="max-w-2xl mb-20 border-t border-pewter/20 pt-16">
                <p className="text-caption text-electric-lime tracking-widest uppercase mb-4">About this event</p>
                <p className="text-body text-pewter leading-relaxed">{event.description}</p>
              </div>
            </ScrollReveal>

            {/* Ticket phases — only for upcoming events */}
            {event.status === 'UPCOMING' && event.ticketPhases && event.ticketPhases.length > 0 && (
              <EventTicketSection
                eventId={event.id}
                phases={event.ticketPhases}
              />
            )}
          </div>
        </article>
      )}
    </>
  )
}

export default function EventViewPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 z-[9999] bg-absolute-zero" />
      }
    >
      <EventDetail />
    </Suspense>
  )
}
