import type { Metadata } from 'next'
import { getPastEventsWithMedia } from '@/lib/api'
import PastEventsCoverflow from '@/components/events/PastEventsCoverflow'
import type { PastApiEvent } from '@/lib/types'

export const metadata: Metadata = { title: 'Past Events — SNT' }

export default async function PastEventsPage() {
  let events: PastApiEvent[] = []
  try {
    events = await getPastEventsWithMedia()
  } catch {
    // keep empty — coverflow handles the empty state
  }

  return (
    <main className="min-h-screen bg-black">
      <PastEventsCoverflow events={events} />
    </main>
  )
}
