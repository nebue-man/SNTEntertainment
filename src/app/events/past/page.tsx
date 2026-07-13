import type { Metadata } from 'next'
import SplitHeadline from '@/components/ui/SplitHeadline'
import ScrollReveal from '@/components/ui/ScrollReveal'
import EventsGallery from '@/components/events/EventsGallery'
import { pastMediaGallery } from '@/lib/mediaConfig'
import { getPastEvents } from '@/lib/api'
import type { MediaItem } from '@/lib/types'

export const metadata: Metadata = { title: 'Past Events' }

async function fetchPastMedia(): Promise<MediaItem[]> {
  try {
    const events = await getPastEvents()
    const items: MediaItem[] = events.flatMap((ev) =>
      (ev.media ?? []).map((m, idx) => ({
        id: `${ev.id}-media-${idx}`,
        type: m.type,
        src: m.url,
        alt: m.alt,
        year: new Date(ev.date).getFullYear(),
        eventTitle: ev.title,
      }))
    )
    return items.length > 0 ? items : pastMediaGallery
  } catch {
    return pastMediaGallery
  }
}

export default async function PastEventsPage() {
  const items = await fetchPastMedia()

  return (
    <div className="pt-32 pb-24">
      <div style={{ paddingLeft: 'var(--headline-padding-x)', paddingRight: 'var(--headline-padding-x)' }}>
        <ScrollReveal>
          <p className="text-caption text-electric-lime tracking-widest uppercase mb-6">Portfolio</p>
        </ScrollReveal>
        <SplitHeadline
          text="Past Events"
          as="h1"
          className="text-ghost-white font-light mb-16"
          style={{ fontSize: 'var(--text-heading-sm)' }}
        />
        <EventsGallery items={items} />
      </div>
    </div>
  )
}
