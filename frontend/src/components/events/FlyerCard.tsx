import type { Event } from '@/lib/types'
import PlaceholderMedia from '@/components/ui/PlaceholderMedia'
import CursorGrid from '@/components/ui/CursorGrid'

interface Props { event: Event }

function formatDate(iso: string) {
  if (!iso) return 'Date TBA'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return 'Date TBA'
  return d.toLocaleDateString('en-LK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function computeSoldOut(event: Event): boolean {
  const active = event.ticketPhases?.filter(p => p.isActive)
  if (!active || active.length === 0) return false
  return active.every(p => p.isSoldOut)
}

export default function FlyerCard({ event }: Props) {
  const hasLink = !!event.ticketUrl
  const soldOut = hasLink && computeSoldOut(event)

  return (
    <div className="group block border border-pewter/20 hover:border-pewter/50 transition-colors duration-300 overflow-hidden">
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

      <div className="p-5 border-t border-pewter/20 flex flex-col gap-1.5">
        {event.eventDate && (
          <p className="text-caption text-electric-lime tracking-widest uppercase font-bold">
            {formatDate(event.eventDate)}
          </p>
        )}
        <h3 className="text-body-lg text-ghost-white font-light line-clamp-2">
          {event.title}
        </h3>
        {event.venue && (
          <p className="text-body-sm text-pewter truncate mb-3">{event.venue}</p>
        )}

        {soldOut ? (
          <div className="w-full py-3 border border-red-500/30 text-red-400/60 text-[11px] tracking-[0.2em] uppercase text-center cursor-default select-none">
            Sold Out
          </div>
        ) : hasLink ? (
          <a
            href={event.ticketUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3 bg-electric-lime text-black text-[11px] tracking-[0.2em] uppercase font-bold text-center hover:opacity-90 active:scale-[0.98] transition-all duration-150"
            aria-label={`Buy tickets for ${event.title}`}
          >
            Buy Tickets
          </a>
        ) : (
          <div className="w-full border border-pewter/20" style={{ height: '44px' }}>
            <CursorGrid
              cellSize={30}
              color="#d3fd50"
              gridColor="#d3fd50"
              gridStyle="crosses"
              highlight="area"
              radius={60}
              holdTime={100}
              fadeDuration={400}
              fillOpacity={0.02}
              gridOpacity={0.04}
              spotlight={0.18}
              maxOpacity={0.45}
              edgeFade={0.3}
              lineWidth={0.75}
              intro={false}
              clickPulse={false}
            >
              <div className="w-full h-full flex items-center justify-center text-ghost-white/65 text-[11px] tracking-[0.2em] uppercase select-none">
                Coming Soon
              </div>
            </CursorGrid>
          </div>
        )}
      </div>
    </div>
  )
}
