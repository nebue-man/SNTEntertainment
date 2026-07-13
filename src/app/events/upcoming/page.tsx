import type { Metadata } from 'next'
import SplitHeadline from '@/components/ui/SplitHeadline'
import ScrollReveal from '@/components/ui/ScrollReveal'
import FlyerCard from '@/components/events/FlyerCard'
import { upcomingEventsPlaceholder } from '@/lib/eventsConfig'
import { getUpcomingEvents } from '@/lib/api'
import type { Event } from '@/lib/types'

export const metadata: Metadata = { title: 'Upcoming Events' }

async function fetchUpcoming(): Promise<Event[]> {
  try {
    const events = await getUpcomingEvents()
    return events.length > 0 ? events : upcomingEventsPlaceholder
  } catch {
    return upcomingEventsPlaceholder
  }
}

export default async function UpcomingEventsPage() {
  const events = await fetchUpcoming()

  return (
    <div className="pt-32 pb-24" style={{ paddingLeft: 'var(--headline-padding-x)', paddingRight: 'var(--headline-padding-x)' }}>
      <ScrollReveal>
        <p className="text-caption text-electric-lime tracking-widest uppercase mb-6">What&apos;s on</p>
      </ScrollReveal>
      <SplitHeadline
        text="Upcoming Events"
        as="h1"
        className="text-ghost-white font-light mb-16"
        style={{ fontSize: 'var(--text-heading-sm)' }}
      />

      {events.length === 0 ? (
        <p className="text-body text-pewter">No upcoming events at this time. Check back soon.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {events.map((event, i) => (
            <ScrollReveal key={event.id} delay={i * 0.06}>
              <FlyerCard event={event} />
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  )
}
