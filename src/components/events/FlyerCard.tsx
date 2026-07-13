import Link from 'next/link'
import type { Event } from '@/lib/types'
import PlaceholderMedia from '@/components/ui/PlaceholderMedia'

interface Props { event: Event }

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-LK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function FlyerCard({ event }: Props) {
  return (
    <Link
      href={`/events/${event.slug}`}
      className="group block border border-pewter/30 hover:border-ghost-white transition-colors overflow-hidden"
      aria-label={`${event.title} — ${formatDate(event.date)}`}
    >
      <div className="aspect-[3/4] relative bg-absolute-zero overflow-hidden">
        {event.flyerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.flyerUrl}
            alt={`${event.title} event flyer`}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <PlaceholderMedia
            label={`${event.title} — flyer image (replace with client asset)`}
            aspectRatio="3/4"
            type="image"
            className="w-full h-full"
          />
        )}
      </div>

      <div className="p-4 border-t border-pewter/30 flex flex-col gap-1">
        <p className="text-caption text-electric-lime tracking-widest uppercase">
          {formatDate(event.date)}
        </p>
        <h3 className="text-body-lg text-ghost-white font-light group-hover:text-electric-lime transition-colors line-clamp-2">
          {event.title}
        </h3>
        <p className="text-body-sm text-pewter truncate">{event.venue}</p>
      </div>
    </Link>
  )
}
