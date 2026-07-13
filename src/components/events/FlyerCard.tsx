import Link from 'next/link'
import type { Event } from '@/lib/types'

interface Props { event: Event }

export default function FlyerCard({ event }: Props) {
  return (
    <Link href={`/events/${event.slug}`} className="block border border-pewter/30 p-4">
      <p className="text-body text-ghost-white">{event.title}</p>
      <p className="text-caption text-pewter">{event.venue}</p>
    </Link>
  )
}
