import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import SplitHeadline from '@/components/ui/SplitHeadline'
import ScrollReveal from '@/components/ui/ScrollReveal'
import PlaceholderMedia from '@/components/ui/PlaceholderMedia'
import EventTicketSection from './EventTicketSection'
import { getEvent } from '@/lib/api'
import { upcomingEventsPlaceholder } from '@/lib/eventsConfig'
import type { Event } from '@/lib/types'

interface PageProps { params: Promise<{ slug: string }> }

async function fetchEvent(slug: string): Promise<Event | null> {
  try {
    return await getEvent(slug)
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 404) {
      return null
    }
    return upcomingEventsPlaceholder.find((e) => e.slug === slug) ?? null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const event = await fetchEvent(slug)
  if (!event) return { title: 'Event Not Found' }
  return { title: event.title, description: event.description }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-LK', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params
  const event = await fetchEvent(slug)
  if (!event) notFound()

  return (
    <article className="pt-32 pb-24">
      <div style={{ paddingLeft: 'var(--headline-padding-x)', paddingRight: 'var(--headline-padding-x)' }}>

        {/* Flyer + info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <div className="relative border border-pewter/30">
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
                {event.status === 'upcoming' ? 'Upcoming Event' : 'Past Event'}
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
                  {formatDate(event.date)}
                </p>
                <p className="text-body text-pewter">
                  <span className="text-ghost-white">Venue: </span>
                  {event.venue}
                </p>
              </div>
            </ScrollReveal>
            {event.lineup.length > 0 && (
              <ScrollReveal delay={0.15}>
                <div>
                  <p className="text-body-sm text-pewter mb-2 tracking-widest uppercase">Lineup</p>
                  <ul className="flex flex-col gap-1">
                    {event.lineup.map((artist) => (
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
          <div className="max-w-2xl mb-20 border-t border-pewter/20 pt-10">
            <p className="text-caption text-electric-lime tracking-widest uppercase mb-4">About this event</p>
            <p className="text-body text-pewter leading-relaxed">{event.description}</p>
          </div>
        </ScrollReveal>

        {/* Ticket phases — only for upcoming events */}
        {event.status === 'upcoming' && event.ticketPhases && event.ticketPhases.length > 0 && (
          <EventTicketSection
            eventId={event.id}
            phases={event.ticketPhases}
          />
        )}
      </div>
    </article>
  )
}
